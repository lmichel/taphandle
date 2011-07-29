package session;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Iterator;

import metabase.NodeBase;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.JSONValue;

import resources.RootClass;
import tapaccess.TapAccess;
import translator.JsonUtils;

/**
 * @author laurent
 * @version $Id: UserSession.java 46 2011-07-26 12:55:13Z laurent.mistahl $
 *
 */
public class UserSession  extends RootClass {
	public final String sessionID;
	private final String baseDirectory;
	private jobStack jobStack = new jobStack();

	UserSession(String sessionID)  throws Exception {
		logger.info("Init session " + sessionID);
		this.sessionID = sessionID;
		validWorkingDirectory(SessionBaseDir);
		validWorkingDirectory(SessionBaseDir + sessionID);
		this.baseDirectory = SessionBaseDir + sessionID + File.separator;
	}

	private String getJobDir(String nodeKey, String jobID) {
		return this.baseDirectory + nodeKey + File.separator + "job_" + jobID + File.separator;
	}

	private String getJobUrlPath(String nodeKey, String jobID) {
		return "/" + RootClass.WEB_USERBASE_DIR + "/" + sessionID + "/" + nodeKey +  "/job_"  + jobID + "/";
	}

	private void deleteJobDir(String nodeKey, String jobID) throws Exception {		
		String jdir = getJobDir(nodeKey,  jobID);
		if( isWorkingDirectoryValid(jdir) ) {
			logger.info("Delete directory of job " + jobID + " in node "+ nodeKey);
			delete(new File(jdir));
		}
	}

	/**
	 * Delete recursively the content of the file f
	 * @param f file (or directory) to delete
	 * @throws IOException
	 */
	private void delete(File f) throws IOException {
		if (f.isDirectory()) {
			for (File c : f.listFiles())
				delete(c);
		}
		if (!f.delete())
			throw new FileNotFoundException("Failed to delete file: " + f);
	}

	public void destroySession() throws IOException{
		logger.info("Destry session " + this.sessionID);
		delete(new File(baseDirectory));
	}

	public void connectNode(String nodeKey) throws Exception {
		logger.debug("Session " + sessionID + " connect node " + nodeKey);
		validWorkingDirectory(this.baseDirectory + nodeKey);
	}
	
	public  String createJob(String nodeKey, String query, String treepath) throws Exception {
		String of1 = this.baseDirectory + nodeKey + File.separator + "status.xml";
		String jobID = TapAccess.createAsyncJob(NodeBase.getNode(nodeKey).getUrl()
				, query
				, of1);
		String finalDir = this.getJobDir(nodeKey, jobID);
		System.out.println(finalDir);
		validWorkingDirectory(finalDir);
		(new File(of1)).renameTo(new File(finalDir +  "status.xml"));
		(new File(of1.replaceAll("xml", "json"))).renameTo(new File(finalDir +  "status.json"));
		jobStack.pushJob(nodeKey, jobID);

		FileWriter fw = new FileWriter(finalDir + "treepath.json");
		fw.write(JsonUtils.convertTreeNode(treepath));
		fw.close();
		return jobID;
	}

	public  String startJob(String nodeKey, String jobID) throws Exception {
		String status = TapAccess.runAsyncJob(NodeBase.getNode(nodeKey).getUrl()
				, jobID
				, this.getJobDir(nodeKey, jobID) + "status.xml");
		return status;
	}
	public  String getJobStatus(String nodeKey, String jobID) throws Exception {
		try {
			String status = TapAccess.getAsyncJobPhase(NodeBase.getNode(nodeKey).getUrl()
					, jobID
					, this.getJobDir(nodeKey, jobID) + "status.xml");
			return status;
		} catch (Exception e) {
			e.printStackTrace();
			this.deleteJobDir(nodeKey,  jobID);
			jobStack.removeJob(nodeKey, jobID);
			return "REMOVED";
		}
	}
	public  void deleteJob(String nodeKey, String jobID) throws Exception {
		TapAccess.deleteAsyncJob(NodeBase.getNode(nodeKey).getUrl(), jobID);
		jobStack.removeJob(nodeKey, jobID);
		deleteJobDir(nodeKey, jobID);
		return ;
	}

