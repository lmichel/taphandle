/**
 * 
 */
package translator;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.PrintWriter;
import java.util.Scanner;
import java.util.regex.Matcher;

import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.stream.StreamResult;
import javax.xml.transform.stream.StreamSource;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

import resources.RootClass;
import uk.ac.starlink.table.ColumnInfo;
import uk.ac.starlink.table.StarTable;
import uk.ac.starlink.table.StarTableFactory;
import uk.ac.starlink.table.Tables;


/**
 * Utility in charge of translating VOTable received from TAP node n JSONB files
 * comprehensible by the AJAX client.
 * This utility has no connection with the application resources
 * @author laurent
 * @version $Id$
 */
public class XmlToJson  extends RootClass {

	/**
	 * Replace in a style sheet the vosi name space with the name space given in parameter
	 * @param baseDir      Working directory
	 * @param service      Either availability, capabilities or tables
	 * @param nsDefinition Name space to use
	 * @throws Exception   If something goes wrong
	 */
	/**
	 * @param baseDir
	 * @param service
	 * @param nsDefinition
	 * @throws Exception
	 */
	public static void setVosiNS(String baseDir , String service, NameSpaceDefinition nsDefinition) throws Exception {

		BufferedReader in = new BufferedReader(new FileReader(StyleDir + service + ".xsl"));
		BufferedWriter out = new BufferedWriter(new FileWriter(baseDir + service + ".xsl"));
		String str;
		boolean found = false;
		String nsName = nsDefinition.getNsName();
		if( nsName.length() == 0 ){
			nsName = null;
		}
		while ((str = in.readLine()) != null) {
			if( !found && nsDefinition != null ) {
				Matcher m = NSDefPattern.matcher(str);
				if (m.matches()) {
					str = str.replace( m.group(1), nsDefinition.getNsDeclaration()) ;
					found = true;
				}
			}
			if( nsName != null  ) {
				str = str.replaceAll("vosi\\:", nsName + ":");
			}
			out.write(str + "\n");
		}
		in.close();
		out.close();
	}
	/**
	 * Replace in a style sheet the detected name space with the name space given in parameter
	 * @param baseDir      Working directory
	 * @param service      Either availability, capabilities or tables
	 * @param nsDefinition Name space to use
	 * @throws Exception   If something goes wrong
	 */
	public static void setNS(String baseDir , String service, NameSpaceDefinition nsDefinition) throws Exception {

		BufferedReader in = new BufferedReader(new FileReader(StyleDir + service + ".xsl"));
		BufferedWriter out = new BufferedWriter(new FileWriter(baseDir + service + ".xsl"));
		String str;
		boolean found = false;
		while ((str = in.readLine()) != null) {
			if( !found && nsDefinition != null ) {
				Matcher m = NSPattern.matcher(str);
				if (m.matches()) {
					str = str.replace( m.group(1), nsDefinition.getNsDeclaration()) ;
					found = true;
				}
			}
			out.write(str + "\n");
		}
		in.close();
		out.close();


	}

	/**
	 * Translate the XML file service.xml into service.json by using the style sheet service.xsl
	 * @param baseDir      Working directory
	 * @param service      Either availability, capabilities or tables
	 * @param nsDefinition Name space to use
	 * @throws Exception   If something goes wrong
	 */
	public static void translate(String baseDir , String service, NameSpaceDefinition nsDefinition) throws Exception {
		setVosiNS(baseDir, service, nsDefinition);
		applyStyle(baseDir + service + ".xml", baseDir + service + ".json", baseDir + service + ".xsl");
	}

	/**
	 * Translate the XML file service.xml into service.json by using the style sheet style.xsl
	 * @param baseDir      Working directory
	 * @param service      Either availability, capabilities or tables
	 * @param style        Style sheet name 
	 * @param nsDefinition Name space to use
	 * @throws Exception   If something goes wrong
	 */
	public static void translate(String baseDir , String service, String style, NameSpaceDefinition nsDefinition) throws Exception {
		setVosiNS(baseDir, style, nsDefinition);
		applyStyle(baseDir + service + ".xml", baseDir + style + ".json", baseDir + style + ".xsl");
	}

