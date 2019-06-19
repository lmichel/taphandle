package servlet;

import java.io.CharConversionException;
import java.io.IOException;

import javax.servlet.Servlet;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import session.UserSession;
import session.UserTrap;
import translator.JsonUtils;

/**
 * Servlet implementation class JobStatus
 * @version $Id$
 */
public class JobSummary extends RootServlet implements Servlet {
	private static final long serialVersionUID = 1L;


	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		printAccess(request, false);
		response.setContentType("application/json; charset=UTF-8");
		try {
			String nodeKey = this.getParameter(request, "node");
			String jobId = this.getParameter(request, "jobid");
			if( nodeKey == null || nodeKey.length() ==  0 ) {
				reportJsonError(request, response, "jobsummary: no node specified");
				return;
			}
			if( jobId == null || jobId.length() ==  0 ) {
				reportJsonError(request, response, "jobsummary: no job specified");
				return;
			}
			UserSession session = UserTrap.getUserAccount(request);
			session.getJobStatus(nodeKey, jobId);
			//response.getWriter().print(session.getJobSummary(nodeKey, jobId));
			JsonUtils.teePrint(response, session.getJobSummary(nodeKey, jobId));
			//System.out.println(session.getJobSummary(nodeKey, jobId));
			//dumpJsonFile(session.getJobSummaryUrlPath(nodeKey, jobId), response);
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
