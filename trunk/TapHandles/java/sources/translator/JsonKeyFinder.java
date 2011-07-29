/**
 * 
 */
package translator;

import java.io.IOException;
import java.util.ArrayList;

import org.json.simple.parser.ContentHandler;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

import resources.RootClass;

/**
 * courtesy of {@link http://code.google.com/p/json-simple/wiki/DecodingExamples JSONSimple}
 * @author laurent
 * @version $Id: JsonKeyFinder.java 46 2011-07-26 12:55:13Z laurent.mistahl $
 */
public class JsonKeyFinder extends RootClass implements ContentHandler{
	private Object value;
	private boolean found = false;
	private boolean end = false;
	private String key;
	private String matchKey;

	public void setMatchKey(String matchKey){
		this.matchKey = matchKey;
	}

	public Object getValue(){
		return value;
	}

	public boolean isEnd(){
		return end;
	}

	public void setFound(boolean found){
		this.found = found;
	}

	public boolean isFound(){
		return found;
	}

	public void startJSON() throws ParseException, IOException {
		found = false;
		end = false;
	}

	public void endJSON() throws ParseException, IOException {
		end = true;
	}

	public boolean primitive(Object value) throws ParseException, IOException {
		if(key != null){
			if(key.equals(matchKey)){
				found = true;
				this.value = value;
				key = null;
				return false;
			}
		}
		return true;
	}

	public boolean startArray() throws ParseException, IOException {
		return true;
	}


	public boolean startObject() throws ParseException, IOException {
		return true;
	}

	public boolean startObjectEntry(String key) throws ParseException, IOException {
		this.key = key;
		return true;
	}

	public boolean endArray() throws ParseException, IOException {
		return false;
	}

	public boolean endObject() throws ParseException, IOException {
		return true;
	}

	public boolean endObjectEntry() throws ParseException, IOException {
		return true;
	}

	public static String[] findKeys(String jsonText, String key) throws ParseException {
		JSONParser parser = new JSONParser();
		JsonKeyFinder finder = new JsonKeyFinder();
		finder.setMatchKey(key);
		ArrayList<String> retour = new ArrayList<String> ();
		while(!finder.isEnd()){
			parser.parse(jsonText, finder, true);
			if(finder.isFound()){
				finder.setFound(false);
				retour.add(finder.getValue().toString());
			}
		}   
		return retour.toArray(new String[0]);
	}
	/**
	 * @param args
	 */
	public static void main(String[] args) {
		String jsonText = "{\"first\": 123, \"second\": [{\"k1\":{\"id\":\"id1\"}}, 4, 5, 6, {\"id\": 123}], \"third\": 789, \"id\": null}";
		JSONParser parser = new JSONParser();
		JsonKeyFinder finder = new JsonKeyFinder();
		finder.setMatchKey("id");
		try{
			while(!finder.isEnd()){
				parser.parse(jsonText, finder, true);
				if(finder.isFound()){
					finder.setFound(false);
					System.out.println("found id:");
					System.out.println(finder.getValue());
				}
			}           
		}
		catch(ParseException pe){
			pe.printStackTrace();
		}

	}

}
