/**
 * 
 */
package session;

import resources.RootClass;

/**
 * @author laurent
 * @version $Id: JobRef.java 46 2011-07-26 12:55:13Z laurent.mistahl $
 *
 */
public class JobRef extends RootClass {

	private String nodeKey;
	private String jobId;
	public JobRef(String nodeKey, String jobId) {
		super();
		this.nodeKey = nodeKey;
		this.jobId = jobId;
	}
	public String getNodeKey() {
		return nodeKey;
	}
	public String getJobId() {
		return jobId;
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
