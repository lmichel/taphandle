package test;

import java.io.IOException;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

import resources.RootClass;
import session.Goodies;
import translator.GoodiesIngestor;


public class GoodiesTester extends RootClass {

	/**
	 * @param args
	 * @throws IOException 
	 */
	public static void main(String[] args) throws Exception {
		String base = "/Users/laurentmichel/Desktop/goodies/";
		
		Goodies g = new Goodies(base);
		g.processUserList("list.pos");		
		JSONArray jso;
		jso = g.getJsonContent();
		System.out.println(jso.toJSONString());
		g.processUserList("list2.pos");		
		jso = g.getJsonContent();
		System.out.println(jso.toJSONString());
		g.dropUserList("list.pos");
		jso = g.getJsonContent();
		System.out.println(jso.toJSONString());

	}

}
