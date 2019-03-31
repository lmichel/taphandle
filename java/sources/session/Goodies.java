package session;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.io.FileUtils;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

import resources.RootClass;
import translator.GoodiesIngestor;

/**
 * @author laurentmichel
 *
 */
public  class Goodies extends RootClass{
	private final String baseDirectory;
	//TODO find a way to import radius
	private int radius = 3;

	/**
	 * @param baseDirectory
	 * @throws Exception
	 */
	public Goodies(String baseDirectory) throws Exception {
		super();
		this.baseDirectory = baseDirectory;
		validWorkingDirectory(this.baseDirectory );
		validWorkingDirectory(this.baseDirectory + WEB_USER_GOODIES_LIST);
	}

	/**
	 * Copy the result of the job nodeKey.jobID into the goodies directory under the name
	 * goodiesName. xml suffix is added if not present
	 * @param nodeKey nodekey the job comes from
	 * @param jobPath   full path of the JOb result file
	 * @param goodiesName job new name
	 * @throws Exception
	 */
	protected void pushJobResultInGoodies(String nodeKey, String jobPath, String goodiesName) throws Exception{
		String dirName =  this.baseDirectory + WEB_USER_GOODIES_JOB;
		validWorkingDirectory(dirName );
		dirName += File.separator + nodeKey;
		validWorkingDirectory(dirName );
		String[] splitBaseDir = this.baseDirectory.split("/"); 
		String basedir ="";
		int i=0;
		while(i < splitBaseDir.length -3){
			basedir += splitBaseDir[i];
			basedir += "/";
			i++;
		}
			
		logger.debug("@@@@ "+ basedir + jobPath);
		FileUtils.copyFile(
				new File(basedir + jobPath +File.separator  + VOTABLE_JOB_RESULT)
				, new File(dirName +File.separator  + ((goodiesName.endsWith(".xml"))? goodiesName: goodiesName + ".xml") )
		);
	}

	/**
	 * Returns the full pathname of to file goodiesName stored into the goodies position list.
	 * The returned path must match a non existing file. If the file already exists, it is appended
	 * with a number at the end
	 * @param goodiesName
	 * @return
	 * @throws Exception
	 */
	public String getNewUserListPath(String goodiesName) throws Exception{
		int cpt = 0;
		logger.debug("get " + goodiesName);
		String gn = goodiesName;
		String fileName  =  this.baseDirectory + WEB_USER_GOODIES_LIST+File.separator + goodiesName;
		File f = new File(fileName);
		while( f.exists() ) {
			cpt++;
			gn = goodiesName + "_" + cpt;
			fileName =  this.baseDirectory + WEB_USER_GOODIES_LIST+File.separator + gn;
			f = new File(fileName);
		} 
		return fileName;
	}

	/**
	 * @param item
	 * @throws Exception 
	 */
	public String ingestUserList(FileItem item) throws Exception{
		File f = new File(this.getNewUserListPath(item.getName()));
		item.write(f);
		return processUserList( f.getName());
	}

	/**
	 * Returns the JSON description of the list listName as it is stored on disk
	 * @param listName
	 * @return
	 * @throws Exception
	 */
	public String getListReportFromDisk(String listName) throws Exception{
		GoodiesIngestor gi = new GoodiesIngestor(this.baseDirectory + WEB_USER_GOODIES_LIST, listName, radius);
		return gi.getReportFromDisk();	
	}

	/**
	 * Public for debug purpose can be run without reference to FileItem
	 * @param listName
	 * @return
	 * @throws Exception
	 */
	public String processUserList(String listName)  throws Exception{ 
		GoodiesIngestor gi = new GoodiesIngestor(this.baseDirectory + WEB_USER_GOODIES_LIST, listName, radius);
		String[] fSplitName = listName.replaceAll("[\\.\\(\\)]", "_").split("_");		
		String ext = "xml";
	
		if(fSplitName[fSplitName.length -1].equalsIgnoreCase(ext)){
			logger.debug("Upload is already a VOTable");
			gi.ingestUserList(listName,listName.replaceAll("_xml", ".json").replaceAll(".xml", ".json"));
			return gi.getReport();
		}else{
			gi.ingestUserList();
			return gi.getReport();	
		}
	}
	
	/**
	 * Remove the user's list named name
	 * @param name
	 * @throws Exception
	 */
	public void dropUserList(String name) throws Exception{
		JSONObject report = this.getJsonContent(WEB_USER_GOODIES_LIST, name + ".json");
		File f = new File(this.baseDirectory + WEB_USER_GOODIES_LIST + File.separator + report.get("nameOrg")) ;
		if( f.exists() ) {
			logger.info("Remove file " + f.getAbsolutePath());
			f.delete();
		}
		f = new File(this.baseDirectory + WEB_USER_GOODIES_LIST + File.separator + report.get("nameVot")) ;
		if( f.exists() ) {
			logger.info("Remove file " + f.getAbsolutePath());
			f.delete();
		}
		f = new File(this.baseDirectory + WEB_USER_GOODIES_LIST + File.separator + report.get("nameReport")) ;
		if( f.exists() ) {
			logger.info("Remove file " + f.getAbsolutePath());
			f.delete();
		}
	}
	
	
	public void dropUserJob(String node, String jobname) throws Exception{
		File f = new File(this.baseDirectory + WEB_USER_GOODIES_JOB + File.separator + node +  File.separator + jobname);
		if( f.exists() ) {
			logger.info("Remove file " + f.getAbsolutePath());
			f.delete();
		}
	}
	
