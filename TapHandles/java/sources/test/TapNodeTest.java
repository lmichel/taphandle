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
		if( args.length != 1 ) {
			usage();
		}
		RegistryMark rm=null;
		TapNode tn=null;

		try {
		rm = new RegistryMark("tapnodetest", "ivo://tabnodetest", args[0], "test", false, true);
		tn = new TapNode(rm, "/tmp/meta");
		tn.buildJsonTableAttributes("oidb");
		} catch(Exception e) {
			e.printStackTrace();
		} finally {
			System.out.println(rm.getNodeKey());
			System.out.println(tn.supportUpload());
			
		}
	}

}
