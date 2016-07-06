package translator;

import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import org.json.simple.JSONObject;

import resources.RootClass;

/**
 * Map containing the joins extracted from the TAP_SCHEMA
 * The source table is the map key. 
 * joins are stored as JSON objects like {"target_table", "source_column", "target_column"}
 * Once the map is populated (method add(...)) the method buildReverseJoins() add the reverse 
 * joins which are not in the TAP_SCHEMAthis method will add the B to A join if it does not exist.
 * e.g. if the TAP_SCHEMA give a key joining A & B, then 
 * @author laurentmichel
 *
 */
public class JoinKeyMap extends RootClass{
	/**
	 * Storage of joins
	 */
	private Map<String, Collection<JSONObject>> map = new LinkedHashMap<String, Collection<JSONObject>>();

	
	/**
 	 * add a new join  to the map.
	 * @param source_table : used as key
	 * @param target_table : stored in a json object
	 * @param source_column: stored in a json object
	 * @param target_column: stored in a json object
	 */
	@SuppressWarnings("unchecked")
	public void add(String source_table, String target_table, String source_column, String target_column){
		JSONObject jso = new JSONObject();
		jso.put("target_table", target_table);
		jso.put("source_column", source_column);
		jso.put("target_column", target_column);
		Collection<JSONObject> set;
		if( (set = map.get(source_table)) == null) {
			set =  new ArrayList<JSONObject>();
			map.put(source_table,set);
		}
		set.add(jso);


	}
	/**
 	 * add a new join  to the map.
	 * @param row: array where data must be ordered like source_table, target_table, source_column, target_column
	 */
	public void addJoin(Object[] row){
		this.add(row[0].toString(), row[1].toString(), row[2].toString(), row[3].toString());
	}
	
	/**
	 * @return the entry set of the join storage map
	 */
	public Set<Entry<String, Collection<JSONObject>>> entrySet(){
		return map.entrySet();
	}
	
	/**
	 * Add reverse joins to the map if they don't exist
	 */
	public void buildReverseJoins(){
		JoinKeyMap reverseJoins = new JoinKeyMap();
		/*
		 * Build another JoinKeyMap only containing the joins to added (the reversed joins)
		 */
		for( Entry<String, Collection<JSONObject>> e: this.map.entrySet()){
			String source_table = e.getKey();
			for( JSONObject jso: e.getValue()){
				String target_table = (String) jso.get("target_table");
				String source_column = (String) jso.get("source_column");
				String target_column = (String) jso.get("target_column");
				Collection<JSONObject> coll ;
				if( (coll = this.map.get(target_table)) == null ) {
					reverseJoins.add(target_table, source_table, target_column, source_column);
				} else {
					boolean found = false;
					for( JSONObject jsoc: coll){
						if( ((String)(jsoc.get("target_table"))).equals(source_table)) {
							found = true;
							break;
						}
					}
					if( !found ){
						reverseJoins.add(target_table, source_table, target_column, source_column);
					}
				}
			}
		}
		/*
		 * Insert the reversed joins within the storage map
		 */
		for( Entry<String, Collection<JSONObject>> e: reverseJoins.entrySet()){
			Collection<JSONObject> coll ;
			if( (coll = this.map.get(e.getKey())) == null ){
				coll =  new ArrayList<JSONObject>();
				map.put(e.getKey(),coll);
				logger.debug("Add source table " + e.getKey());
			}
			for( JSONObject jso: e.getValue()){
				coll.add(jso);
				logger.debug("Add reverse join " + e.getKey() + " " + jso.toJSONString());
			}
		}
	}
}