	/**
	 * Return a JSON description of the Goodies content
	 * Retuned JSON is [{nodekey:"..", posLists: [{"positions", "date", "nameOrg", "nameVot", "nameReport}, ....] 
	 * @return
	 * @throws Exception 
	 * @throws IOException 
	 * @throws FileNotFoundException 
	 */
	@SuppressWarnings("unchecked")
	public JSONArray getJsonContent() throws Exception {
		JSONArray retour = new JSONArray();

		String[] nodes = (new File(this.baseDirectory)).list();
		for( String node: nodes) {
			String ndir = this.baseDirectory + File.separator + node;
			if( (new File(ndir)).isDirectory()) {
				JSONObject jnode  = new JSONObject();
				jnode.put("nodekey", node);
				JSONArray jtables = new JSONArray();
				String[] tables = (new File(ndir)).list();
				for( String table: tables){					
					if( table.endsWith(".json") ){
						JSONObject jslist  = this.getJsonContent(node, table);
						if ( jslist  != null ){
							jtables.add(jslist);
						}
					}
				}
				jnode.put("posLists", jtables);
				retour.add(jnode);
			}
		}		
		return retour;
	}

	/**
	 * Returns the JSON description contained in the file table from the node WEB_USER_GOODIES_LIST
	 * Returned JSON is {"positions", "date", "nameOrg", "nameVot", "nameReport}
	 * @param table
	 * @return
	 * @throws Exception
	 */
	public JSONObject getUserListReport(String table) throws Exception {
		return getJsonContent(WEB_USER_GOODIES_LIST, table);
	}
	
	public JSONObject getAllUserList() throws Exception{
		JSONObject retour  = new JSONObject();
		
		//Add all list upload
		JSONArray tab = new JSONArray();
		String [] listefichiers; 
		File repertoire = new File(this.baseDirectory + WEB_USER_GOODIES_LIST);
		logger.debug("folder : " + repertoire.getAbsolutePath());
		int i; 
		listefichiers = repertoire.list();
		if(listefichiers != null){
			for(i=0;i<listefichiers.length;i++){ 
				if(listefichiers[i].endsWith("xml")==true){
					JSONObject list = new JSONObject();
					list.put("filename", listefichiers[i].toString() );
					list.put("decription", "No description available");
					tab.add(list);
				}
			}
		}
		retour.put(WEB_USER_GOODIES_LIST, tab);
		
		JSONObject jobs = new JSONObject();
		File repertoireJobs = new File(this.baseDirectory + WEB_USER_GOODIES_JOB);
		listefichiers = repertoireJobs.list();
		String [] joblist;
		if(listefichiers != null){
			for(i=0;i<listefichiers.length;i++){ 
				JSONArray job = new JSONArray();
				File repertoireJob = new File(this.baseDirectory + WEB_USER_GOODIES_JOB + "/"+ listefichiers[i]);
				logger.debug("folder : " + repertoireJob.getAbsolutePath());
				joblist = repertoireJob.list();
				for(int j=0;j<joblist.length;j++){
					String s = joblist[j].toString();
					
					System.out.println(s);
					JSONObject a = new JSONObject();
					a.put("jobnumber", joblist[j]);
					a.put("filename", "result.xml");
					a.put("description", "No description available");
					job.add(a);
				
			}
			if(!job.isEmpty()){
				jobs.put(listefichiers[i],job);
			}
		}
		}		
		
		retour.put("myJobs", jobs);
		return retour;
	}

	/**
	 * Returns the JSON description contained in the file table from the node table
	 * Returned JSON is {"positions", "date", "nameOrg", "nameVot", "nameReport}
	 * @param node
	 * @param table
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	private JSONObject getJsonContent(String node, String table) throws Exception {
		String ndir = this.baseDirectory + File.separator + node;
		JSONObject jslist  = new JSONObject();
		JSONParser parser = new JSONParser();
		Object obj = parser.parse(new FileReader(ndir + File.separator + table));
		JSONObject jsonObject = (JSONObject) obj;
		for( String k: new String[]{"nameReport", "nameVot", "nameOrg", "positions", "date"}){
			Object str;
			if( (str = jsonObject.get(k)) == null ) {
				return null;
			} else {
				jslist.put(k, str);
			}
		}
		return jslist;
	}
}
