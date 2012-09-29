package servlet;

import java.io.IOException;

import javax.servlet.Servlet;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import resources.RootClass;
import session.UserSession;
import session.UserTrap;

/**
 * Servlet implementation class JobResult
 * @version $Id$
 */
public class JobResult extends RootServlet implements Servlet {
	private static final long serialVersionUID = 1L;

	/**
 	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		printAccess(request, false);
		response.setContentType("application/json");
		try {
			String nodeKey = this.getParameter(request, "node");
			String jobId = this.getParameter(request, "jobid");
			String format = this.getParameter(request, "format");
			String sessionId = this.getParameter(request, "session");
			if( nodeKey == null || nodeKey.length() ==  0 ) {
				reportJsonError(request, response, "jobstatus: no node specified");
				return;
			}
			if( jobId == null || jobId.length() ==  0 ) {
				reportJsonError(request, response, "jobstatus: no job specified");
				return;
			}
			UserSession session = UserTrap.getUserAccount(request);
			/*
			 * If a session ID is given, the request does not comes from the taphandle client (whicg has its own session,
			 * but it has been delegated to a external client such as SAMP
			 * In this case, on have not to do more thna returning a file. If it does not exist, an error is risen.
			 */
			if( sessionId != null && sessionId.length() > 0) {
				String resultfile =  "/" + RootClass.WEB_USERBASE_DIR 
				                   + "/" + sessionId 
				                   + "/" + nodeKey 
				                   +  "/job_"  + jobId 
				                   + "/result.xml";
				downloadProduct(request, response,  getServletContext().getRealPath(resultfile), jobId + ".xml");
			}
			else if( "json".equals(format)) {
				String resultfile = session.getJobResultUrlPath(nodeKey, jobId);
				if( getServletContext().getResource(resultfile) == null ) {
					session.downloadResult(nodeKey, jobId);
				}
				dumpJsonFile(resultfile, response);
			} else {
				String resultfile = session.getJobDownloadUrlPath(nodeKey, jobId);
				if( getServletContext().getResource(resultfile) == null ) {
					session.downloadResult(nodeKey, jobId);
				}
				downloadProduct(request, response, getServletContext().getRealPath(resultfile), jobId + ".xml");
			}
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
