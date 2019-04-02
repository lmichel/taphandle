/**
 * 
 */
package cart;

import java.util.Iterator;
import java.util.LinkedHashSet;
import java.util.Set;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.JSONValue;

import resources.RootClass;

/**
 * @author laurent
 *
 */
public class CartDecoder extends RootClass {
	private ZipMap zipMap = new ZipMap();

	public ZipMap getZipMap() {
		return zipMap;
	}

	/**
	 * @param args
	 */
	public  void decode(String jsonString) {
		JSONObject obj=(JSONObject) JSONValue.parse(jsonString);
		Set<String> ks = obj.keySet();
		for( String folder: ks) {
			Set<ZipEntryRef> entries; 
			if( (entries =  this.zipMap.get(folder)) == null ) {
				entries =  new LinkedHashSet<ZipEntryRef>();
				this.zipMap.put(folder, entries);
			}
			JSONObject obj2=(JSONObject) JSONValue.parse(obj.get(folder).toString());
			Set<String> ks2 = obj2.keySet();
			for( String s2: ks2) {
				int type;
				if( s2.equals("jobs") ) {
					type = ZipEntryRef.JOB;
				}
				else {
					type = ZipEntryRef.URL;
				}
				JSONArray jsa = (JSONArray) JSONValue.parse(obj2.get(s2).toString());
				Iterator it = jsa.iterator();
				while( it.hasNext()) {
					JSONObject jso = (JSONObject) it.next();
					entries.add(new ZipEntryRef(type, jso.get("name").toString(), jso.get("uri").toString())) ;		
				}
			}
		}
	}

	public static void main(String[] args) {
		CartDecoder cd = new CartDecoder();
		cd.decode("{\"cadc\":{\"jobs\":[{\"name\": \"name1\", \"uri\": \"p2j0wdixj65m1omy\"}],\"urls\":[]},  \"cadc2\":{\"jobs\":[{\"name\": \"name2\", \"uri\": \"p2j0wdixj65m1omy\"}],\"urls\":[]} }");
	}
}

