package test;


import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.net.SocketTimeoutException;
import java.util.Date;

import resources.RootClass;
import session.JobTreePath;
import session.NodeCookie;
import tapaccess.JobUtils;
import tapaccess.TapAccess;
import translator.XmlToJson;

/**
 * @author laurent
 * @version $Id: AsyncJobTest.java 159 2012-10-10 11:52:54Z laurent.mistahl $
 *
 */
public class SyncJobTest  extends RootClass {


	private static void usage() {
		logger.error("USAGE: AsyncJobTest [url] [key] [query]");
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
		String jobID = "123";
		String baseDirectory = "/home/michel/Desktop/tapbase/";
		String treepath = "tapvizieru-strasbgfrTAPVizieR>vizls>vizls.II/306/sdss8";
		String statusFileName = baseDirectory + nodeKey + File.separator + "status.xml";
		Date startTime = new Date();
		
		validWorkingDirectory(baseDirectory + nodeKey);
		emptyDirectory(new File(baseDirectory + nodeKey));
		NodeCookie nodeCookie = new NodeCookie();
		String outputDir = JobUtils.setupJobDir(nodeKey
				, baseDirectory + nodeKey + File.separator + "job_" + jobID + File.separator
				, statusFileName, treepath);
		nodeCookie.saveCookie(outputDir);
		try {
			System.out.println(TapAccess.runSyncJob(url, query, outputDir + "result.xml", nodeCookie, treepath));
			JobUtils.writeSyncJobStatus(nodeKey, outputDir, jobID, startTime, query);		

			logger.info("complete");		
		} catch(SocketTimeoutException e){
			JobUtils.writeSyncJobError(nodeKey, outputDir, jobID, startTime, query, e.getMessage());
		}

		//		NodeCookie cookie=new NodeCookie();
		//		String outFile = TapAccess.runSyncJob(args[0], args[1], "/home/michel/Desktop/job.xml", cookie, null);
		//		

	}


}
