package metabase;

import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
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
 * Quotes are removed for the table name but a flag mentions we need it {@linkplain DataTreePathElement}
 * Table path element are quoted if needed. This should never occur since database schemas do not support
 * exotic characters and are never mapped in a redirection table
 * 
 * tableName: table
 * @author laurentmichel
 *
 */
public class DataTreePath {
	/**
	 * Initial value of the data tree path 
	 */
	private String tableOrg;
	/**
	 * Last path element: meant to be the table name never quoted
	 */
	private DataTreePathElement table;
	/**
	 * Concatenation (dot separated) of all path elements except the last one
	 * Corresponds to the schema or base.schema
	 */
	private String schema;
	/**
	 * Plain text description. No use
	 */
	private String description;
	/**
	 * Cached values
	 */
	private String encodedFileName = null;
	private String shortEncodedFileName = null;
	
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
	public DataTreePath(String nameOrg){
		this.tableOrg = nameOrg;
		/*
		 * Simplest case: just a table name
		 */
		if( nameOrg.indexOf(".") == -1){
			this.table = new DataTreePathElement(nameOrg);
			this.schema = "";
		/*
		 * schema + table without quotes
		 */
		} else if( nameOrg.indexOf("\"") == -1){
			String[] pe = this.tableOrg.split("\\.");
			this.table = new DataTreePathElement(pe[pe.length -1]);
			this.schema = "";

			for( int i=0 ; i<(pe.length -1) ; i++){
				if( pe[i].length() > 0){
					if( this.schema.length() > 0 ){
						this.schema += ".";
					}
					this.schema += quoteName(pe[i]);
				}
			}
		/*
		 * Each element are quoted
		 */
		} else if( nameOrg.matches("\".*\"")){
			String[] pe = this.tableOrg.split("\"\\.\"");
			this.table = new DataTreePathElement(pe[pe.length -1]);
			this.schema = "";
			for( int i=0 ; i<(pe.length -1) ; i++){
				if( pe[i].length() > 0){
					if( this.schema.length() > 0 ){
						this.schema += ".";
					}
					this.schema += pe[i];
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
			this.table = new DataTreePathElement(pele.get(pele.size()-1));
			this.schema = "";
			for( int i=0 ; i<(pele.size() - 1) ; i++){
				if( this.schema.length() > 0 ){
					this.schema += ".";
				}
				this.schema += quoteName(pele.get(i));
			}
		}
	}	
	
	public DataTreePath(String nameOrg, String description){
		this(nameOrg);
		this.description = (description == null)?"": description;

	}

	/**
	 * @param schema
	 * @param nameOrg
	 * @param description
	 * @throws Exception 
	 */
	public DataTreePath(String schema, String nameOrg, String description) throws Exception{
		this(nameOrg, description);
		if( this.schema.length() > 0 && schema.length() > 0 && !this.schema.replaceAll("\"",  "").endsWith(schema.replaceAll("\"", ""))){
			throw new Exception("The full table name <" + this.tableOrg + "> is inconsistant with the schema name <" + schema + ">");
		}
		if( this.schema.length() == 0 && schema.length() > 0 ){
			this.schema = schema;
		}
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
	public String geTableOrg() {
		return tableOrg;
	}

	/**
	 * @return
	 */
	public String getTable() {
		return table.getName();
	}
	/**
	 * @return
	 */
	public boolean mudtBeQuoted() {
		return this.table.mustBeQuoted();
	}

	/**
	 * @return
	 */
	public String getSchema() {
		return schema;
	}

	/**
	 * @return
	 */
	public String getDescription() {
		return description;
	}

	/**
	 * return an encoded filename (without extension) formed like schema.table
	 * @return
	 * @throws UnsupportedEncodingException
	 */
	public String getEncodedFileName() throws UnsupportedEncodingException {
		if( encodedFileName == null ) {
			this.encodedFileName = ((this.schema.length()> 0)? (this.schema + "."): "") + URLEncoder.encode(this.getTable(), "UTF-8");
		}
		return this.encodedFileName;
	}
	/**
	 * return an encoded filename (without extension) formed from the table name without respect for the schema
	 * @return
	 * @throws UnsupportedEncodingException
	 */
	public String getShortEncodedFileName() throws UnsupportedEncodingException {
		if( shortEncodedFileName == null ) {
			this.shortEncodedFileName = URLEncoder.encode(this.getTable(), "UTF-8");
		}
		return this.shortEncodedFileName;
	}
	
	/**
	 * @return a JSON object of the instance
	 */
	@SuppressWarnings("unchecked")
	public JSONObject getJSONObject(){
		JSONObject retour = new JSONObject();
		retour.put("tableorg", this.tableOrg);
		retour.put("table", this.getTable());
		retour.put("schema", this.schema);
		retour.put("quoted", this.mudtBeQuoted());
		
		return retour;
	}

	/* (non-Javadoc)
	 * @see java.lang.Object#toString()
	 */
	public String toString(){
		return "nameOrg: <" + this.tableOrg + "> dataPath: <" + this.schema + "> tableName: <" + this.table + ">";
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
