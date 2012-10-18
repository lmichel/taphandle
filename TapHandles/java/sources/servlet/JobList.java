package servlet;

import java.io.IOException;

import javax.servlet.Servlet;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import session.UserSession;
import session.UserTrap;

/**
 * Servlet implementation class JobList
 * @version $Id$
 */
public class JobList extends RootServlet implements Servlet {
	private static final long serialVersionUID = 1L;

	/**
	 * Default constructor. 
	 */
	public JobList() {
		// TODO Auto-generated constructor stub
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		printAccess(request, false);
		response.setContentType("application/json; charset=UTF-8");
		try {
			UserSession session = UserTrap.getUserAccount(request);
			session.refreshAllJobStatus();
			response.getWriter().println(session.getJobList());
		} catch (Exception e) {
			UserTrap.destroySession(request);
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
