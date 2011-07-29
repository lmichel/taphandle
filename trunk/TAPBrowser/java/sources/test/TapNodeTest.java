package test;

import resources.RootClass;
import metabase.TapNode;

/**
 * @author laurent
 * @version $Id: TapNodeTest.java 46 2011-07-26 12:55:13Z laurent.mistahl $
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
		TapNode tn = new TapNode(args[0], MetaBaseDir + "cadc-ccdahia-ihanrc-cnrcgcca_caom", "cadc-ccdahia-ihanrc-cnrcgcca_caom");
		tn.buildJsonTableAttributes("ivoa.ObsCore");
		logger.info("Test passed");
	}

}
