package registry;

import java.io.BufferedReader;
import java.io.FileReader;
import java.net.MalformedURLException;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;
import java.util.Arrays;
import java.util.HashSet;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;

import resources.RootClass;
import session.NodeCookie;
import tapaccess.TapAccess;
import translator.XmlToJson;

public class RegistryExplorer extends RootClass {
	public static final String[] registryServers = {
		"http://reg.g-vo.org/tap/"
	};
	public static final String query = "SELECT ivoid, access_url, res_title\n"
		+ "FROM rr.capability \n"
		+ "  NATURAL JOIN rr.interface\n"
		+ "  NATURAL JOIN rr.resource\n"
		//		+ "  NATURAL JOIN rr.table_column\n"
		//		+ "  NATURAL JOIN rr.res_table\n"
		+ "WHERE standard_id='ivo://ivoa.net/std/tap' AND intf_type = 'vs:paramhttp' ";
	public static final Set<String> iniAtStart = new HashSet<>(Arrays.asList(
			"ivo://cds.vizier/obstap",
			"ivo://org.gavo.dc/tap",
			"ivo://nasa.heasarc/services/xamin",
			"ivo://cxc.harvard.edu/cda",
			"ivo://archive.stsci.edu/caomtap",
			"ivo://esavo/psa/epntap"
			)
	);
	public static final Map<String, RegistryMark> registryMarks = new LinkedHashMap<String, RegistryMark>();
	public static final Map<String, RegistryMark> offRegistryMarks = new LinkedHashMap<String, RegistryMark>();
	/*
	 * init hard coded database
	 */
	static {
		try {
			offRegistryMarks.put("cdssimbad"       , new RegistryMark("simbad", "ivo://cds.simbad/tap"
					, "http://simbad.u-strasbg.fr/simbad/sim-tap"
					, "CDS Simbad TAP query engine", true, true));
			offRegistryMarks.put("cdsvizier"       , new RegistryMark("vizier", "ivo://cds.vizier/tap"
					, "http://tapvizier.u-strasbg.fr/TAPVizieR/tap/"
					, "CDS Vizier TAP query engine", true, true));
			/*
			 * For te datalink demo
			 */
			offRegistryMarks.put("betacadc"       , new RegistryMark("betacadc", ""
					, "http://www.cadc-ccda.hia-iha.nrc-cnrc.gc.ca/tap"
					, "Datalink Service Demonstrator", true, true));
//			offRegistryMarks.put("3xmmdr8"       , new RegistryMark("3xmm", ""
//					, "http://xcatdb.unistra.fr/3xmmdr8/tap"
//					, "3rd XMM catalogue (DR8)", true, true));
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
			logger.info("Reading TAP registry: " + r);
			readRegistry(r);
		}
		/*
		 * Add hardcoded entries which have not been found in the registry
		 */
		for( Entry<String,RegistryMark>  k: offRegistryMarks.entrySet()) {
			if( registryMarks.get(k.getKey()) == null ){
				logger.info("add static entry " + k.getKey() + " to the registry entry set (hardcoded)");
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
		String wdir       = metaBaseDir + "regexplorer";
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
					boolean mustInit = iniAtStart.contains(ivoid) ;
					registryMarks.put(key, new RegistryMark(key, ivoid, url, description, mustInit, true));
				}
			}
		}
	}
}
