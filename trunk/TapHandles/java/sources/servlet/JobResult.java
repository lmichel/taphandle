package servlet;

import java.io.File;
import java.io.IOException;
import javax.servlet.Servlet;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

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
		try {
			String nodeKey = this.getParameter(request, "node");
			String jobId = this.getParameter(request, "jobid");
			String format = this.getParameter(request, "format");
			if( nodeKey == null || nodeKey.length() ==  0 ) {
				reportJsonError(request, response, "jobstatus: no node specified");
				return;
			}
			if( jobId == null || jobId.length() ==  0 ) {
				reportJsonError(request, response, "jobstatus: no job specified");
				return;
			}
			UserSession session = UserTrap.getUserAccount(request);
			if( "json".equals(format)) {
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
