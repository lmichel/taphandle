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
public class XmlToJsonTestVosi11 extends RootClass {

	/**
	 * @param args
	 * @throws Exception 
	 */
	public static void main(String[] args) throws Exception {
		System.out.println("Processing VIZER");
		String inputfile = "/tmp/metaviz/viz7.Jv_vA+Av_v552v_vA8v_vtablea1_att.xml";
		String outputfile =  "/tmp/metaviz/iodb.json";
		XmlToJson.applyStyle(inputfile
				, outputfile
				, "/home/michel/gitRepositories/taphandle/TapHandles/WebContent/styles/New_table_att.xsl");
		BufferedReader br = new BufferedReader(new FileReader(outputfile));
		System.out.println("  output: ");
		String b;
		while( (b = br.readLine()) != null ) {
			System.out.println(b);
		}
		br.close();
		System.out.println("Processing CADC");
		inputfile = "/tmp/meta/caom2.Artifact_att.xml";
		outputfile =  "/tmp/meta/iodb.json";
		XmlToJson.applyStyle(inputfile
				, outputfile
				, "/home/michel/gitRepositories/taphandle/TapHandles/WebContent/styles/New_table_att.xsl");
		br = new BufferedReader(new FileReader(outputfile));
		System.out.println("  output: ");
		while( (b = br.readLine()) != null ) {
			System.out.println(b);
		}
		br.close();
	}

}
