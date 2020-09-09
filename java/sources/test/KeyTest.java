package test;

import resources.RootClass;
import tapaccess.JoinKeysJob;

public class KeyTest extends RootClass{
	private static void usage() {
		logger.error("USAGE: KeyTest [url] ");
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
		JoinKeysJob.getJoinKeys(args[0], PERSONAL_DIRECTORY+"/Desktop/tapbase"); ///home/michel/Desktop/tapbase
	}


}
