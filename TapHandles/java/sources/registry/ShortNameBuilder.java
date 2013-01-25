package registry;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Map.Entry;

import resources.RootClass;

/**
 * @author michel
 *
 */
public class ShortNameBuilder extends RootClass {
	public static final String GLU = "-";
	public static final Map<String, String> reservedUrls;
	public static final Map<String, String> reservedIvornDomains;

	static {
		reservedUrls = new LinkedHashMap<String, String>();
		reservedUrls.put("http://tapvizier.u-strasbg.fr/TAPVizieR/tap"           , "vizier");
		reservedUrls.put("http://xcatdb.u-strasbg.fr/2xmmidr3/tap"               , "xcatdb");
		reservedUrls.put("http://www.cadc-ccda.hia-iha.nrc-cnrc.gc.ca/tap"       , "cadc");
		reservedUrls.put("http://dc.zah.uni-heidelberg.de/__system__/tap/run/tap", "gavo");
		reservedUrls.put("http://simbad.u-strasbg.fr/simbad/sim-tap"             , "simbad");
		reservedUrls.put("http://simbad.u-strasbg.fr:80/simbad/sim-tap"          , "simbad");
		reservedUrls.put("http://heasarc.gsfc.nasa.gov/xamin/vo/tap"             , "heasarc-xamin");
		
		reservedIvornDomains = new LinkedHashMap<String, String>();
		reservedIvornDomains.put("wfau.roe.ac.uk", "wfau.roe");
		reservedIvornDomains.put("vopdc.obspm"  , "voparis");
		reservedIvornDomains.put("uk.ac.cam.ast" , "cam.ast");
		reservedIvornDomains.put("sao.ru"        , "sao.ru");
		reservedIvornDomains.put("org.gavo.dc"   , "gavo");
		reservedIvornDomains.put("nasa.heasarc"  , "heasarc");
		reservedIvornDomains.put("jvo"           , "jvo");
		reservedIvornDomains.put("cds.simbad"    , "simbad");
		reservedIvornDomains.put("xcatdb"        , "xcatdb");
		reservedIvornDomains.put("au.csiro"      , "csiro");
	}

	/**
	 * Build a shot name from the ivoid if not null and well formed
	 * @param ivoid
	 * @return
	 */
	private static String buildFromIvoid(String ivoid){
		if( ivoid == null ) {
			return null;
		} else {
			String str;
			String[] pe;
			pe =  ivoid.split("/");
			if( pe.length < 4 ) {
				logger.warn("ivorn " + ivoid + " badly formed");
				return null;
			} else if( (str = reservedIvornDomains.get(pe[2])) == null ) {
				str = pe[2];
			}
			return str + GLU + pe[pe.length - 1];		
		}
	}		
	
	/**
	 * Build a shot name from the url if not null and well formed
	 * @param url
	 * @return
	 */
	private static String buildFromUrl(String url){
		if( url == null ) {
			return null;
		} else {
			String str;
			String[] pe;
			pe =  url.split("/");
			if( pe.length < 4 ) {
				logger.warn("url " + url + " badly formed");
				return null;
			}
			str = pe[2];
			for( Entry<String, String> e: reservedIvornDomains.entrySet()) {
				if( url.indexOf(e.getKey()) != -1 ) {
					str = e.getValue();
					break;
				}
			}
			return str + GLU + pe[pe.length - 1];		
		}
	}		
	
	/**
	 * Method to be called from outside 
	 * @param ivoid
	 * @param url
	 * @return
	 */
	public static final String getShortName(String ivoid, String url) {
		/*
		 * Check first if the url is preloaded
		 * The map is scan because of a possible trailing / 
		 * making the url not matching exactly the key
		 */
		for( Entry<String, String> e: reservedUrls.entrySet()) {
			if( url.startsWith(e.getKey() )) {
				return e.getValue();
			}
		}
		String retour;
		if( (retour = buildFromIvoid(ivoid)) == null) {
			retour = buildFromUrl(url);
		}
		return retour;		
	}

}