	/**
	 * Builds a JSON file describing the table tableName in a format 
	 * comprehensible by JQuery datatable widget
	 * @param baseDir      Working directory
	 * @param tableName  Name of the table
	 * @param nsDefinition Name space to use
	 * @throws Exception If something goes wrong
	 */
	public static void translateTableMetaData(String baseDir , String tableName, NameSpaceDefinition nsDefinition) throws Exception {
		setVosiNS(baseDir, "table", nsDefinition);
		String filename = baseDir + "table.xsl";
		Scanner s = new Scanner(new File(filename));
		PrintWriter fw = new PrintWriter(new File( baseDir + tableName + ".xsl"));
		while( s.hasNextLine() ) {
			fw.println(s.nextLine().replaceAll("TABLENAME", tableName));
		}
		s.close();
		fw.close();
		applyStyle(baseDir  + "tables.xml", baseDir + tableName + ".json", baseDir + tableName + ".xsl");
	}

	/**
	 * Builds a JSON file describing the table tableName to setup
	 * query form
	 * @param baseDir      Working directory
	 * @param tableName  Name of the table
	 * @param nsDefinition Name space to use
	 * @throws Exception If something goes wrong
	 */
	public static void translateTableAttributes(String baseDir , String tableName, NameSpaceDefinition nsDefinition) throws Exception {
		setVosiNS(baseDir, "table_att", nsDefinition);
		String filename = baseDir + "table_att.xsl";
		Scanner s = new Scanner(new File(filename));
		PrintWriter fw = new PrintWriter(new File( baseDir + tableName + "_att.xsl"));
		while( s.hasNextLine() ) {
			fw.println(s.nextLine().replaceAll("TABLENAME", tableName));
		}
		s.close();
		fw.close();
		applyStyle(baseDir  + "tables.xml", baseDir + tableName + "_att.json", baseDir + tableName + "_att.xsl");
	}

	/**
	 * Translate a TAP query response in a JSON file with a format 
	 * comprehensible by JQuery datatable widget
	 * @param inputFile   XML file to translate
	 * @param outputFile  Output JSON file
	 * @throws Exception  If something goes wrong
	 */
	@SuppressWarnings("unchecked")
	public static void translateResultTable(String inputFile, String outputFile  ) throws Exception {
		StarTableFactory stf = new StarTableFactory();
		StarTable table = stf.makeStarTable(inputFile); 

		JSONObject retour = new JSONObject();
		int nSrc = (int) table.getRowCount();
		int nCol = table.getColumnCount();

		ColumnInfo[] ci = Tables.getColumnInfos(table);
		JSONArray aoColumns = new JSONArray();
		for (int i = 0; i < nCol; i++) {
			JSONObject aoColumn = new JSONObject();
			aoColumn.put("sTitle", ci[i].getName());
			aoColumns.add(aoColumn);
		}
		retour.put("aoColumns", aoColumns);

		JSONArray aaData = new JSONArray();
		for( int r=0 ; r<nSrc ; r++ ) {
			if( r >= 200 ) {
				logger.warn("JSON result truncated to 200");
				break;
			}
			Object[] o =table.getRow(r);
			JSONArray rowData = new JSONArray();
			for (int i = 0; i < nCol; i++) {
				if(o[i] == null ) {
					rowData.add("null");
				}
				else {
					rowData.add(o[i].toString());				
				}
			}
			aaData.add(rowData);
		}
		retour.put("aaData", aaData);

		FileWriter fw = new FileWriter(outputFile);
		fw.write(retour.toJSONString());
		fw.close();
	}

	/**
	 * Apply a style sheet to an XML file
	 * The translation used the saxon engine in order to work with a generic JSON translator
	 * courtesy of {@link http://www.saxonica.com/download/download_page.xml}
	 * @param inputFile   File path to translate
	 * @param outputFile  Translated file path
	 * @param styleSheet  Applied style sheet
	 * @throws Exception  If something goes wrong
	 */
	public static void applyStyle(String inputFile, String outputFile, String styleSheet) throws Exception{
		System.setProperty("javax.xml.transform.TransformerFactory", "net.sf.saxon.TransformerFactoryImpl");
		// Create a transform factory instance.
		TransformerFactory tfactory = TransformerFactory.newInstance();

		// Create a transformer for the stylesheet.
		Transformer transformer = tfactory.newTransformer(new StreamSource(new File(styleSheet)));
		// Transform the source XML to System.out.
		transformer.transform(new StreamSource(new File(inputFile)),
				new StreamResult(new File(outputFile)));	
	}
}
