package test;

import java.io.File;
import java.io.IOException;
import java.net.SocketTimeoutException;
import java.util.Date;

import resources.RootClass;
import session.NodeCookie;
import tapaccess.JobUtils;
import tapaccess.TapAccess;

public class TablesReconstructor extends RootClass {
	public static void main(String[] args) throws IOException{
		String url = "http://jvo.nao.ac.jp/skynode/do/tap/agn/";
		String nodeKey = "japan";
		String jobID = "123";
		String baseDirectory = System.getProperty("user.home") + "/Desktop/";
		String treepath = "tapvizieru-strasbgfrTAPVizieR>vizls>vizls.II/306/sdss8";
		String statusFileName = baseDirectory + "japan" + File.separator + "status.xml";
		String query = "Select schema_name from tap_schema.tables";
		Date startTime = new Date();
		String outputDir = "";
		try {
		
		validWorkingDirectory(baseDirectory + nodeKey);
		emptyDirectory(new File(baseDirectory + nodeKey));
		NodeCookie nodeCookie = new NodeCookie();
		outputDir = JobUtils.setupJobDir(nodeKey
				, baseDirectory + nodeKey + File.separator + "job_" + jobID + File.separator
				, statusFileName, treepath);
		nodeCookie.saveCookie(outputDir);
			System.out.println(TapAccess.runSyncJob(url, query, outputDir + "result.xml", nodeCookie, treepath));
			JobUtils.writeSyncJobStatus(nodeKey, outputDir, jobID, startTime, query);		

			logger.info("complete");		
		} catch(Exception e){
			JobUtils.writeSyncJobError(nodeKey, outputDir, jobID, startTime, query, e.getMessage());
		}

		
	}

}
