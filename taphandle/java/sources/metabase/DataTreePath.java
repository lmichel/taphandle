package metabase;

import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

/**
 * Class transforming a data path like ele1.ele2....eleN.table in 2 components:
 * pathName : ele1.ele2....eleN
 * Each elements is either a quoted string containing any thing but quotes 
 * or a not quoted string containing no dot
 * 
 * tableName: table
 * @author laurentmichel
 *
 */
public class DataTreePath {
	/**
	 * Initial value of the data tree path 
	 */
	private String nameOrg;
	/**
	 * Last path element: meant to be the table name 
	 */
	private String tableName;
	/**
	 * Concatenation (dot separated) of all path elements except the last one
	 * Corresponds to the schema or base.schema
	 */
	private String pathName;
	/**
	 * Plain text description. No use
	 */
	private String description;
	/**
	 * REGEXP for processing a mix of quoted and not quoted elements
	 */
	private static final Pattern PATTERN_TORDU = Pattern.compile("((?:(?:[^\"\\.]+)|(?:\"[^\"]+\")))");
	private static final String STANDARD_NAME = "[a-zA-Z][a-zA-Z0-9_]*";
	
	/**
	 * The parsing is done by he constructor
	 * @param nameOrg
	 * @param description
	 */
	public DataTreePath(String nameOrg, String description){
		this.nameOrg = nameOrg;
		this.description = description;
		/*
		 * Simplest case: just a table name
		 */
		if( nameOrg.indexOf(".") == -1){
			this.tableName = quoteName(completeElementQuotes(nameOrg));
			this.pathName = "";
		/*
		 * schema + table without quotes
		 */
		} else if( nameOrg.indexOf("\"") == -1){
			String[] pe = this.nameOrg.split("\\.");
			this.tableName = quoteName(completeElementQuotes(pe[pe.length -1]));
			this.pathName = "";

			for( int i=0 ; i<(pe.length -1) ; i++){
				if( pe[i].length() > 0){
					if( this.pathName.length() > 0 ){
						this.pathName += ".";
					}
					this.pathName += quoteName(pe[i]);
				}
			}
		/*
		 * Each element are quoted
		 */
		} else if( nameOrg.matches("\".*\"")){
			String[] pe = this.nameOrg.split("\"\\.\"");
			this.tableName = pe[pe.length -1];
			this.pathName = "";

			for( int i=0 ; i<(pe.length -1) ; i++){
				if( pe[i].length() > 0){
					if( this.pathName.length() > 0 ){
						this.pathName += ".";
					}
					this.pathName += pe[i];
				}
			}
		/*
		 * Element are either quoted or not
		 */
		} else {
			Matcher m = PATTERN_TORDU.matcher(nameOrg);
			ArrayList<String> pele = new ArrayList<String>();
			while( m.find()){
				for( int i=0 ; i<m.groupCount() ; i++){
					pele.add(m.group(i));
				}
			}
			this.tableName = quoteName(pele.get(pele.size()-1));
			this.pathName = "";
			for( int i=0 ; i<(pele.size() - 1) ; i++){
				if( this.pathName.length() > 0 ){
					this.pathName += ".";
				}
				this.pathName += quoteName(pele.get(i));
			}
		}
	}
	
	/**
	 * Add a heading/trailing quote to element
	 * @param element
	 * @return
	 */
	private static String completeElementQuotes(String element){
		if( element.startsWith("\"") && ! element.endsWith("\""))
			return element + "\"";
		else if( !element.startsWith("\"") && element.endsWith("\""))
			return element + "\"";
		else return element;
	}

	private static String quoteName(String element){
		if( element.startsWith("\"") || element.matches(STANDARD_NAME)){
				return element;
		} else {
			return "\"" + element + "\"";
		}
	}
	/**
	 * @return
	 */
	public String getNameOrg() {
		return nameOrg;
	}

	/**
	 * @return
	 */
	public String getTableName() {
		return tableName;
	}

	/**
	 * @return
	 */
	public String getPathName() {
		return pathName;
	}

	/**
	 * @return
	 */
	public String getDescription() {
		return description;
	}

	/* (non-Javadoc)
	 * @see java.lang.Object#toString()
	 */
	public String toString(){
		return "nameOrg: <" + this.nameOrg + "> dataPath: <" + this.pathName + "> tableName: <" + this.tableName + ">";
	}
	/**
	 * @param args
	 * @throws Exception 
	 * @throws IOException 
	 * @throws FileNotFoundException 
	 */
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
            	DataTreePath dtp = new DataTreePath((String)(table.get("name")), (String)(table.get("description")));
            	table.put("tablename", dtp.getTableName());
            	table.put("pathname", dtp.getPathName());
            	System.out.println("   " + table.get("name"));
        		System.out.println((new DataTreePath((String)(table.get("name")), (String)(table.get("description")))));

            }
        }
    	FileWriter fw = new FileWriter("/tmp/meta/tables.quoted.json");
    	fw.write(jsonObject.toJSONString());
    	fw.close();

	}

}
