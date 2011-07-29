/**
 * 
 */
package session;

import java.util.Iterator;
import java.util.Stack;

import resources.RootClass;


/**
 * @author laurent
 * @version $Id: jobStack.java 46 2011-07-26 12:55:13Z laurent.mistahl $
 *
 */
public class jobStack extends RootClass {
	private final Stack<JobRef> jobSet = new Stack<JobRef>();

	protected  void pushJob(String nodeKey, String id) {
		for( int i=0 ; i<jobSet.size() ; i++ ) {
			JobRef jr = jobSet.get(i);
			if( jr.match(nodeKey, id) ) {
				logger.debug(jr + " already in stack");
				return;
			}
		}
		JobRef jr = new JobRef(nodeKey, id);
		logger.debug(jr + " pushed stack");
		jobSet.push(jr);
	}

	protected  void removeJob(String nodeKey, String id) {
		for( int i=0 ; i<jobSet.size() ; i++ ) {
			JobRef jr = jobSet.get(i);
			if( jr.match(nodeKey, id) ) {
				logger.debug("Remove " + jr + " from stack");
				jobSet.remove(jr);
			}
		}
	}

	protected  void removeJob(JobRef jobRef) {
		logger.debug("Remove job " + jobRef + " from stack");
		jobSet.remove(jobRef);
	}

	protected Iterator<JobRef> iterator() {
		return jobSet.iterator();
	}
}
