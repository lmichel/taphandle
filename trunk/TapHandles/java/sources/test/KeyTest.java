package test;

import resources.RootClass;
import tapaccess.JoinKeysJob;

public class KeyTest extends RootClass{
	public static final String query="SELECTSSS keys.from_table, keys.target_table, from_column, target_column"
		+ " FROM keys" 
		+ " JOIN key_columns"
		+ " ON keys.key_id = key_columns.key_id";
	
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
		JoinKeysJob.getJoinKeys(args[0], "/home/michel/Desktop/tapbase");
	}


}
