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
public class SyncTimeOutTest  extends RootClass {


	/**
	 * @param args
	 * @throws Exception 
	 */
	public static void main(String[] args) throws Exception {
		String url = "http://dc.zah.uni-heidelberg.de/tap/";
		String nodeKey = "nodekey";
		String query = "SELECT  TOP 100 * FROM ivoa.obscore WHERE CONTAINS(POINT('ICRS', s_ra, s_dec), CIRCLE('ICRS', 23.462083, +30.659917, 0.016666666666666666)) = 1 ";
		String jobID = "123";
		String baseDirectory = System.getProperty("user.home") + "/Desktop/gavo/";
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
