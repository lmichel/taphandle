package tapaccess;

import resources.RootClass;
import session.NodeCookie;


/**
 * Check both query mode on a TAP node
 * @author michel
 *
 */
public class QueryModeChecker extends RootClass {
	private String endpoint;
	private String query;
	private String uploadQuery;
	private String workingDirectory;
	private boolean supportSyncMode = false;
	private boolean supportAsyncMode = false;
	private boolean supportUpload = false;
	private String resultFile;
	private String statusFile;
	private NodeCookie cookie;

	/**
	 * utility checking the working capabiliies
	 * @param endpoint : TAP root URL
	 * @param query: Query used for the run query test
	 * @param uploadQuery: Query used for the upload test
	 * @param workingDirectory: Place where to store downloaded files 
	 * @param syncOnly: not check async if true
	 */
	public QueryModeChecker(String endpoint, String query, String uploadQuery,
			String workingDirectory, boolean syncOnly) {
		super();
		this.endpoint = endpoint;
		this.query = query;
		this.uploadQuery = uploadQuery;
		this.workingDirectory = workingDirectory;

		this.resultFile = "asyncmodetest.xml";
		this.statusFile = this.workingDirectory + "asyncmodetest_status.xml";
		this.cookie = new NodeCookie();

		this.supportSyncMode = checkSyncMode();
		if( ! syncOnly )
			this.supportAsyncMode = checkAsyncMode();
		this.supportUpload = checkUploadMode();
	}

	/**
	 * @return
	 */
	public boolean supportSyncMode() {
		return supportSyncMode;
	}
	/**
	 * @return
	 */
	public boolean supportAsyncMode() {
		return supportAsyncMode;
	}
	public boolean supportUpload() {
		return supportUpload;
	}
	
	/**
	 * return true if the query succeed in sync mode
	 * @return
	 */
	private boolean checkSyncMode() {
		logger.info("Check query in synchronous mode on " + this.endpoint);
		try {
			TapAccess.runSyncJob(this.endpoint, this.query, this.workingDirectory + "syncmodetest.xml", new NodeCookie(), null);
		} catch(Exception e) {
			logger.info(this.endpoint + " does not support the synchronous mode: " + e.getMessage());
			return false;
		}
		logger.info(this.endpoint + " supports the query synchronous mode");
		return true;
	}
	/**
	 * return true if the query succeed in async mode
	 * @return
	 */
	private boolean checkAsyncMode() {
		synchronized (this) {
			String phase;
			String jobID;
			logger.info("Check query in asynchronous mode on " + this.endpoint);
			try {
				jobID = TapAccess.createAsyncJob(this.endpoint, this.query, this.workingDirectory + this.resultFile, this.cookie, null);
				TapAccess.runAsyncJob(this.endpoint, jobID,  this.statusFile, this.cookie);
				int cpt=1;
				do {
					if( (cpt++) > ASYNC_CHECK_ATTEMPTS ) {
						logger.warn("No result after " + (ASYNC_CHECK_POLLPERIOD*ASYNC_CHECK_ATTEMPTS) +"\": async mode considered as not working");
						TapAccess.deleteAsyncJob(this.endpoint, jobID, this.cookie);
						return false;
					}			
					phase = TapAccess.getAsyncJobPhase(this.endpoint, jobID,  this.workingDirectory + "asyncmodetest_phase.xml", this.cookie);
					Thread.sleep((ASYNC_CHECK_POLLPERIOD*1000));
				} while( phase.equals("EXECUTING") || phase.equals("PENDING")|| phase.equals("QUEUED"));
				String[] resultURLs = TapAccess.getAsyncJobResults(this.endpoint
						, jobID
						, this.statusFile
						, this.cookie);
				boolean resultFound =false;
				for( String r: resultURLs) {
					resultFound = true;
					TapAccess.getAsyncJobResultFile(r
								,  this.workingDirectory
								, "asyncmodetest.xml"
								, this.cookie);
				}
				if( !resultFound ){
					throw new Exception("NO result URL in async job response");
				}
			} catch(Exception e) {
				e.printStackTrace();System.exit(1);
				logger.warn(this.endpoint + " does not support queries in asynchronous mode: " + e.getMessage());
				return false;
			}
			logger.info(this.endpoint + " supports queries in asynchronous mode");
			return true;
		}
	}
	/**
	 * return true if the query with upload succeed in sync mode
	 * @return
	 */
	private boolean checkUploadMode() {
		logger.info("Check upload query on " + this.endpoint + " with query " + this.uploadQuery);
		try {
			TapAccess.runSyncJob(this.endpoint
					, this.uploadQuery
					, "taphandlesample," +  "http://saada.unistra.fr/saada/datasample/uploadsample.xml"
					, this.workingDirectory + "uploadtest.xml"
					, new NodeCookie()
			        , null);
		} catch(Exception e) {
			logger.warn(this.endpoint + " does not support upload (" + e.toString() + ")");
			return false;
		}
		logger.debug(this.endpoint + " supports the upload");
		return true;
	}
}
