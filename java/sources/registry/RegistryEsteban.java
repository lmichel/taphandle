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

import metabase.TapNode;
import resources.RootClass;
import session.NodeCookie;
import tapaccess.TapAccess;
import translator.XmlToJson;

public class RegistryEsteban extends RootClass {
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
				boolean mustInit = iniAtStart.contains(ivoid) ;
				try {
					url = url.replaceAll("[^a-zA-Z\\d_-]*$", "");
					RegistryMark rm2 = new RegistryMark(key, ivoid, url, description, title, name, contact, mustInit, true);
					registryMarks.put(key, rm2);
				} catch (Exception e) {
					System.out.println(e);
				}
			}
		}
	}
	public static void main(String[] args) throws Exception {
		int i = 1;
		if (i==0) {
			// Partie non hardcodée
			for( String r: registryServers) {
				logger.info("Reading TAP registry: " + r);
				readRegistry(r);
			}
			// Récupération de tous les urls (et vérification de leur fonctionnement avec TapNode)
			for( RegistryMark rm: registryMarks.values()){
				System.out.println(rm.getUrl());
				TapNode tn = new TapNode(rm, "/tmp/meta");
				tn.check();
			}
		} else {
			// Isolation d'un lien pour le tester
			//String url = "https://ws.cadc-ccda.hia-iha.nrc-cnrc.gc.ca/argus";
			// String url = "https://pollux.oreme.org/vo/datalink/speconvol?";
			// + String url = "http://ia2-tap.oats.inaf.it:8080/wgetap/";
			// + String url = "https://psa.esa.int/psa-tap/tap/";
			// String url = "http://tapvizier.u-strasbg.fr/TAPVizieR/tap/";
			// String url = "http://simbad.cds.unistra.fr/simbad/sim-tap";
			// String url = "http://vespa-ae.oma.be/tap/";
			// + String url = "https://data.csiro.au/psrdavo/tap/";
			// String url = "http://cdpp-epntap.irap.omp.eu:80/tap";
			// String url = "http://jvo.nao.ac.jp/skynode/do/tap/spcam/";
			// String url = "https://koa.ipac.caltech.edu/TAP/";
			// String url = "http://dc.g-vo.org/tap/";
			String url = "https://mast.stsci.edu/vo-tap/api/v0.1/goods/";
			url = url.replaceAll("[^a-zA-Z\\d_-]*$", "");
			RegistryMark test_rm = new RegistryMark("key_test", "ivoid_test", url, "description_test", "title_test", "name_test", "contact_test", true, true);
			TapNode test_tn = new TapNode(test_rm, "/tmp/meta");
		}
		
	}
}
