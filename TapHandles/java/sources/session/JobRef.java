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
	private String jobId;
	private HttpCookie cookie;
	
	public JobRef(String nodeKey, String jobId, NodeCookie cookie) {
		super();
		this.nodeKey = nodeKey;
		this.jobId = jobId;
		this.cookie = cookie.getCookie();
	}
	public String getNodeKey() {
		return nodeKey;
	}
	public String getJobId() {
		return jobId;
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
		return "Job " + jobId + " (node " + nodeKey + ")";
	}
}
