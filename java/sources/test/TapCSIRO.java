package test;

import java.io.FileReader;

import metabase.DataTreePath;
import metabase.TapNode;

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
public class TapCSIRO  extends RootClass {
	private static final String baseDir = System.getProperty("java.io.tmpdir") ;
	private static final String baseUrlN = "http://atoavo.atnf.csiro.au/tap/";

	public static void main(String[] args) throws Exception {
		validWorkingDirectory(baseDir + "/nodebase");

		
		RegistryMark rm = new RegistryMark("CSIRO", " ", baseUrlN, "test", false, true);
		TapNode tn = new TapNode(rm, "/tmp/meta");

		JSONParser parser = new JSONParser();
		Object obj = parser.parse(new FileReader(tn.getBaseDirectory() + "tables.json"));
		JSONObject jsonObject = (JSONObject) obj;
		JSONArray schemas = (JSONArray) jsonObject.get("schemas");
		int gen = 0;
		for(Object sn: schemas) {
			JSONObject s = (JSONObject)sn;

			if( ((String)(s.get("name"))).equals("dmubin") ) {
				JSONArray tables = (JSONArray) s.get("tables");
				for( Object ts: tables) {
					JSONObject t = (JSONObject)ts;
					if( ((String)(t.get("name"))).endsWith("main") ) {
						System.out.println("found");
						DataTreePath dataTreePath = new DataTreePath(s.get("name").toString(), (String)t.get("name"), "");
						tn.buildJsonTableAttributes(dataTreePath);
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
