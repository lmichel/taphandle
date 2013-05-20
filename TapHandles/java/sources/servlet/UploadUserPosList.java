package servlet;

import java.io.File;
import java.io.IOException;
import java.util.Iterator;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;

import session.UserSession;
import session.UserTrap;
import translator.JsonUtils;



/**
 * Servlet implementation class UploadUserPosList
 */
public class UploadUserPosList extends RootServlet {
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
	@SuppressWarnings({ "rawtypes" })
	public void process(HttpServletRequest request, HttpServletResponse response) {
		this.printAccess(request, false);
		if( ServletFileUpload.isMultipartContent(request) ) { 
			try {
				DiskFileItemFactory factory = new DiskFileItemFactory();
				ServletFileUpload upload    = new ServletFileUpload(factory);
				List items                  = upload.parseRequest(request);				
				Iterator iter = items.iterator();
				/*
				 * Read all fields
				 */
				while (iter.hasNext()) {
					FileItem item = (FileItem) iter.next();
					if (item.isFormField()) {
					}else {
						UserSession session = UserTrap.getUserAccount(request);
						File f = new File(session.goodies.getNewUserListPath(item.getName()));
						item.write(f);
						JsonUtils.teePrint(response, session.goodies.getJsonContent().toJSONString());
					}
				}			
//				new PositionList(Database.getVOreportDir() + Database.getSepar() + item_to_upload.getString(), Database.getAstroframe());
			} catch (Exception e) {
				reportJsonError(request, response, e);
			}
		} else {
			reportJsonError(request, response, "Request badly formed: not multipart")	;		
		}
	}
}
