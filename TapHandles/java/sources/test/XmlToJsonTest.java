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
		String inputfile = "/tmp/meta/tables.xml";
		String outputfile =  "/tmp/meta/iodb.json";
		XmlToJson.applyStyle(inputfile
				, outputfile
				, "/tmp/meta/iodb_att.xsl");
		BufferedReader br = new BufferedReader(new FileReader(outputfile));
		String b;
		while( (b = br.readLine()) != null ) {
			System.out.println(b);
		}

	}

}
