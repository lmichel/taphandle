package test;


import java.io.File;
import java.net.SocketTimeoutException;
import java.util.Date;

import resources.RootClass;
import session.NodeCookie;
import tapaccess.JobUtils;
import tapaccess.TapAccess;

/**
 * @author laurent
 * @version $Id: AsyncJobTest.java 159 2012-10-10 11:52:54Z laurent.mistahl $
 *
 */
public class TAPMango  extends RootClass {


	/**
	 * @param args
	 * @throws Exception 
	 */
	public static void main(String[] args) throws Exception {
		String url = "https://xcatdb.unistra.fr/xtapdb/";
		String nodeKey = "nodekey";
		String query = "SELECT TOP 10 * FROM mergedentry ";
		String jobID = "123";
		String baseDirectory = System.getProperty("user.home") + "/Desktop/mango/";
		String treepath = "A>B>C";
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
			System.out.println(TapAccess.runSyncJob(url, query, outputDir + VOTABLE_JOB_RESULT, nodeCookie, treepath));
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
