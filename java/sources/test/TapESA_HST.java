package test;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.RandomAccessFile;
import java.io.Writer;
import java.net.URL;
import java.net.URLConnection;

import metabase.DataTreePath;
import metabase.TapNode;

import org.apache.commons.io.IOUtils;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;

import registry.RegistryMark;
import resources.RootClass;

/**
 * Program testing Vizier TAP access
 * @author michel
 *
 */
public class TapESA_HST  extends RootClass {
	private static final String baseDir = System.getProperty("java.io.tmpdir") ;
	private static final String baseUrlN = "http://hst.esac.esa.int/tap-server/tap";

	public static final URLConnection getUrlConnection(URL url) throws IOException{
		URLConnection conn = url.openConnection();
		conn.setConnectTimeout(5000);		
		conn.setReadTimeout(60000);
		return conn;
	}

	public static void main(String[] args) throws Exception {
		

		validWorkingDirectory(baseDir + "/nodebase");

		
		RegistryMark rm = new RegistryMark("HESAC", " ", baseUrlN, "test", false, true);
		TapNode tn = new TapNode(rm, "/tmp/meta");

		JSONParser parser = new JSONParser();
		Object obj = parser.parse(new FileReader(tn.getBaseDirectory() + "tables.json"));
		JSONObject jsonObject = (JSONObject) obj;
		JSONArray schemas = (JSONArray) jsonObject.get("schemas");
		int gen = 0;
		for(Object sn: schemas) {
			JSONObject s = (JSONObject)sn;
            System.out.println("schema " + s.get("name"));
			if( ((String)(s.get("name"))).equals("gaiadr1") ) {
				JSONArray tables = (JSONArray) s.get("tables");
				for( Object ts: tables) {
					JSONObject t = (JSONObject)ts;
					if( ((String)(t.get("name"))).endsWith("gaia_source") ) {
						System.out.println("found");
						DataTreePath dataTreePath = new DataTreePath(s.get("name").toString(), (String)t.get("name"), "");
						tn.buildJsonTableAttributes(dataTreePath);
						tn.buildJsonTableDescription(dataTreePath);
					}
				}
			}
//			JSONObject s = (JSONObject)sn;
//			System.out.println("*********** " + s.get("name"));
//			JSONArray tables = (JSONArray) s.get("tables");
//			int cpt = 0;
//			for( Object ts: tables) {
//				JSONObject t = (JSONObject)ts;
//				cpt++;
//				gen++;
//				if( cpt < 5 || cpt >= 5) {
//					System.out.println("    " + cpt + "/" + gen + " " + t.get("name"));
//					DataTreePath dataTreePath = new DataTreePath(s.get("name").toString(), (String)t.get("name"), "");
//					tn.buildJsonTableAttributes(dataTreePath);
//					tn.buildJsonTableDescription(dataTreePath);
//					System.exit(1);
//				}
//			}
		}	
		System.out.println(tn.filterTableList(2).toJSONString());
	}
}
