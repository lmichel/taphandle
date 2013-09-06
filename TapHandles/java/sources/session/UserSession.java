package session;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.net.URLDecoder;
import java.util.ArrayList;
import java.util.Date;
import java.util.Iterator;

import metabase.NodeBase;
import metabase.TapNode;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.JSONValue;

import resources.RootClass;
import tapaccess.JobUtils;
import tapaccess.TapAccess;
import tapaccess.TapException;

/**
 * @author laurent
 * @version $Id$
 *
 * 10/2012: store client address  order to transmit it  to TAP services
 */
public class UserSession  extends RootClass {
	public final String sessionID;
	private final String baseDirectory;
	private jobStack jobStack = new jobStack();
	public final String remoteAddress ;
	public final Goodies goodies;

	/**
	 * @param sessionID
	 * @throws Exception
	 */
	UserSession(String sessionID, String remoteAddress)  throws Exception {
		logger.info("Init user session " + sessionID);
		this.remoteAddress = remoteAddress;
		this.sessionID = sessionID;
		validWorkingDirectory(SessionBaseDir);
		validWorkingDirectory(SessionBaseDir + this.sessionID);
		this.baseDirectory = SessionBaseDir + this.sessionID + File.separator;
		this.goodies = new Goodies(this.baseDirectory + WEB_USER_GOODIES_DIR +File.separator );
	}

	/**
	 * @param nodeKey
	 * @param jobID
	 * @return
	 */
	private String getJobDir(String nodeKey, String jobID) {
		return this.baseDirectory + nodeKey + File.separator + "job_" + jobID + File.separator;
	}

	/**
	 * @param nodeKey
	 * @param jobID
	 * @return
	 */
	private String getJobUrlPath(String nodeKey, String jobID) {
		return "/" + RootClass.WEB_USERBASE_DIR + "/" + sessionID + "/" + nodeKey +  "/job_"  + jobID + "/";
	}

	/**
	 * @param nodeKey
	 * @param jobID
	 * @throws Exception
	 */
	private void deleteJobDir(String nodeKey, String jobID) throws Exception {		
		String jdir = getJobDir(nodeKey,  jobID);
		if( isWorkingDirectoryValid(jdir) ) {
			logger.info("Delete directory of job " + jobID + " in node "+ nodeKey);
			delete(new File(jdir));
		}
	}

	/**
	 * @throws IOException
	 */
	public void destroySession() throws IOException{
		logger.info("Destroy session " + this.sessionID);
		delete(new File(baseDirectory));
	}

	/**
	 * @param nodeKey
	 * @throws Exception
	 */
	public void connectNode(String nodeKey) throws Exception {
		logger.debug("Session " + sessionID + " connect node " + nodeKey);
		validWorkingDirectory(this.baseDirectory + nodeKey);
	}
	
	/**
	 * Copy the result of the job nodeKey.jobID into the goodies directory under the name
	 * goodiesName. xml suffix is added if not present
	 * @param nodeKey nodekey the job comes from
	 * @param jobID   id of the job top copy
	 * @param goodiesName job new name
	 * @throws Exception
	 */
	public void pushJobInGoodies(String nodeKey, String jobID, String goodiesName) throws Exception{
		this.goodies.pushJobResultInGoodies(nodeKey, this.getJobUrlPath(nodeKey, jobID),  goodiesName);
	}
	
	/**
	 * Starts a job attached to a node.
	 * If the node supports async mode, this mode is used.
	 * The job is in sync mode otherwise (e.g.
	 * @param nodeKey  : key of the node running the query
	 * @param query    : ADQ query
	 * @param treepath : Job treepath given by the client
	 * @return         : The job id
	 * @throws Exception
	 */
	public String startJob(String nodeKey, String query, String treepath) throws Exception {
		TapNode node =  NodeBase.getNode(nodeKey);
		/*
		 * Asynchronous job
		 */
		if( node.supportAsyncMode() ) {
			String jobId = this.createJob(nodeKey, query, treepath);
			startAsyncJob(nodeKey, jobId);
			return jobId;
			/*
			 * synchronous job
			 */
		} else {
			String jobID = "";
			do {
				jobID = Integer.toString((int)(Math.random() *1000));
			} while( jobStack.getJobCookie(nodeKey, jobID) != null ) ;
			String statusFileName = this.baseDirectory + nodeKey + File.separator + "status.xml";
			String outputDir = JobUtils.setupJobDir(nodeKey, this.getJobDir(nodeKey, jobID), statusFileName, treepath);
			NodeCookie nodeCookie = new NodeCookie();
			nodeCookie.saveCookie(outputDir);
			jobStack.pushJob(nodeKey, jobID, new JobTreePath(treepath), nodeCookie);
			Date startTime = new Date();
			try {
				TapAccess.runSyncJob(node.getUrl(), query, outputDir + VOTABLE_JOB_RESULT, nodeCookie, treepath);
				JobUtils.writeSyncJobStatus(nodeKey, outputDir, jobID, startTime, query);
			} catch(Exception e){
				JobUtils.writeSyncJobError(nodeKey, outputDir, jobID, startTime, query, e.getMessage());
			}
			return jobID;
		}
	}
	
