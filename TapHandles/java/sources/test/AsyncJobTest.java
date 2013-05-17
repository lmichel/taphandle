package test;


import java.io.File;

import metabase.NodeBase;

import resources.RootClass;
import session.NodeCookie;
import tapaccess.JobUtils;
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
		if( args.length != 3 ) {
			usage();
		}
		
		String url = args[0];
		String nodeKey = args[1];
		String query = args[2];
		String baseDirectory = "/home/michel/Desktop/tapbase/";
		String treepath = "tapvizieru-strasbgfrTAPVizieR>vizls>vizls.II/306/sdss8";
		String statusFileName = baseDirectory + nodeKey + File.separator + "status.xml";
		validWorkingDirectory(baseDirectory + nodeKey);
		
		
		NodeCookie cookie=new NodeCookie();
		
		
		NodeCookie nodeCookie = new NodeCookie();
		String jobID = TapAccess.createAsyncJob(url
				, query
				, statusFileName
				, nodeCookie
				, null);
		String outputDir = JobUtils.setupJobDir(nodeKey
				, baseDirectory + nodeKey + File.separator + "job_" + jobID + File.separator
		        , statusFileName, treepath);		
		nodeCookie.saveCookie(JobUtils.setupJobDir(nodeKey, outputDir, statusFileName, treepath));
	
		
		
		System.out.println("Create: " + jobID + " " + cookie);
		System.out.println("Run: " + TapAccess.runAsyncJob(args[0], jobID,  outputDir + "status.xml", cookie)+ " " + cookie);
		String phase = "";
		do {
			phase = TapAccess.getAsyncJobPhase(args[0], jobID,  outputDir + "phase.xml", cookie);
			Thread.sleep(1000);
			
		} while( phase.equals("EXECUTING"));
		System.out.println("Phase: " + phase+ " " + cookie);
		String[] resultURLs = TapAccess.getAsyncJobResults(args[0]
				, jobID
				, outputDir + "status.xml"
				, cookie);
		for( String r: resultURLs) {
				logger.debug("Download " + r);
				TapAccess.getAsyncJobResultFile(r
						, outputDir
						, "VOTABLE_RESULT"
						, cookie);
		}

	}


}
