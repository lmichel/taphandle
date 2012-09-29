package servlet;

import java.io.IOException;

import javax.servlet.RequestDispatcher;
import javax.servlet.Servlet;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import metabase.NodeBase;

import session.UserSession;
import session.UserTrap;

/**
 * Servlet implementation class RunAsynJob
 * @version $Id$
 */
public class RunAsyncJob extends RootServlet implements Servlet {
	private static final long serialVersionUID = 1L;


	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		printAccess(request, true);
		try {
			UserSession session = UserTrap.getUserAccount(request);
			String node = this.getParameter(request, "NODE");
			String nodeKey=null;;
			response.setContentType("application/json");
			if( node == null || node.length() ==  0 ) {
				reportJsonError(request, response, "runasyncjob: no node specified");
				return;
			}
			else if( "zipball".equals(node)) {
				RequestDispatcher dispatcher =  getServletContext().getRequestDispatcher("/zipbuilder");
				dispatcher.forward( request, response );
				return;
			}
			else if( node .startsWith("http://")) {
				try {
					nodeKey = NodeBase.addNode(node);
				} catch (Exception e) {
					reportJsonError(request, response, e);
					return;
				}
			} else {
				nodeKey = node;
			}

			String query = this.getParameter(request, "QUERY");
			if( query == null || query.length() ==  0 ) {
				reportJsonError(request, response, "runasyncjob: no query specified");
				return;
			}

			String treenode = this.getParameter(request, "TREEPATH");
			if( treenode == null || treenode.length() ==  0 ) {
				reportJsonError(request, response, "runasyncjob: no treepath specified");
				return;
			}
			session.connectNode(nodeKey);
			String jobId = session.createJob(nodeKey, query, treenode);
			session.startJob(nodeKey, jobId);
			response.getWriter().print(session.getJobSummary(nodeKey, jobId));
			//dumpJsonFile(session.getJobSummaryUrlPath(nodeKey, jobID), response);

		} catch (Exception e) {
			this.reportJsonError(request, response, e);
		}
	}
	;
	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doGet(request, response);
	}

}