		public String startJob(String nodeKey, String query, String uploadParam, String treepath) throws Exception {
			TapNode node =  NodeBase.getNode(nodeKey);
			/*
			 * Asynchronous job
			 */
			if( node.supportAsyncMode() ) {
				String jobId = this.createJob(nodeKey, query, uploadParam, treepath);
				startAsyncJob(nodeKey, jobId);
				return jobId;
				/*
				 * synchronous job
				 */
			} else {
				throw new Exception("File upload not supported in synchronous mode");
			}
		}

	/**
	 * @param nodeKey
	 * @param query
	 * @param treepath
	 * @return
	 * @throws Exception
	 */
	public  String createJob(String nodeKey, String query, String treepath) throws Exception {
		String statusFileName = this.baseDirectory + nodeKey + File.separator + "status.xml";
		NodeCookie nodeCookie = new NodeCookie();
		String jobID = TapAccess.createAsyncJob(NodeBase.getNode(nodeKey).getUrl()
				, query
				, statusFileName
				, nodeCookie
				, this.remoteAddress);
		nodeCookie.saveCookie(JobUtils.setupJobDir(nodeKey, this.getJobDir(nodeKey, jobID), statusFileName, treepath));
		jobStack.pushJob(nodeKey, jobID, new JobTreePath(treepath), nodeCookie);
		return jobID;
	}
	public  String createJob(String nodeKey, String query, String uploadParam, String treepath) throws Exception {
		String statusFileName = this.baseDirectory + nodeKey + File.separator + "status.xml";
		NodeCookie nodeCookie = new NodeCookie();
		String jobID = TapAccess.createAsyncJob(NodeBase.getNode(nodeKey).getUrl()
				, query
				, uploadParam
				, statusFileName
				, nodeCookie
				, this.remoteAddress);
		nodeCookie.saveCookie(JobUtils.setupJobDir(nodeKey, this.getJobDir(nodeKey, jobID), statusFileName, treepath));
		jobStack.pushJob(nodeKey, jobID, new JobTreePath(treepath), nodeCookie);
		return jobID;
	}

	/**
	 * @param nodeKey
	 * @param jobID
	 * @return
	 * @throws Exception
	 */
	public  String startAsyncJob(String nodeKey, String jobID) throws Exception {
		NodeCookie nc = new NodeCookie();
		nc.setCookie(jobStack.getJobCookie(nodeKey, jobID));
		String status = TapAccess.runAsyncJob(NodeBase.getNode(nodeKey).getUrl()
				, jobID
				, this.getJobDir(nodeKey, jobID) + "status.xml"
				, nc);
		return status;
	}
	/**
	 * @param nodeKey
	 * @param jobID
	 * @return
	 * @throws Exception
	 */
	public  String getJobStatus(String nodeKey, String jobID) throws Exception {
		try {
			if( NodeBase.getNode(nodeKey).supportAsyncMode() ) {
				NodeCookie nc = new NodeCookie();
				nc.setCookie(jobStack.getJobCookie(nodeKey, jobID));
				String status = TapAccess.getAsyncJobPhase(NodeBase.getNode(nodeKey).getUrl()
						, jobID
						, this.getJobDir(nodeKey, jobID) + "status.xml"
						, nc);
				return status;
			}
			return "SYNCMODE";
		} catch (Exception e) {
			logger.error(e.getMessage());
			this.deleteJobDir(nodeKey,  jobID);
			jobStack.removeJob(nodeKey, jobID);
			return "REMOVED";
		}
	}

