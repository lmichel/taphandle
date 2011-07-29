package servlet;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Scanner;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import metabase.NodeBase;

import org.apache.log4j.Logger;

import resources.RootClass;
import translator.JsonUtils;

/**
 * Make sure to SaadaDB connection to be open
 * @author michel
 * @version $Id: RootServlet.java 46 2011-07-26 12:55:13Z laurent.mistahl $
 *
 */
public abstract class RootServlet extends HttpServlet {
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	public static final Logger logger = Logger.getLogger("TapBrowser"); 
	private static boolean INIT = false;
	@Override
	public void init(ServletConfig conf) throws ServletException {
		super.init(conf);
		if( ! INIT) {
			NodeBase.switchToContext(getServletContext().getRealPath("/"));
			INIT = true;
		}
	}

	/**
	 * @param request
	 * @param response
	 * @param e
	 */
	public void reportJsonError(HttpServletRequest request, HttpServletResponse response, Exception  e) {
		logger.error("Servlet exception", e);
		reportJsonError(request, response, e.toString());
	}

	/**
	 * @param request
	 * @param response
	 * @param msg
	 */
	public void reportJsonError(HttpServletRequest request, HttpServletResponse response, String msg) {
		try {
			JsonUtils.teePrint(response.getOutputStream(), JsonUtils.getErrorMsg(accessMessage(request) + " " +msg));
		} catch (Exception e1) {
			logger.error("Servlet exception", e1);
		}
	}

	/**
	 * @param req
	 */
	public void printAccess(HttpServletRequest request, boolean force) {
		String full_url = request.getRequestURL().toString();
		String queryString = request.getQueryString();   
		if (queryString != null) {
			full_url += "?"+queryString;
		}	
		if( force )
			logger.info(accessMessage(request) );
		else
			logger.debug(accessMessage(request) );
	}

	/**
	 * @param req
	 * @return
	 */
	public String accessMessage(HttpServletRequest req) {
		String full_url = req.getRequestURL().toString();
		String queryString = req.getQueryString();   
		if (queryString != null) {
			full_url += "?"+queryString;
		}		
		return "URL: " + req.getRemoteAddr() + ": " + full_url ;
	}

	/**
	 * @param req
	 * @param res
	 * @param product_path
	 * @throws Exception
	 */
	protected void downloadProduct(HttpServletRequest req, HttpServletResponse res, String product_path ) throws Exception{
		String contentType = getServletContext().getMimeType(product_path);
		logger.debug( "Download file " + product_path);
		File f = new File(product_path);
		if( !f.exists() || !f.isFile() ) {
			logger.error( "File " + f.getName() + " does not exist or cannot be read");
			return;
		}
		if( product_path.toLowerCase().endsWith(".htm") || product_path.toLowerCase().endsWith(".html") ) {
			res.setContentType("text/html;charset=ISO-8859-1");
		} else if( product_path.toLowerCase().endsWith(".pdf")  ) {
			res.setContentType("application/pdf");
		} else if( product_path.toLowerCase().endsWith(".png")  ) {
			res.setContentType("image/png");
		} else if( product_path.toLowerCase().endsWith(".jpeg") || product_path.toLowerCase().endsWith(".jpg")) {
			res.setContentType("image/jpeg");
		} else if( product_path.toLowerCase().endsWith(".gif") ) {
			res.setContentType("image/gif");
		} else if( product_path.toLowerCase().endsWith(".txt")  ) {
			res.setContentType("text/plain");
		} else if( product_path.matches(RootClass.FITS_FILE)) {
			res.setContentType( "application/fits");						
		} else if( product_path.matches(RootClass.VOTABLE_FILE)) {
			res.setContentType("application/x-votable+xml");						
			//res.setContentType("text/xml");
		} else if( product_path.toLowerCase().endsWith(".xml")  ) {
			res.setContentType("text/xml");
		} else if (contentType != null) {
			res.setContentType(contentType);
		} else  {
			res.setContentType("application/octet-stream");
		}
		res.setHeader("Content-Disposition", "attachment; filename=\"" + f.getName() + "\"");

		logger.debug("GetProduct file " + product_path + " (type: " + res.getContentType() + ")" + contentType);

		BufferedInputStream fl = new BufferedInputStream(new FileInputStream(product_path));
		byte b[] = new byte[1000000];
		int len = 0;
		BufferedOutputStream bos = new BufferedOutputStream(res.getOutputStream());
		while ((len = fl.read(b)) != -1) {
			bos.write(b, 0, len);
		}				
		bos.flush();
		bos.close();		
	}

	protected void dumpJsonFile(String urlPath, HttpServletResponse response) throws IOException {
		response.setContentType("text/json");
		logger.debug("dump resource " + urlPath);
		Scanner s = new Scanner(getServletContext().getResourceAsStream(urlPath));
		PrintWriter out = response.getWriter();
		try {
			while (s.hasNextLine()){
				String l = s.nextLine();
				
				System.out.println(l);
				out.println(l);
			}
		}
		finally{
			s.close();
		}
	}
	/**
	 * Returns a <Strin, String> map of the request parameters. Only the first value is taken for each parameter
	 * @param req
	 * @return
	 */
	protected Map<String, String> getFlatParameterMap (HttpServletRequest req) {
		LinkedHashMap<String, String>	retour = new LinkedHashMap<String, String>();
		@SuppressWarnings("unchecked")
		Map<String, String[]> op = req.getParameterMap();
		for( String key: op.keySet() ) {
			retour.put(key, op.get(key)[0]);
		}
		return retour;
	}
	
	protected String getParameter(HttpServletRequest req, String param) {
		String retour = req.getParameter(param.toLowerCase());
 		if( retour == null ) {
 			return  req.getParameter(param.toUpperCase());
 		}
 		else {
 			return retour;
 		}
	}

}
