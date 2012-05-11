/**
 * 
 */
package test;

import java.io.BufferedReader;
import java.io.FileReader;

import resources.RootClass;
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
		String inputfile = "/home/michel/Desktop/tables.xml";
		String outputfile =  inputfile.replaceAll("xml", "json");
		XmlToJson.applyStyle(inputfile
				, outputfile
				, "/home/michel/Desktop/CATALOGUE_ENTRY.xsl");
		BufferedReader br = new BufferedReader(new FileReader(outputfile));
		String b;
		while( (b = br.readLine()) != null ) {
			System.out.println(b);
		}

	}

}
