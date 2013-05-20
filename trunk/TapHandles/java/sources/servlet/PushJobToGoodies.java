package servlet;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import session.UserSession;
import session.UserTrap;
import translator.JsonUtils;

/**
 * Servlet implementation class PushJobToGoodies
 * 
 */
public class PushJobToGoodies extends RootServlet {
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
			String goodiesName = this.getParameter(request, "goodiesname");

			if( nodeKey == null || nodeKey.length() ==  0 ) {
				reportJsonError(request, response, "PushJobToGoodies: no node specified");
				return;
			}
			if( jobId == null || jobId.length() ==  0 ) {
				reportJsonError(request, response, "PushJobToGoodies: no job specified");
				return;
			}
			if( goodiesName == null || goodiesName.length() ==  0 ) {
				reportJsonError(request, response, "PushJobToGoodies: no goodiesName specified");
				return;
			}
			UserSession session = UserTrap.getUserAccount(request);
			session.pushJobInGoodies(nodeKey, jobId, goodiesName);
			JsonUtils.teePrint(response, session.goodies.getJsonContent().toJSONString());
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
