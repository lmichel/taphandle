package metabase;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.json.simple.JSONObject;

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
		 * Each element is quoted
		 */
		} else if( nameOrg.matches("(\".+\")(\\.(\".+\"))*")){
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
			this.schema += "\"";;

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
				this.schema += unQuoteName(pele.get(i));
			}
			this.schema = "\"" + this.schema + "\"";
		}

		if( this.schema.equals("public")){
			this.schema = "\"" + this.schema + "\"";
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
		/*
		 * If nameOrg does not start with schema, we can consider that nameorg is a table name
		 */
		String sqnameOrg = nameOrg.replaceAll("\"",  "").toUpperCase();
		String sqschema = schema.replaceAll("\"",  "").toUpperCase();
		if( !sqnameOrg.startsWith(sqschema + ".") && !sqnameOrg.startsWith(schema + ".") ) {
			this.schema = schema.replaceAll("\"",  "");
			/*
			 * Quoted schemas are not supported by XSL sheet
			 * This case must be processed in JS
			 *
			if( this.schema.equals("public")){
				this.schema = "\"" + this.schema + "\"";
			}
            */
			this.table = new DataTreePathElement(nameOrg);
			this.tableOrg = this.schema + "." + this.getTable();
		}
	}

	private static String quoteName(String element){
		if( element.startsWith("\"") || element.matches(STANDARD_NAME)){
				return element;
		} else {
			return "\"" + element + "\"";
		}
	}
	private static String unQuoteName(String element){
		return element.replaceAll("^\"|\"$", "");
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
	public boolean mustBeQuoted() {
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
		retour.put("quoted", this.mustBeQuoted());
		
		return retour;
	}

	/* (non-Javadoc)
	 * @see java.lang.Object#toString()
	 */
	public String toString(){
		return "tableOrg: <" + this.tableOrg + "> schema: <" + this.schema + "> dataPath: <" + this.schema + "> tableName: <" + this.table + ">";
	}

}
