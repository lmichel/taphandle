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
	private final String query = "Select TABLE_NAME, COLUMN_NAME, DESCRIPTION, UNIT, UCD, DATATYPE, SIZE, PRINCIPAL, INDEXED, STD from tap_schema.columns";
	private final String resultFileName = "TablesReconstructorResult";

	public TablesReconstructor(String nodeUrl, String outputDir) throws Exception{
		this.nodeUrl = nodeUrl;
		this.outputDir = outputDir;
		if( !this.outputDir.endsWith("/")) this.outputDir  += "/"; 
		builtTablesResponseFile();
	}

	private void builtTablesResponseFile() throws Exception {
		logger.info("Scan TAP_SCHEMA of node " + this.nodeUrl);
		NodeCookie nodeCookie = new NodeCookie();
		String treepath = "TablesReconstructor>tables";
		validWorkingDirectory(this.outputDir);
		nodeCookie.saveCookie(this.outputDir);
		logger.debug(TapAccess.runSyncJob(this.nodeUrl, this.query, this.outputDir + this.resultFileName + ".xml", nodeCookie, treepath));
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
		writer.write("<schema>\n");
		for( Entry<String, Map<String, Set<Column>>> e: metaMap.entrySet() ) {
			writer.write("  <name>" + e.getKey() + "</name>\n");
			writer.write("  <description>Constructed by Taphandle from TAP_SCHEMA</description>\n");
			for( Entry<String, Set<Column>> t: e.getValue().entrySet() ) {
				writer.write("  <table>\n");
				writer.write("    <name>" + t.getKey() + "</name>\n");
				writer.write("    <type>table</type>\n");		
				for( Column rc: t.getValue()) {
					writer.write("    <column>\n");		
					writer.write("      <name>" +rc.COLUMN_NAME  + "</name>\n");	
					writer.write("      <description><![CDATA[" + rc.DESCRIPTION + "]]></description>\n");	
					writer.write("      <unit>" +rc.UNIT  + "</unit>\n");	
					writer.write("      <ucd>" +rc.UCD  + "</ucd>\n");	
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

		public void readJsonArray(JSONArray row){
			this.DB_NAME = (String) row.get(0);;
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
	}
}
