package test;


import resources.RootClass;
import session.NodeCookie;
import tapaccess.TapAccess;

/**
 * @author laurent
 * @version $Id$
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
		NodeCookie cookie=new NodeCookie();
		String jobID = TapAccess.createAsyncJob(args[0], args[1], "/home/michel/Desktop/tapbase/job.xml", cookie);
		System.out.println("Create: " + jobID + " " + cookie);
		System.out.println("Run: " + TapAccess.runAsyncJob(args[0], jobID,  "/home/michel/Desktop/tapbase/status.xml", cookie)+ " " + cookie);
		String phase = "";
		do {
			phase = TapAccess.getAsyncJobPhase(args[0], jobID,  "/home/michel/Desktop/tapbase/phase.xml", cookie);
			Thread.sleep(1000);
			
		} while( phase.equals("EXECUTING"));
		System.out.println("Pahse: " + phase+ " " + cookie);
		String[] resultURLs = TapAccess.getAsyncJobResults(args[0]
				, jobID
				, "/home/michel/Desktop/status.xml"
				, cookie);
		for( String r: resultURLs) {
			if( r.matches(".*\\.xml.*") ) {
				logger.debug("Download " + r);
				TapAccess.getAsyncJobResultFile(r
						, "/home/michel/Desktop/"
						, "result.xml"
						, cookie);
			}
		}

	}


}
