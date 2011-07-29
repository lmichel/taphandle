package test;


import resources.RootClass;
import tapaccess.TapAccess;

/**
 * @author laurent
 * @version $Id: AsyncJobTest.java 46 2011-07-26 12:55:13Z laurent.mistahl $
 *
 */
public class AsyncJobTest  extends RootClass {


	private static void usage() {
		logger.error("USAGE: AsyncJobTest [url] [query]");
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
		TapAccess.createAsyncJob(args[0], args[1], "/home/michel/Desktop/tapbase/job.xml");
	}


}
