package tapaccess;

import java.io.FileWriter;
import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import org.json.simple.JSONArray;

import resources.RootClass;
import session.NodeCookie;
import translator.JsonUtils;

public class TablesReconstructor extends RootClass {
	private Map<String, Map<String, Set<Column>>> metaMap = new LinkedHashMap<String, Map<String, Set<Column>>>();
	private String nodeUrl, outputDir;
	// private final String query = "Select TABLE_NAME, COLUMN_NAME, DESCRIPTION, UNIT, UCD, DATATYPE, 'SIZE', PRINCIPAL, INDEXED, STD from tap_schema.columns ";
	
	// This query only contains the basic SELECT part, the rest will be added later with the getQuery() method
	private String query = "SELECT tap_schema.tables.schema_name,tap_schema.columns.table_name,tap_schema.columns.column_name,tap_schema.columns.description,tap_schema.columns.unit,tap_schema.columns.ucd,tap_schema.columns.datatype,tap_schema.columns.\"size\",tap_schema.columns.principal,tap_schema.columns.indexed,tap_schema.columns.std";
	
	private String resultFileName = "TablesReconstructorResult";
	
	// This query is used by the getQuery() method to search for three index : schema_index, table_index and column_index, we only want to retrieve the information about the presence of the index,
	// the number of time they appear isn't important which is why we use the keyword DISTINCT
	private final String indexQuery = "SELECT DISTINCT column_name FROM TAP_SCHEMA.columns WHERE column_name = 'column_index' or column_name = 'table_index' or column_name = 'schema_index'";

	public TablesReconstructor(String nodeUrl, String outputDir) throws Exception{
		this.nodeUrl = nodeUrl;
		this.outputDir = outputDir;
		if( !this.outputDir.endsWith("/")) this.outputDir  += "/"; 
		this.builtTablesResponseFile();
	}
	
	public String getOutputDir() {
		return this.outputDir;
	}
	
	// The getQuery method searches for schema_index, table_index and column_index in the tap_schema of a database
	// then, it builds the missing part of this.query according to what is in the database,
	// this way, the query is not generic and adapts to different situation
	// at the end the method returns the complete query, either with the indexes or without if they don't exist in the database
	private String getQuery() throws Exception {
		NodeCookie nodeCookie = new NodeCookie();
		String treepath = "TablesReconstructor>tables";
		validWorkingDirectory(this.outputDir);
		nodeCookie.saveCookie(this.outputDir);
		logger.debug(TapAccess.runSyncJob(this.nodeUrl, this.indexQuery, this.outputDir + "checkColumnExists" + ".xml", nodeCookie, treepath));
		JSONArray obj = (JSONArray) JsonUtils.getObjectValue(this.outputDir + "checkColumnExists" + ".json", "aaData");
		
		String[] makeAliases = new String[3];
		String innerJoinPart = " FROM tap_schema.columns "
				+ "JOIN tap_schema.tables ON tap_schema.tables.table_name = tap_schema.columns.table_name "
				+ "JOIN tap_schema.schemas ON tap_schema.schemas.schema_name = tap_schema.tables.schema_name ";
		String[] exists = new String[4];
		exists[0] = "ORDER BY ";
		for( int i=0 ; i<obj.size() ; i++){
			JSONArray row = (JSONArray) obj.get(i);
			String row_string = (String) row.get(0);
			if (row_string.equals("schema_index")) {
				exists[1] = "akaSchema_index, akaSchema_name, ";
				makeAliases[0] = ", tap_schema.schemas.schema_index as akaSchema_index, tap_schema.schemas.schema_name as akaSchema_name";
			} else if (row_string.equals("table_index")) {
				exists[2] = "akaTable_index, akaTable_name, ";
				makeAliases[1] = ", tap_schema.tables.table_index as akaTable_index, tap_schema.tables.table_name as akaTable_name";
			} else if (row_string.equals("column_index")) {
				exists[3] = "akaColumn_index";
				makeAliases[2] = ", tap_schema.columns.column_index as akaColumn_index";
			}
		}
		String queryOrderBy = "";
		String queryAliases = "";
		if (exists[1] != null) {
			for (int i = 0 ; i<4 ; i++) {
				if (exists[i] != null) {
					queryOrderBy = queryOrderBy + exists[i];
				}
			}
		}
		for (int i = 0 ; i<3 ; i++) {
			if (makeAliases[i] != null) {
				queryAliases = queryAliases + makeAliases[i];
			}
		}
		if (queryOrderBy.equals("ORDER BY ;") == false) {
			return this.query + queryAliases + innerJoinPart + queryOrderBy; 
		} else {
			return this.query + innerJoinPart;
		}
	}

