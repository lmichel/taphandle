package servlet;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.fileupload.servlet.ServletFileUpload;

import session.Goodies;
import session.UserSession;
import session.UserTrap;
import translator.JsonUtils;

/**
 * parameter:
 * - delete=listName: remove the list
 * - info=istName: return the info attached to that list
 * - other: return the content of the user poslist folder
 * Servlet implementation class ManageUserPosList
 */
public class ManageUserPosList extends RootServlet {
	private static final long serialVersionUID = 1L;
       

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		process(request, response);
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		process(request, response);
	}

	/**
	 * @param request
	 * @param res
	 */
	public void process(HttpServletRequest request, HttpServletResponse response) {
		this.printAccess(request, false);
		if( ServletFileUpload.isMultipartContent(request) ) { 
			try {
				UserSession session = UserTrap.getUserAccount(request);
				Goodies goodies = session.goodies;
				String listName;
				if( (listName = request.getParameter("delete")) != null ||  (listName = request.getParameter("drop")) != null) {
					goodies.dropUserList(listName);
					JsonUtils.teePrint(response, "{status: \"ok\"}");
				} else if( (listName = request.getParameter("info")) != null ) {
					JsonUtils.teePrint(response, goodies.getUserListReport(listName).toJSONString());
				} else {
					JsonUtils.teePrint(response, goodies.getJsonContent().toJSONString());
				}
			} catch (Exception e) {
				reportJsonError(request, response, e);
			}
		} else {
			reportJsonError(request, response, "Request badly formed: not multipart")	;		
		}
	}
}
