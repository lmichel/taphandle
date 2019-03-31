package test;

import java.io.FileReader;
import java.io.FileWriter;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;

import metabase.DataTreePath;

public class TestDataTreePath {

	public static void main(String[] args) throws Exception {		
		System.out.println(new DataTreePath("table", ""));
		System.out.println(new DataTreePath(".table", ""));
		System.out.println(new DataTreePath("schema.table", ""));
		System.out.println(new DataTreePath(".schema.table", ""));
		System.out.println(new DataTreePath("base.schema.table", ""));
		System.out.println(new DataTreePath("\"base.schema.table\"", ""));
		System.out.println(new DataTreePath("\"base\".\"schema\".\"table\"", ""));
		System.out.println(new DataTreePath("base.\"schema\".\"table\"", ""));
		System.out.println(new DataTreePath("\"zerr././.\".AAAA.\"BBBB\".\"CC\\C\"", ""));
		System.out.println(new DataTreePath("\"AAAA\".\"BBBB\".\"CCCC\"", ""));
		System.out.println(new DataTreePath("AAAA.\"BBBB\".\"CCCC\"", ""));
		System.out.println(new DataTreePath("viz7" ,"J/other/NewA/35.48/table2", ""));
		System.out.println(new DataTreePath("a/BB" ,"matable", ""));
		System.out.println(new DataTreePath("public" ,"matable", ""));
		String fn = "/tmp/meta/tables.json";
        JSONParser parser = new JSONParser();
        Object obj = parser.parse(new FileReader(fn));

        JSONObject jsonObject = (JSONObject) obj;
        JSONArray schemas = (JSONArray) jsonObject.get("schemas");
        for( int s=0 ; s<schemas.size() ; s++){
        	JSONObject schema = (JSONObject) schemas.get(s);
            JSONArray tables = (JSONArray) schema.get("tables");
        	System.out.println(schema.get("name"));

            for( int t=0 ; t<tables.size() ; t++){
            	JSONObject table = (JSONObject) tables.get(t);
            	DataTreePath dtp = new DataTreePath(schema.get("name").toString(), (String)(table.get("name")), (String)(table.get("description")));
            	System.out.println(dtp);
            	table.put("tablename", dtp.getTable());
            	table.put("pathname", dtp.getSchema());
        		System.out.println((new DataTreePath((String)(table.get("pathname")) + "." + (String)(table.get("name")), (String)(table.get("description")))));

            }
        }
    	FileWriter fw = new FileWriter("/tmp/meta/tables.quoted.json");
    	fw.write(jsonObject.toJSONString());
    	fw.close();

	}
}