	/**
	 * Returns the JSON job summary appended with the JOb treepath
	 * @param nodeKey
	 * @param jobID
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public String getJobSummary(String nodeKey, String jobId) throws Exception{
		Iterator<JobRef> iterator = jobStack.iterator();
		while(iterator.hasNext()) {
			JobRef jobRef = iterator.next();
			if( jobRef.getNodeKey().equals(nodeKey) && jobRef.getJobId().equals(jobId)) {
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
					JSONObject jstp = new JSONObject();
					jstp.put("nodekey", jobRef.getNodeKey());
					jstp.put("schema" , jobRef.getSchema());
					jstp.put("table"  , jobRef.getTable());
					jstp.put("jobid"  , jobRef.getJobId());
					job.put("treepath", jstp);
					job.put("session" , this.sessionID);
					return job.toJSONString();					
				}
				else {
					JSONObject job = new JSONObject();
					this.jobStack.removeJob(jobRef);
					job.put("errormsg", "Invalid JOb state: removed");
					return job.toJSONString();					
				}
			}
		}
		JSONObject job = new JSONObject();
		job.put("errormsg", "Job not found");
		return job.toJSONString();					
	}

	/**
	 * @param nodeKey
	 * @param jobID
	 * @throws Exception
	 */
	public  void deleteJob(String nodeKey, String jobID) throws Exception {
		NodeCookie nc = new NodeCookie();
		nc.setCookie(jobStack.getJobCookie(nodeKey, jobID));
		if( NodeBase.getNode(nodeKey) == null ) {
			throw new TapException("Node " + nodeKey + " not referenced by the server");
		}
		TapAccess.deleteAsyncJob(NodeBase.getNode(nodeKey).getUrl(), jobID, nc);
		jobStack.removeJob(nodeKey, jobID);
		deleteJobDir(nodeKey, jobID);
		return ;
	}

	/**
	 * @param nodeKey
	 * @param jobID
	 * @return
	 * @throws Exception
	 */
	public  String downloadResult(String nodeKey, String jobID) throws Exception {
		NodeCookie nc = new NodeCookie();
		nc.setCookie(jobStack.getJobCookie(nodeKey, jobID));
		String[] resultURLs = TapAccess.getAsyncJobResults(NodeBase.getNode(nodeKey).getUrl()
				, jobID
				, this.getJobDir(nodeKey, jobID) + "status.xml"
				, nc);
		for( String r: resultURLs) {
			if( r.matches(".*\\.xml.*") ) {
				logger.debug("Download " + r);
				TapAccess.getAsyncJobResultFile(r
						, this.getJobDir(nodeKey, jobID)
						, VOTABLE_JOB_RESULT
						, nc);
				return this.getJobDir(nodeKey, jobID) + JSON_JOB_RESULT;
			}
		}
		for( String r: resultURLs) {
			String path =  URLDecoder.decode(r, "ISO-8859-1");
			logger.debug("Download " + NodeBase.getNode(nodeKey).getAbsoluteURL(path));
			TapAccess.getAsyncJobResultFile(NodeBase.getNode(nodeKey).getAbsoluteURL(path)
					, this.getJobDir(nodeKey, jobID)
					, VOTABLE_JOB_RESULT
					, nc);
			return this.getJobDir(nodeKey, jobID) + JSON_JOB_RESULT;

		}	
		return null;
	}

	/**
	 * @param nodeKey
	 * @param jobID
	 * @return
	 */
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
				JSONObject jstp = new JSONObject();
				jstp.put("nodekey", jobRef.getNodeKey());
				jstp.put("schema" , jobRef.getSchema());
				jstp.put("table"  , jobRef.getTable());
				jstp.put("jobid"  , jobRef.getJobId());
				job.put("treepath", jstp);
				job.put("session" , this.sessionID);
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
	public String getJobTreepathUrlPath(String nodeKey, String jobID) {
		return this.getJobUrlPath(nodeKey, jobID) + "treepath.json";	
	}

	/**
	 * @param nodeKey
	 * @param jobID
	 * @return
	 */
	public String getJobResultUrlPath(String nodeKey, String jobID) {
		return this.getJobUrlPath(nodeKey, jobID) + JSON_JOB_RESULT;	
	}

	/**
	 * @param nodeKey
	 * @param jobID
	 * @return
	 */
	public String getJobDownloadUrlPath(String nodeKey, String jobID) {
		return this.getJobUrlPath(nodeKey, jobID) + VOTABLE_JOB_RESULT;	
	}

	public String getZipDownloadPath(){
		return "/" + RootClass.WEB_USERBASE_DIR + "/" + sessionID + "/zipballs/cart.zip";
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
						NodeCookie nc = new NodeCookie();
						nc.restoreCookie(nodedir + File.separator + jobdirname);
						JobTreePath jtp = new JobTreePath(new File(jobdir + File.separator + "treepath.json"));
						jobStack.pushJob(nodeKey, jobid, jtp, nc);
					}
				}
			}		
		}		
	}

	public static void main(String[] args) throws Exception{
		UserSession us = new UserSession("QWERTY", null);
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
