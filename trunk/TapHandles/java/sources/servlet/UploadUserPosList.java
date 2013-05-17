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
import org.json.simple.JSONObject;



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
	 * @param req
	 * @param res
	 */
	public void process(HttpServletRequest req, HttpServletResponse res) {
		this.printAccess(req, false);
		if( ServletFileUpload.isMultipartContent(req) ) { 
			try {
				DiskFileItemFactory factory = new DiskFileItemFactory();
				ServletFileUpload upload    = new ServletFileUpload(factory);
				List items                  = upload.parseRequest(req);				
				Iterator iter = items.iterator();
				FileItem item_to_upload = null;
				File uploadedFile = null;
				String service = "getinstance";
				String query=null;
				/*
				 * Read all fields
				 */
				while (iter.hasNext()) {
					FileItem item = (FileItem) iter.next();
					System.out.println(" @@@ " + item);
					if (item.isFormField()) {
						System.out.println(" @@@@@@@@@ " + item.getFieldName());
						if( item.getFieldName().equals("hidden_datafile") ) {
							//uploadedFile = new File(Database.getVOreportDir() + Database.getSepar() + item.getString());		
						} else if( item.getFieldName().equals("hidden_service") ) {
							service = item.getString();		
						} else if( item.getFieldName().equals("hidden_query") ) {
							query = item.getString();
						}
					}  else {
/*						item_to_upload = item;			
						String fileName = Database.getVOreportDir() + Database.getSepar() + item.getName();
						File f = new File(fileName);
						item.write(f);
						PositionList pl = new PositionList(fileName, Database.getAstroframe());
						JSONObject retour = new JSONObject();
						retour.put("name",item.getName());
						retour.put("size",f.length());
						retour.put("positions",pl.size());
						JsonUtils.teePrint(res, retour.toJSONString());
*/					}
				}			
//				new PositionList(Database.getVOreportDir() + Database.getSepar() + item_to_upload.getString(), Database.getAstroframe());
//
//				/*
//				 * If all fields are present, we upload the position file and 
//				 * the page is redirected to the data selection page. The query is executed at loading time.
//				 */
//				if( item_to_upload != null && uploadedFile != null && query != null ) {
//					String mark = "?";
//					if( service.indexOf('?') != -1 ) {
//						mark = "&";
//					}
//					item_to_upload.write(uploadedFile);
//					res.setStatus(301);
//					res.addHeader("Location" , service + mark + "query=" + URLEncoder.encode(query, "iso-8859-1").replaceAll("\\+", "%20").replaceAll("%0D", ""));					
//				} else {
//					reportJsonError(req, res, "e");
//				}
			} catch (Exception e) {
				reportJsonError(req, res, e);
			}
		} else {
			reportJsonError(req, res, "Request badly formed: not multipart")	;		
		}
	}
}
