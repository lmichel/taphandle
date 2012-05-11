/**
 * 
 */
package session;

import java.net.HttpCookie;

import resources.RootClass;

/**
 * @author laurent
 * @version $Id$
 *
 */
public class JobRef extends RootClass {

	private String nodeKey;
	private String schema;
	private String table;
	private String jobId;
	private HttpCookie cookie;
	
	public JobRef(String nodeKey, String jobId, JobTreePath jtp, NodeCookie cookie)  {
		super();
		this.nodeKey = nodeKey;
		this.jobId = jobId;
		this.cookie = cookie.getCookie();		
		this.schema = jtp.getSchema();
		this.table = jtp.getTable();

	}
	public String getNodeKey() {
		return nodeKey;
	}
	public String getJobId() {
		return jobId;
	}
	public String getSchema() {
		return schema;
	}
	public String getTable() {
		return table;
	}
	public HttpCookie getCookie() {
		return cookie;
	}
	public boolean match(String nodeKey, String id){
		if( this.nodeKey.equals(nodeKey) && this.jobId.equals(id)) {
			return true;
		}
		return false;
	}
	
	public String toString() {
		return "Job " + jobId + " (node " + nodeKey + ",shema " + this.schema + ", table " + this.table + ")";
	}
}
