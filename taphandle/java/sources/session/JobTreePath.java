package session;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.JSONValue;

import resources.RootClass;
import tapaccess.TapException;

/**
 * @author laurent
 * @version $Id$
 */
public class JobTreePath extends RootClass{
	
	private String nodekey;
	private String schema;
	private String table;
	
	public JobTreePath(File jsonfile) throws Exception {
		BufferedReader br = new BufferedReader(new FileReader(jsonfile));
		String buff;
		StringBuffer jsonstring = new StringBuffer();
		while( (buff = br.readLine()) != null ) {
			jsonstring.append(buff);
		}
		br.close();
		Object obj=JSONValue.parse(jsonstring.toString());
		JSONArray array = (JSONArray) ((JSONObject)obj).get("path");
		this.nodekey = (String) array.get(0);
		this.schema = (String) array.get(1);
		this.table = (String) array.get(2);
	}
	public JobTreePath(String  treePath) throws Exception {
		String[] pts = treePath.split("[\\s;:]");
		if( pts.length != 3 ) {
			throw new TapException(treePath + " badly formated");
		}
		this.nodekey = pts[0];
		this.schema = pts[1];
		this.table = pts[2];		
	}
	public String getNodekey() {
		return nodekey;
	}
	public String getSchema() {
		return schema;
	}
	public String getTable() {
		return table;
	}

}
