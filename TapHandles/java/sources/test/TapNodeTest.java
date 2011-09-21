package test;

import java.net.URLDecoder;

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
		if( args.length != 2 ) {
			usage();
		}
		String url = "http%3A%2F%2Fcds-dev-gm%3A8080%2Fsimbad%2Fsim-tap%2Fasync%2F1316098309553A%2Fresults%2Fresult";
		url = URLDecoder.decode(url, "ISO-8859-1");
		System.out.println(url);
		url = URLDecoder.decode(url, "ISO-8859-1");
		System.out.println(url);
		System.exit(1);
		TapNode tn;
		String[] nodes = {/*"http://cds-dev-gm:8080/simbad/sim-tap"
				, "http://xcatdb.u-strasbg.fr/xidresult/tap"
				, "http://www.cadc-ccda.hia-iha.nrc-cnrc.gc.ca/caom/"
				,*/ "http://dc.zah.uni-heidelberg.de/__system__/tap/run/tap"};
		for( String s: nodes) {

			tn = new TapNode(s, "/home/michel/Desktop/meta", "simbad");

			tn.buildJsonTableAttributes("ivoa.ObsCore");
		}
		logger.info("Test passed");
	}

}
