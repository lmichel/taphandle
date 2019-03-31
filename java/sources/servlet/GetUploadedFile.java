package servlet;

import java.io.File;
import java.io.IOException;

import javax.servlet.Servlet;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;


import metabase.NodeBase;

import session.UserSession;
import session.UserTrap;
import resources.RootClass;

/**
 * Servlet implementation class GetUploadedFile
 */
public class GetUploadedFile extends RootServlet implements Servlet {
	private static final long serialVersionUID = 1L;
	

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		printAccess(request, true);
		try {
			String pathInfo = request.getPathInfo();
			String[] pathParts = pathInfo.split("/");
			UserSession session = UserTrap.getUserAccount(request);
			logger.debug(session);
			
			String fileName = pathParts[pathParts.length -1];
			String goodiesUrl = "/" + RootClass.WEB_USERBASE_DIR + "/" + session.sessionID + "/" + RootClass.WEB_USER_GOODIES_DIR + "/" + RootClass.WEB_USER_GOODIES_LIST;
			String fileUrl = getServletContext().getRealPath(goodiesUrl + "/" + fileName);
			logger.debug("Get file URL :" + fileUrl);
			downloadProduct(request, response, fileUrl, fileName);
		} catch (Exception e) {
			e.printStackTrace();
		}

	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		doGet(request, response);
	}

}
