package test;

import resources.RootClass;
import tapaccess.TablesReconstructor;

public class TablesReconstructorTest extends RootClass {

	private static void usage() {
		logger.error("USAGE: TapNodeTest [url] [directory]");
		System.exit(1);
	}  

	public static void main(String[] args) throws Exception{
		if( args.length != 2 ) {
			usage();
		}
		TablesReconstructor tr = new TablesReconstructor(args[0], args[1]);
		tr.printResult();
	}

}
