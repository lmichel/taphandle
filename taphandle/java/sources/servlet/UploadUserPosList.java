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

import session.Goodies;
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
				UserSession session         = UserTrap.getUserAccount(request);
				DiskFileItemFactory factory = new DiskFileItemFactory();
				ServletFileUpload upload    = new ServletFileUpload(factory);
				List items                  = upload.parseRequest(request);				
				Iterator iter = items.iterator();
				/*
				 * Read all fields
				 */
				double radius = Double.NaN;
				FileItem fileItem = null;;
				while (iter.hasNext()) {
					FileItem item = (FileItem) iter.next();
					if (item.isFormField() ) {
						if(item.getFieldName().equalsIgnoreCase("radius") ) {
							radius = Double.parseDouble(item.getString());
						}
					} else {
						fileItem = item;
					}
				}	
				/*
				 * Checks that all data have been received
				 */
				if( fileItem == null){
					reportJsonError(request, response, "No file received");	
					return;
				} else if( Double.isNaN(radius)) {
					reportJsonError(request, response, "No valid radius received");		
					return;
				} else {
					/*
					 * Store the file ad convert it into a VOTable
					 */
					Goodies goodies = session.goodies;
					JsonUtils.teePrint(response, goodies.ingestUserList(fileItem));
				}
			} catch (Exception e) {
				reportJsonError(request, response, e);
			}
		} else {
			reportJsonError(request, response, "Request badly formed: not multipart")	;		
		}
	}
}
