package session;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
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
		String dirName =  this.baseDirectory + WEB_USER_GOODIES_LIST +File.separator + nodeKey;
		validWorkingDirectory(dirName );
		FileUtils.copyFile(
				new File(jobPath +File.separator  + VOTABLE_JOB_RESULT)
				, new File(dirName +File.separator  + ((goodiesName.endsWith(".xml"))? goodiesName: goodiesName + ".xml") )
		);
	}

	/**
	 * Returns the full pathname of to file goodiesName stored into the goodies position list.
	 * The returned path must match a non existing file. If the file already exists, it is appended
	 * with a number in ()
	 * @param goodiesName
	 * @return
	 * @throws Exception
	 */
	public String getNewUserListPath(String goodiesName) throws Exception{
		int cpt = 0;
		String gn = goodiesName;
		String fileName  =  this.baseDirectory + WEB_USER_GOODIES_LIST+File.separator + goodiesName;
		File f = new File(fileName);
		while( f.exists() ) {
			cpt++;
			gn = goodiesName + "(" + cpt + ")";
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
		return processUserList( item.getName());
	}

	/**
	 * Public for debug purpose can be run without reference to FileItem
	 * @param listName
	 * @return
	 * @throws Exception
	 */
	public String processUserList(String listName)  throws Exception{
		GoodiesIngestor gi = new GoodiesIngestor(this.baseDirectory + WEB_USER_GOODIES_LIST, listName);
		gi.ingestUserList();
		return gi.getReport();		
	}
	
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
