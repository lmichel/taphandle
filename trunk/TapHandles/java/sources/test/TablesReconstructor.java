package test;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.net.SocketTimeoutException;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import org.json.simple.JSONArray;

import resources.RootClass;
import session.NodeCookie;
import tapaccess.JobUtils;
import tapaccess.TapAccess;
import translator.JsonUtils;

public class TablesReconstructor extends RootClass {
	public static Map<String, Map<String, Set<Column>>> MetaMap = new LinkedHashMap<String, Map<String, Set<Column>>>();;

	public static void main(String[] args) throws IOException{
		String url = "http://jvo.nao.ac.jp/skynode/do/tap/agn/";
		String nodeKey = "japan";
		String jobID = "123";
		String baseDirectory = System.getProperty("user.home") + "/Desktop/";
		String treepath = "tapvizieru-strasbgfrTAPVizieR>vizls>vizls.II/306/sdss8";
		String statusFileName = baseDirectory + "japan" + File.separator + "status.xml";
		String query = "Select DB_NAME, SCHEMA_NAME, TABLE_NAME, COLUMN_NAME, DESCRIPTION, UNIT, UCD, DATATYPE, SIZE, PRINCIPAL, INDEXED, STD from tap_schema.columns";
		Date startTime = new Date();
		String outputDir = "";
		try {

			validWorkingDirectory(baseDirectory + nodeKey);
			emptyDirectory(new File(baseDirectory + nodeKey));
			NodeCookie nodeCookie = new NodeCookie();
			outputDir = JobUtils.setupJobDir(nodeKey
					, baseDirectory + nodeKey + File.separator + "job_" + jobID + File.separator
					, statusFileName, treepath);
			nodeCookie.saveCookie(outputDir);
			System.out.println(TapAccess.runSyncJob(url, query, outputDir + "result.xml", nodeCookie, treepath));
			BufferedReader br = new BufferedReader(new FileReader(outputDir + "result.xml"));
			String bf;
			while( (bf=br.readLine()) != null ) {
				System.out.println(bf);
			}
			br = new BufferedReader(new FileReader(outputDir + "result.json"));
			while( (bf=br.readLine()) != null ) {
				System.out.println(bf);
			}
			JSONArray obj = (JSONArray) JsonUtils.getObjectValue(outputDir + "result.json", "aaData");
			for( int i=0 ; i<obj.size() ; i++){
				JSONArray row = (JSONArray) obj.get(i);
				Column c = new Column();
				c.readJsonArray(row);
				Map<String, Set<Column>> tbls;
				if( (tbls = MetaMap.get(c.SCHEMA_NAME)) == null ) {
					tbls = new LinkedHashMap<String, Set<Column>>();
					tbls.put(c.TABLE_NAME, new LinkedHashSet<Column>());
					MetaMap.put(c.SCHEMA_NAME, tbls);
				}
				Set<Column> tbl;
				if( (tbl = tbls.get(c.TABLE_NAME)) == null ) {
					tbls.put(c.TABLE_NAME, new LinkedHashSet<Column>());
				}
				tbl.add(c);				
			}
			for( Entry<String, Map<String, Set<Column>>> e: MetaMap.entrySet() ) {
				System.out.println("---- " + e.getKey());
				for( Entry<String, Set<Column>> t: e.getValue().entrySet() ) {
					System.out.println("       " + t.getKey());
					for( Column rc: t.getValue()) {
						System.out.println("       " + rc.COLUMN_NAME);
					}
				}

			}
			writeXmlTables(new FileWriter(outputDir + "tables.xml"));
			br = new BufferedReader(new FileReader(outputDir + "tables.xml"));
			while( (bf=br.readLine()) != null ) {
				System.out.println(bf);
			}
			JobUtils.writeSyncJobStatus(nodeKey, outputDir, jobID, startTime, query);		

			logger.info("complete");		
		} catch(Exception e){
			JobUtils.writeSyncJobError(nodeKey, outputDir, jobID, startTime, query, e.getMessage());
		}


	}

	public static void writeXmlTables(FileWriter writer) throws IOException{

		writer.write("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
		writer.write("<?xml-stylesheet type=\"text/xsl\" href=\"http://xcatdb.u-strasbg.fr/2xmmidr3/styles/tables.xsl\"?>\n");
		writer.write("<vosi:tableset xmlns:vosi=\"http://www.ivoa.net/xml/VOSITables/v1.0\"\n");
		writer.write("     xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" \n");
		writer.write("     xmlns:vod=\"http://www.ivoa.net/xml/VODataService/v1.1\">\n");
		writer.write("<schema>\n");
		for( Entry<String, Map<String, Set<Column>>> e: MetaMap.entrySet() ) {
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
		}
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
