/**
 * 
 */
package test;

import java.io.BufferedReader;
import java.io.FileReader;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import resources.RootClass;
import translator.NameSpaceDefinition;
import translator.XmlToJson;

/**
 * @author laurent
 *
 */
public class XmlToJsonTest extends RootClass {

	/**
	 * @param args
	 * @throws Exception 
	 */
	public static void main(String[] args) throws Exception {
		String inputfile = "/tmp/meta/tables.xml";
		String outputfile =  "/tmp/meta/iodb.json";
		NameSpaceDefinition nsDefinition = new NameSpaceDefinition();

		boolean found = false;
		BufferedReader in = new BufferedReader(new FileReader(inputfile));
		String inputLine;
		Pattern NS_PATTERN  = Pattern.compile(".*xmlns(?::\\w+)?=(\"[^\"]*(?i)(?:" + "tables" + ")[^\"]*\").*");

		while ((inputLine = in.readLine()) != null) {
			if( !found ) {
				Matcher m = NS_PATTERN.matcher(inputLine);
				if (m.matches()) {				
					nsDefinition.init("xmlns:vosi=" + m.group(1)) ;
					found = true;
				}
			}
		}
		in.close();

		//XmlToJson.setVosiNS("/tmp/meta", "tables", nsDefinition);
		XmlToJson.applyStyle("/tmp/meta/tables.xml", outputfile, "/tmp/meta/tables.xsl");

		
//		XmlToJson.applyStyle(inputfile
//				, outputfile
//				, "/tmp/meta/tables.xsl");
		BufferedReader br = new BufferedReader(new FileReader(outputfile));
		String b;
		while( (b = br.readLine()) != null ) {
			System.out.println(b);
		}

	}

}
