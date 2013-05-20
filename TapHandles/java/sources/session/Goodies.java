package session;

import java.io.File;

import org.apache.commons.io.FileUtils;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

import resources.RootClass;

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
		validWorkingDirectory(this.baseDirectory );
		this.baseDirectory = baseDirectory;
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
		String dirName =  this.baseDirectory + WEB_USER_GOODIES_DIR +File.separator + nodeKey;
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
		while(f.exists() ); {
			cpt++;
			gn = goodiesName + "(" + cpt + ")";
			fileName =  this.baseDirectory + WEB_USER_GOODIES_LIST+File.separator + gn;
			f = new File(fileName);
		} 
		return fileName;
	}

	/**
	 * Return a JSON descriptiion of the Goodies content
	 * Retuned JSON is [{nodekey:"..", tables: ["...", "..."]}, ....] 
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public JSONArray getJsonContent() {
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
					jtables.add(table);
				}
				jnode.put("tables", jtables);
				retour.add(jnode);
			}
		}		
		return retour;
	}

}