	public  String downloadResult(String nodeKey, String jobID) throws Exception {
		String[] resultURLs = TapAccess.getAsyncJobResults(NodeBase.getNode(nodeKey).getUrl()
				, jobID
				, this.getJobDir(nodeKey, jobID) + "status.xml");
		for( String r: resultURLs) {
			if( r.matches(".*\\.xml.*") ) {
				logger.debug("Download " + r);
				TapAccess.getAsyncJobResultFile(r
						, this.getJobDir(nodeKey, jobID), "result.xml");
				return this.getJobDir(nodeKey, jobID) + "result.json";
			}
		}
		for( String r: resultURLs) {
			logger.debug("Download " + r);
			TapAccess.getAsyncJobResultFile(r
					, this.getJobDir(nodeKey, jobID), "result.xml");
			return this.getJobDir(nodeKey, jobID) + "result.json";

		}	
		return null;
	}
	
	public  String killJob(String nodeKey, String jobID) {
		return null;
	}

	/**
	 * Return a JSON description of all session's jobs
	 * [{"nodekey": key, "jobid": id, "status": status.json]}...]
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public String getJobList() throws Exception{
		JSONArray retour = new JSONArray();
		Iterator<JobRef> iterator = jobStack.iterator();
		ArrayList<JobRef> jobToUnstack = new ArrayList<JobRef>();
		while(iterator.hasNext()) {
			JobRef jobRef = iterator.next();
			String jobDirname = this.baseDirectory
			+ File.separator + jobRef.getNodeKey() 
			+ File.separator + "job_" + jobRef.getJobId()
			+ File.separator;
			File jobdir = new File(jobDirname);
			if( jobdir.exists() && jobdir.isDirectory()) {
				JSONObject job = new JSONObject();
				StringBuffer status = new StringBuffer();
				BufferedReader br = new BufferedReader(
						new FileReader(jobDirname + "status.json"));
				String line;
				while( (line = br.readLine()) != null ) {
					status.append(line);
				}
				br.close();
				job.put("status" , JSONValue.parse(status.toString()));		
				job.put("nodekey", jobRef.getNodeKey());
				job.put("jobid"  , jobRef.getJobId());
				retour.add(job);					
			}
			else {
				jobToUnstack.add(jobRef);
			}
		}
		
		for( JobRef jobRef:jobToUnstack ) {
			this.jobStack.removeJob(jobRef);
		}
		return retour.toJSONString();
	}

	/**
	 * @param nodeKey
	 * @param jobID
	 * @return
	 */
	public String getJobSummaryUrlPath(String nodeKey, String jobID) {
		return this.getJobUrlPath(nodeKey, jobID) + "status.json";	
	}
		
	/**
	 * @param nodeKey
	 * @param jobID
	 * @return
	 */
	public String getJobResultUrlPath(String nodeKey, String jobID) {
			return this.getJobUrlPath(nodeKey, jobID) + "result.json";	
		}

	/**
	 * @throws Exception
	 */
	public void refreshAllJobStatus() throws Exception{
		File dir = new File(this.baseDirectory);
		for( String nodeKey: dir.list()) {
			File nodedir = new File(this.baseDirectory + File.separator + nodeKey);
			if( nodedir.isDirectory()) {
				for( String jobdirname: nodedir.list()) {
					File jobdir = new File(this.baseDirectory + File.separator + nodeKey 
							+ File.separator + jobdirname);
					if( jobdirname.startsWith("job_") && jobdir.isDirectory()) {
						String jobid = jobdirname.replace("job_", "");;
						String status = this.getJobStatus(nodeKey, jobid);
						logger.debug("Node " + nodeKey + " Job " + jobid + " is " + status);
						jobStack.pushJob(nodeKey, jobid);
					}
				}
			}		
		}		
	}

	public static void main(String[] args) throws Exception{
		UserSession us = new UserSession("QWERTY");
		//String node = "xidresult_xcatdb";
		String node = "cadc-ccdahia-ihanrc-cnrcgcca_caom";		
		us.connectNode(node);
		String jobid = us.createJob(node, "select top 10 * from ivoa.ObsCore", "a;b;c");
		System.out.println("JOBID " + jobid);
		//		String phase = us.startJob(node, jobid);
		//		System.out.println("START " + phase);
		//		String[] results;
		//		while( (results = us.getJobResults(node, jobid)) == null ) {
		//			Thread.sleep(10000);
		//		}
		//		us.downloadResult(node, jobid, results);
		System.out.println(us.getJobStatus(node, jobid));
		//		System.out.println(us.getJobList());
		//		us.refreshAllJobStatus();
		//		System.out.println(us.getJobList());
	}
}
