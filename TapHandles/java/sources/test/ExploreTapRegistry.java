package test;


import java.io.BufferedReader;
import java.io.FileReader;
import java.util.Map;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;

import resources.RootClass;
import session.NodeCookie;
import tapaccess.TapAccess;
import translator.XmlToJson;

/**
 * @author laurent
 * @version $Id: AsyncJobTest.java 159 2012-10-10 11:52:54Z laurent.mistahl $
 *
 */
public class ExploreTapRegistry  extends RootClass {


	private static void usage() {
		logger.error("USAGE: AsyncJobTest [url] [query]");
		System.exit(1);
	}
	/**
	 * @param args
	 * @throws Exception 
	 */
	public static void main(String[] args) throws Exception {

		String node = "http://dc.zah.uni-heidelberg.de/__system__/tap/run/tap/";
		String query = "SELECT ivoid, access_url, res_title\n"
		+ "FROM rr.capability \n"
		+ "  NATURAL JOIN rr.interface\n"
		+ "  NATURAL JOIN rr.resource\n"
//		+ "  NATURAL JOIN rr.table_column\n"
//		+ "  NATURAL JOIN rr.res_table\n"
		+ "WHERE standard_id='ivo://ivoa.net/std/tap' AND intf_type = 'vs:paramhttp' ";
			NodeCookie cookie=new NodeCookie();
		String outFile = TapAccess.runSyncJob(node, query, "/home/michel/Desktop/job.xml", cookie, null);
		XmlToJson.translateResultTable("/home/michel/Desktop/job.xml", "/home/michel/Desktop/job.json");
		
		BufferedReader br = new BufferedReader(new FileReader("/home/michel/Desktop/job.json"));
		JSONParser p = new JSONParser();
		JSONObject jsonObject = (JSONObject) p.parse(br);
		JSONArray array = (JSONArray) jsonObject.get("aaData");
		for( int i=0 ; i<array.size() ; i++) {
			JSONArray sa = (JSONArray) array.get(i);
			System.out.println("");
			for( int j=0 ; j<sa.size() ; j++) {
				if( j == 0 ) {
					String[] pe =  ((String)(sa.get(j))).split("/");
					System.out.print(pe[2] + "/-/" + pe[pe.length - 1]+ "\t");
				}
				System.out.print(sa.get(j) + "\t");
			}
		}

	}


}
