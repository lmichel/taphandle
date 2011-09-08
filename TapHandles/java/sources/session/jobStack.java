/**
 * 
 */
package session;

import java.net.HttpCookie;
import java.util.Iterator;
import java.util.Stack;

import resources.RootClass;


/**
 * @author laurent
 * @version $Id$
 *
 */
public class jobStack extends RootClass {
	private final Stack<JobRef> jobSet = new Stack<JobRef>();

	protected  void pushJob(String nodeKey, String jobID, NodeCookie cookie) {
		for( int i=0 ; i<jobSet.size() ; i++ ) {
			JobRef jr = jobSet.get(i);
			if( jr.match(nodeKey, jobID) ) {
				logger.debug(jr + " already in stack");
				return;
			}
		}
		JobRef jr = new JobRef(nodeKey, jobID, cookie);
		logger.debug(jr + " pushed stack");
		jobSet.push(jr);
	}

	protected  void removeJob(String nodeKey, String jobID) {
		for( int i=0 ; i<jobSet.size() ; i++ ) {
			JobRef jr = jobSet.get(i);
			if( jr.match(nodeKey, jobID) ) {
				logger.debug("Remove " + jr + " from stack");
				jobSet.remove(jr);
			}
		}
	}
	
	public  HttpCookie getJobCookie(String nodeKey, String jobID) {
		for( int i=0 ; i<jobSet.size() ; i++ ) {
			JobRef jr = jobSet.get(i);
			if( jr.match(nodeKey, jobID) ) {
				return jr.getCookie();
			}
		}
		return null;
	}

	protected  void removeJob(JobRef jobRef) {
		logger.debug("Remove job " + jobRef + " from stack");
		jobSet.remove(jobRef);
	}

	protected Iterator<JobRef> iterator() {
		return jobSet.iterator();
	}
}
