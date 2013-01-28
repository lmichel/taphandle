package test;

import java.net.URLDecoder;

import registry.RegistryMark;
import resources.RootClass;
import metabase.TapNode;

/**
 * @author laurent
 * @version $Id$
 *
 */
public class TapNodeTest  extends RootClass {

	private static void usage() {
		logger.error("USAGE: TapNodeTest [url] [directory]");
		System.exit(1);
	}  
	/**
	 * @param args
	 * @throws Exception 
	 */
	public static void main(String[] args) throws Exception {
		TapNode tn;
		System.out.println(System.getProperty("user.dir"));
		String[] nodes = {/*"http://cds-dev-gm:8080/simbad/sim-tap"
				, "http://xcatdb.u-strasbg.fr/xidresult/tap"
				, "http://www.cadc-ccda.hia-iha.nrc-cnrc.gc.ca/caom/"
				, "http://dc.zah.uni-heidelberg.de/__system__/tap/run/tap" */
						"http://heasarc.gsfc.nasa.gov/xamin/vo/tap"};
		for( String s: nodes) {
			RegistryMark rm = new RegistryMark("gavo", "ivo", s, "test", false, true);
			tn = new TapNode(rm, "/tmp/meta");

			//tn.buildJsonTableAttributes("ivoa.obscore");
		}
		logger.info("Test passed");
	}

}
