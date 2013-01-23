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
	private String workingDirectory;
	private boolean supportSyncMode = false;
	private boolean supportAsyncMode = false;
	
	public QueryModeChecker(String endpoint, String query,
			String workingDirectory) {
		super();
		this.endpoint = endpoint;
		this.query = query;
		this.workingDirectory = workingDirectory;
		
		this.supportSyncMode = checkSyncMode();
		this.supportAsyncMode = checkAsyncMode();
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
	/**
	 * return true if the query succeed in sync mode
	 * @return
	 */
	private boolean checkSyncMode() {
		logger.debug("Check query in synchronous mode on " + this.endpoint);
		try {
			TapAccess.runSyncJob(this.endpoint, this.query, this.workingDirectory + "syncmodetest.xml", new NodeCookie(), null);
		} catch(Exception e) {
			return false;
		}
		logger.debug(this.endpoint + " supports the query synchronous mode");
		return true;
	}
	/**
	 * return true if the query succeed in async mode
	 * @return
	 */
	private boolean checkAsyncMode() {
		logger.debug("Check query in asynchronous mode on " + this.endpoint);
		try {
			String resultFile = "asyncmodetest.xml";
			String statusFile = this.workingDirectory + "asyncmodetest_status.xml";
			NodeCookie cookie = new NodeCookie();
			String jobID = TapAccess.createAsyncJob(this.endpoint,query, this.workingDirectory + resultFile, cookie, null);
			TapAccess.runAsyncJob(this.endpoint, jobID,  statusFile, cookie);
			String phase = "";
			int cpt=0;
			do {
				phase = TapAccess.getAsyncJobPhase(this.endpoint, jobID,  this.workingDirectory + "asyncmodetest_phase.xml", cookie);
				Thread.sleep(2000);
				if( (cpt++) > 4 ) {
					logger.warn("No result after 10\": async mode considered as not working");
					TapAccess.deleteAsyncJob(phase, jobID, cookie);
					return false;
				}			
			} while( phase.equals("EXECUTING") || phase.equals("PENDING"));
			String[] resultURLs = TapAccess.getAsyncJobResults(this.endpoint
					, jobID
					, statusFile
					, cookie);
			for( String r: resultURLs) {
				if( r.matches(".*\\.xml.*") ) {
					TapAccess.getAsyncJobResultFile(r
							,  this.workingDirectory
							, "asyncmodetest.xml"
							, cookie);
				}
			}
		} catch(Exception e) {
			return false;
		}
		logger.debug(this.endpoint + " supports the query asynchronous mode");
		return true;
	}

}
