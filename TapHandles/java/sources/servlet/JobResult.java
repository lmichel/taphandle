package servlet;

import java.io.IOException;
import javax.servlet.Servlet;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import session.UserSession;
import session.UserTrap;

/**
 * Servlet implementation class JobResult
 * @version $Id: JobResult.java 46 2011-07-26 12:55:13Z laurent.mistahl $
 */
public class JobResult extends RootServlet implements Servlet {
	private static final long serialVersionUID = 1L;

    /**
 	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		printAccess(request, false);
		try {
			String nodeKey = this.getParameter(request, "node");
			String jobId = this.getParameter(request, "jobid");
			if( nodeKey == null || nodeKey.length() ==  0 ) {
				reportJsonError(request, response, "jobstatus: no node specified");
				return;
			}
			if( jobId == null || jobId.length() ==  0 ) {
				reportJsonError(request, response, "jobstatus: no job specified");
				return;
			}
			UserSession session = UserTrap.getUserAccount(request);
			session.downloadResult(nodeKey, jobId);
			dumpJsonFile(session.getJobResultUrlPath(nodeKey, jobId), response);
		} catch (Exception e) {
			this.reportJsonError(request, response, e);
		}
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doGet(request, response);
	}


}
