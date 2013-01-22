package test;


import java.io.BufferedReader;
import java.io.FileReader;

import resources.RootClass;
import session.NodeCookie;
import tapaccess.TapAccess;

/**
 * @author laurent
 * @version $Id: AsyncJobTest.java 159 2012-10-10 11:52:54Z laurent.mistahl $
 *
 */
public class SyncJobTest  extends RootClass {


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
		NodeCookie cookie=new NodeCookie();
		String outFile = TapAccess.runSyncJob(args[0], args[1], "/home/michel/Desktop/job.xml", cookie, null);
		
		BufferedReader br = new BufferedReader(new FileReader(outFile));
		String str;
		while( (str = br.readLine()) != null) {
			System.out.println(str);
		}

	}


}
