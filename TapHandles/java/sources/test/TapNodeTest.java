package test;

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
		TapNode tn = new TapNode(args[0], MetaBaseDir + "dczahuni-heidelbergde_system/", "dczahuni-heidelbergde_system/");
		
		tn.buildJsonTableAttributes("ivoa.ObsCore");
		logger.info("Test passed");
	}

}
