package test;

import java.io.BufferedReader;
import java.io.FileReader;

import metabase.DataTreePath;
import translator.NameSpaceDefinition;
import translator.XmlToJson;

public class TableAttTest {

	/**
	 * @param args
	 * @throws Exception 
	 */
	public static void main(String[] args) throws Exception {
		String baseDir = "/home/michel/workspace/.metadata/.plugins/org.eclipse.wst.server.core/tmp0/wtpwebapps/TapHandles/nodebase/heasarc-xamin/"	;
		String table = "ngc4649cxo";
		XmlToJson.translateTableAttributes(baseDir, "tables", new DataTreePath(table), new NameSpaceDefinition());
		BufferedReader br = new BufferedReader(new FileReader(baseDir + table + "_att.json"));
		String b;
		while( (b = br.readLine()) != null ) {
			System.out.println(b);
		}
	}

}