	private void builtTablesResponseFile() throws Exception {
		logger.info("Scan TAP_SCHEMA of node " + this.nodeUrl);
		NodeCookie nodeCookie = new NodeCookie();
		String treepath = "TablesReconstructor>tables";
		validWorkingDirectory(this.outputDir);
		nodeCookie.saveCookie(this.outputDir);
		// runSyncJob now takes the query returned by getQuery() instead of this.query directly
		logger.debug(TapAccess.runSyncJob(this.nodeUrl, getQuery(), this.outputDir + this.resultFileName + ".xml", nodeCookie, treepath));
		JSONArray obj = (JSONArray) JsonUtils.getObjectValue(this.outputDir + this.resultFileName + ".json", "aaData");
		for( int i=0 ; i<obj.size() ; i++){
			JSONArray row = (JSONArray) obj.get(i);
			Column c = new Column();
			c.readJsonArray(row);
			Map<String, Set<Column>> tbls;
			if( (tbls = this.metaMap.get(c.SCHEMA_NAME)) == null ) {
				tbls = new LinkedHashMap<String, Set<Column>>();
				tbls.put(c.TABLE_NAME, new LinkedHashSet<Column>());
				this.metaMap.put(c.SCHEMA_NAME, tbls);
			}
			Set<Column> tbl;
			if( (tbl = tbls.get(c.TABLE_NAME)) == null ) {
				tbl = new LinkedHashSet<Column>();
				tbls.put(c.TABLE_NAME, tbl);
			}
			tbl.add(c);	
		}
		writeXmlTables(new FileWriter(this.outputDir + "tables.xml"));
	}

	public	void printResult() {
		for( Entry<String, Map<String, Set<Column>>> e: this.metaMap.entrySet() ) {
			System.out.println("Schema " + e.getKey());
			for( Entry<String, Set<Column>> t: e.getValue().entrySet() ) {
				System.out.println("     table " + t.getKey());
				for( Column rc: t.getValue()) {
					System.out.println("       column: " + rc.COLUMN_NAME);
				}
			}
		}
	}

	/**
	 * @param writer
	 * @throws IOException
	 */
	private void writeXmlTables(FileWriter writer) throws IOException{
		writer.write("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
		writer.write("<?xml-stylesheet type=\"text/xsl\" href=\"http://xcatdb.u-strasbg.fr/2xmmidr3/styles/tables.xsl\"?>\n");
		writer.write("<vosi:tableset xmlns:vosi=\"http://www.ivoa.net/xml/VOSITables/v1.0\"\n");
		writer.write("     xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" \n");
		writer.write("     xmlns:vod=\"http://www.ivoa.net/xml/VODataService/v1.1\">\n");
		/*
		 * Removing unsupported chars
		 */
		String xml10pattern = "[^"
                + "\u0009\r\n"
                + "\u0020-\uD7FF"
                + "\uE000-\uFFFD"
                + "\ud800\udc00-\udbff\udfff"
                + "]";
		for( Entry<String, Map<String, Set<Column>>> e: metaMap.entrySet() ) {
			writer.write("  <schema>\n");
			writer.write("  <name>" + e.getKey() + "</name>\n");
			writer.write("  <description>Constructed by Taphandle from TAP_SCHEMA</description>\n");
			for( Entry<String, Set<Column>> t: e.getValue().entrySet() ) {
				writer.write("  <table>\n");
				writer.write("    <name>" + t.getKey() + "</name>\n");
				writer.write("    <type>table</type>\n");		
				for( Column rc: t.getValue()) {
					writer.write("    <column>\n");		
					writer.write("      <name><![CDATA[" +rc.COLUMN_NAME  + "]]></name>\n");
					// For description, we use this syntax to avoid problems with description containing < or > in their string which causes problem with xml : <![CDATA[XXX]]>
					writer.write("      <description><![CDATA[" + rc.DESCRIPTION.replaceAll(xml10pattern, "") + "]]></description>\n");	
					writer.write("      <unit>" +rc.UNIT  + "</unit>\n");	
					writer.write("      <ucd><![CDATA[" +rc.UCD  + "]]></ucd>\n");	
					writer.write("      <utype></utype>\n");	
					writer.write("      <dataType xsi:type=\"vod:TAPType\">" + rc.DATATYPE+ "</dataType>\n");	
					writer.write("    </column>\n");		
				}
				writer.write("  </table>\n");
			}
			writer.write("</schema>\n");
		}
		writer.write("</vosi:tableset>\n");
		writer.close();	
	}



	static class Column {
		String DB_NAME;
		String SCHEMA_NAME;
		String TABLE_NAME;
		String COLUMN_NAME;
		String DESCRIPTION;
		String UNIT;
		String UCD;
		String DATATYPE;
		String SIZE;
		String PRINCIPAL;
		String INDEXED;
		String STD;

		public void readJsonArrayOfrl(JSONArray row){
			this.DB_NAME = (String) row.get(0);
			this. SCHEMA_NAME = (String) row.get(1);
			this. TABLE_NAME = (String) row.get(2);
			this. COLUMN_NAME = (String) row.get(3) ;
			this. DESCRIPTION= (String) row.get(4);
			this. UNIT =(String)  row.get(5);
			this. UCD = (String) row.get(6);
			this. DATATYPE = (String) row.get(7);
			this. SIZE = (String) row.get(8);
			this. PRINCIPAL = (String) row.get(9);
			this. INDEXED = (String) row.get(10);
			this. STD = (String) row.get(11);

		}
		// The order of this array is determined by the ADQL Query defined in this file (this.query)
		public void readJsonArray(JSONArray row){
			this. SCHEMA_NAME = (String) row.get(0);
			this. TABLE_NAME = (String) row.get(1);
			this. COLUMN_NAME = (String) row.get(2) ;
			this. DESCRIPTION= (String) row.get(3);
			this. UNIT =(String)  row.get(4);
			this. UCD = (String) row.get(5);
			this. DATATYPE = (String) row.get(6);
			this. SIZE = (String) row.get(7);
			this. PRINCIPAL = (String) row.get(8);
			this. INDEXED = (String) row.get(9);
			this. STD = (String) row.get(10);

		}
	}
}
