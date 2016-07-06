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
		rm = new RegistryMark("tapnodetest", "ivo://tapnodetest", args[0], "test", false, true);
		tn = new TapNode(rm, "/tmp/meta");
<<<<<<< HEAD:TapHandles/java/sources/test/TapNodeTest.java
		//tn.buildJsonTableAttributes("viz2.III/205/catalog");
		//tn.buildJsonTableAttributes("III/205/catalog");
=======
//		tn.buildJsonTableDescription("PhotoObjDR7");
//		tn.buildJsonTableAttributes("PhotoObjDR7");
////		tn.buildJsonTableAttributes("III/205/catalog");
//		tn.buildJsonTableAttributes("\"I/306A/types\"");
		tn.buildJsonTableDescription("viz2.III/205/catalog");
>>>>>>> 0d85a640c7393334381c177f4623783e3aeca709:taphandle/java/sources/test/TapNodeTest.java
		} catch(Exception e) {
			e.printStackTrace(System.out);
		} finally {
			System.out.println(rm.getNodeKey());
			System.out.println("Sync   " + tn.supportSyncMode());
			System.out.println("ASync  " + tn.supportAsyncMode());
			System.out.println("Upload " + tn.supportUpload());
			
		}
	}

}
