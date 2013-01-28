package registry;

import java.io.BufferedReader;
import java.io.FileReader;
import java.net.MalformedURLException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Map.Entry;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;

import resources.RootClass;
import session.NodeCookie;
import tapaccess.TapAccess;
import translator.XmlToJson;

public class RegistryExplorer extends RootClass {
	public static final String[] registryServers = {
		"http://dc.zah.uni-heidelberg.de/__system__/tap/run/tap/"
	};
	public static final String query = "SELECT ivoid, access_url, res_title\n"
		+ "FROM rr.capability \n"
		+ "  NATURAL JOIN rr.interface\n"
		+ "  NATURAL JOIN rr.resource\n"
		//		+ "  NATURAL JOIN rr.table_column\n"
		//		+ "  NATURAL JOIN rr.res_table\n"
		+ "WHERE standard_id='ivo://ivoa.net/std/tap' AND intf_type = 'vs:paramhttp' ";
	public static final Map<String, RegistryMark> registryMarks = new LinkedHashMap<String, RegistryMark>();
	public static final Map<String, RegistryMark> offRegistryMarks = new LinkedHashMap<String, RegistryMark>();
	/*
	 * init hard coded database
	 */
	static {
		try {
			offRegistryMarks.put("xcatdb"       , new RegistryMark("xcatdb", ""
					, "http://xcatdb.u-strasbg.fr/2xmmidr3/tap"
					, "SSC interface of the XMM-Newton catalogue", true, false));
			offRegistryMarks.put("vizier"       , new RegistryMark("vizier", ""
					, "http://tapvizier.u-strasbg.fr/TAPVizieR/tap/"
					, "CDS Vizier TAP query engine", true, true));
			offRegistryMarks.put("simbad"       , new RegistryMark("simbad", "ivo://cds.simbad/tap"
					, "http://simbad.u-strasbg.fr/simbad/sim-tap"
					, "CDS Simbad TAP query engine", true, true));
			offRegistryMarks.put("cadc"         , new RegistryMark("cadc"  , "ivo://cadc.nrc.ca/tap"
					, "http://www.cadc-ccda.hia-iha.nrc-cnrc.gc.ca/tap"
					, "CADC Table Query (TAP) Service", true, true));
			offRegistryMarks.put("gavo"         , new RegistryMark("gavo"  , "ivo://org.gavo.dc/__system__/tap/run"
					, "http://dc.zah.uni-heidelberg.de/__system__/tap/run/tap"
					, "GAVO data center TAP service", true, true));
			offRegistryMarks.put("heasarc-xamin", new RegistryMark("heasarc-xamin", ""
					, "http://heasarc.gsfc.nasa.gov/xamin/vo/tap"
					, "HEASARCH Table Query (TAP) Service", true, true));
		} catch (MalformedURLException e) {
			logger.equals(e);
		}
	}

	/**
	 * @param key
	 * @return
	 */
	public static RegistryMark getregistryMarkByKey(String key){
		return registryMarks.get(key);
	}
	/**
	 * @param url
	 * @return
	 */
	public static RegistryMark getregistryMarkByUrl(String url){
		for( RegistryMark rm: registryMarks.values()){
			if( rm.hasSamUrlAs(url)) {
				return rm;
			}
		}
		return null;
	}

	/**
	 * Read all registries
	 * @throws Exception
	 */
	public static void readRegistries() throws Exception {
		for( String r: registryServers) {
			readRegistry(r);
		}
		/*
		 * Add hardcoded entries which have not been found in the registry
		 */
		for( Entry<String,RegistryMark>  k: offRegistryMarks.entrySet()) {
			if( registryMarks.get(k.getKey()) == null ){
				logger.info("add entry " + k.getKey() + " to the registry entry set (hardcoded)");
				registryMarks.put(k.getKey(), k.getValue());
			}
		}
	}
	/**
	 * Extract all tap marks from the registry regUrl
	 * Store what is read if it is not already stored nether already 
	 * in offRegistryMarks
	 * @param regUrl
	 * @throws Exception
	 */
	private static final void readRegistry(String regUrl) throws Exception{
		logger.info("Read TAP registry " + regUrl);
		/*
		 * Connect the TAP registry
		 */
		NodeCookie cookie=new NodeCookie();
		String wdir       = MetaBaseDir + "regexplorer";
		String jsonResult = wdir +  "/regresult.json";
		String xmlResult  = wdir +  "/regresult.xml";
		validWorkingDirectory(wdir);
		TapAccess.runSyncJob(regUrl, query, xmlResult, cookie, null);
		XmlToJson.translateResultTable(xmlResult, jsonResult);

		BufferedReader br = new BufferedReader(new FileReader(jsonResult));
		JSONParser p = new JSONParser();
		JSONObject jsonObject = (JSONObject) p.parse(br);
		JSONArray array = (JSONArray) jsonObject.get("aaData");
		for( int i=0 ; i<array.size() ; i++) {
			JSONArray sa = (JSONArray) array.get(i);
			String ivoid = (String)sa.get(0);
			String url = (String)sa.get(1);
			String key = ShortNameBuilder.getShortName(ivoid, url);
			String description = (String)sa.get(2);
			RegistryMark rm;
			if( registryMarks.get(key) == null ) {
				if( (rm = offRegistryMarks.get(key)) != null ) {
					registryMarks.put(key, rm);
				} else {
					registryMarks.put(key, new RegistryMark(key, ivoid, url, description, false, true));
				}
			}
		}
	}
}
