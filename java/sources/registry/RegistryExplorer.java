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
	public static final String query = "SELECT\n"
			+ "rr.resource.ivoid AS ivoid,\n"
			+ "rr.interface.access_url AS url,\n"
			+ "rr.resource.res_description AS description,\n"
			+ "rr.resource.res_title AS title,\n"
			+ "rr.resource.short_name AS name,\n"
			+ "rr.res_role.email AS contact\n"
			+ "FROM rr.resource\n"
			+ "JOIN rr.capability ON ( rr.resource.ivoid=rr.capability.ivoid ) \n"
			+ "JOIN rr.interface ON ( rr.capability.ivoid=rr.interface.ivoid AND rr.capability.cap_index=rr.interface.cap_index ) \n"
			+ "JOIN rr.res_role ON (rr.resource.ivoid=rr.res_role.ivoid )\n"
			+ "WHERE \n"
			+ "( ( rr.capability.standard_id='ivo://ivoa.net/std/tap' ) ) AND \n"
			+ "( ( (rr.interface.intf_type = 'vs:paramhttp') ) ) AND\n"
			+ "( rr.res_role.base_role='contact' )";
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
		/**********
		try {
			/**
			offRegistryMarks.put("cdssimbad"       , new RegistryMark("simbad", "ivo://cds.simbad/tap"
					, "http://simbad.cds.unistra.fr/simbad/sim-tap"
					, "CDS Simbad TAP query engine", "Simbad", 	"SIMBAD TAP", "cds-question@unistra.fr", true, true));
			offRegistryMarks.put("cdsvizier"       , new RegistryMark("vizier", "ivo://cds.vizier/tap"
					, "http://tapvizier.cds.unistra.fr/TAPVizieR/tap/"
					, "CDS Vizier TAP query engine", "VizieR", "VizieR ObsTAP", "cds-question@unistra.fr", true, true));
			/*
			 * For the datalink demo
			 *
			offRegistryMarks.put("betacadc"       , new RegistryMark("betacadc", ""
					, "http://www.cadc-ccda.hia-iha.nrc-cnrc.gc.ca/tap"
					, "Datalink Service Demonstrator", "DSD", "DSD", "DSD@false.fr", true, true));
//			offRegistryMarks.put("3xmmdr8"       , new RegistryMark("3xmm", ""
//					, "http://xcatdb.unistra.fr/3xmmdr8/tap"
//					, "3rd XMM catalogue (DR8)", true, true));
/// 
 *
		} catch (MalformedURLException e) {
			logger.equals(e);
		}
		*******/
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
		validWorkingDirectory(metaBaseDir);
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
			String description = (String)sa.get(2);
			String title = (String)sa.get(3);
			String name = (String)sa.get(4);
			String contact = (String)sa.get(5);
			String key = name.replaceAll(" ", "_");
			RegistryMark rm;
			if( registryMarks.get(key) == null ) {
				if( (rm = offRegistryMarks.get(key)) != null ) {
					registryMarks.put(key, rm);
				} else {
					boolean mustInit = iniAtStart.contains(ivoid) ;
					try {
						RegistryMark rm2 = new RegistryMark(key, ivoid, url, description, title, name, contact, mustInit, true);
						registryMarks.put(key, rm2);
					} catch (Exception e) {
						e.printStackTrace();
					}
				}
			}
		}
	}
}
