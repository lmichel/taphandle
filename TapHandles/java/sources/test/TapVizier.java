package test;

import java.io.FileReader;

import metabase.NodeMap;
import metabase.TapNode;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;

import resources.RootClass;

/**
 * Program testing Vizier TAP access
 * @author michel
 *
 */
public class TapVizier  extends RootClass {
	private static final String baseDir = "/home/michel/Desktop/tapvizier/";
	private static final NodeMap nodeMap = new NodeMap();

	public static void main(String[] args) throws Exception {
		NodeMap.switchToContext(baseDir);
		nodeMap.addNode("http://tapvizier.u-strasbg.fr/TAPVizieR/tap/", "vizier");
		TapNode tn  = nodeMap.getNode("vizier");		

		JSONParser parser = new JSONParser();
		Object obj = parser.parse(new FileReader(tn.getBaseDirectory() + "tables.json"));
		JSONObject jsonObject = (JSONObject) obj;
		JSONArray schemas = (JSONArray) jsonObject.get("schemas");
		for(Object sn: schemas) {
			JSONObject s = (JSONObject)sn;
			System.out.println("*********** " + s.get("name"));
			JSONArray tables = (JSONArray) s.get("tables");
			int cpt = 0;
			for( Object ts: tables) {
				JSONObject t = (JSONObject)ts;
				cpt++;
				if( cpt < 5 ) {
					System.out.println("    " + cpt + " " + t.get("name"));
					//tn.buildJsonTableAttributes((String) t.get("name"));
				}
			}
		}	
		System.out.println(tn.filterTableList(2).toJSONString());
	}
}
