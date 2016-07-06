package servlet;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;
import java.util.Scanner;

import javax.servlet.Servlet;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Servlet implementation class DummyServlet
 */
public class DummyServlet extends RootServlet implements Servlet {
	private static final long serialVersionUID = 1L;

    /**
     * Default constructor. 
     */
    public DummyServlet() {
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doPost(request, response);
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		printAccess(request, true);
		try {
			response.setContentType("application/json; charset=UTF-8");
			response.setHeader("Content-Length"     , Long.toString((new File("/home/michel/Desktop/sdss8_att.json")).length()));
			response.setHeader("Pragma", "no-cache" );
			response.setHeader("Cache-Control", "no-cache" );
			response.setDateHeader( "Expires", 0 );		
			logger.debug("dump resource " + "/home/michel/Desktop/sdss8_att.json");
			logger.debug("Real path  " + "/home/michel/Desktop/sdss8_att.json");
			InputStream is = new FileInputStream(new File("/home/michel/Desktop/sdss8_att.json"));
			Scanner s = new Scanner(is);
			try {
				PrintWriter out = response.getWriter();
				int nbl = 0;
				while (s.hasNextLine()){
					String l = s.nextLine();
					out.println(l);
					nbl++;
				}
				logger.debug("done " + nbl + " lines");
			} finally{
				s.close();
			}

		
		} catch (Exception e) {
			reportJsonError(request, response, e);
			return;
		}				
	}

}
