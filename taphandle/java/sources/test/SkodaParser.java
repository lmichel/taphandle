package test;

import java.io.FileReader;

import org.json.simple.parser.JSONParser;

public class SkodaParser {

	public static void main(String[] args) throws Exception {
		JSONParser parser = new JSONParser();
		Object obj = parser.parse(new FileReader("/home/michel/workspace/.metadata/.plugins/org.eclipse.wst.server.core/tmp0/wtpwebapps/taphandle//nodebase/asucascz-tap/tables.json"));
	}

}
