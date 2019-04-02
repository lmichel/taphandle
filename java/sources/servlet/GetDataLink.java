package servlet;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URL;

import javax.servlet.Servlet;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * forwards the URL  which is supposed to be a datalink service...
 * @author michel
 *
 */
public class GetDataLink extends RootServlet implements Servlet {
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

	@SuppressWarnings("unchecked")
	private void process(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		printAccess(request, false);
		String url = request.getParameter("url");
		response.setContentType("application/json; charset=UTF-8");
		if( url == null || url.length() == 0  ) {
			reportJsonError(request, response, "No url given");
			return;
		}
		try {
			response.setContentType("application/json; charset=UTF-8");
			InputStream input = new URL(url).openStream();
			OutputStream output = response.getOutputStream();
			byte[] boeuf = new  byte[1000];
			int lg;
			while( (lg = input.read(boeuf)) > 0   ) {
				output.write(boeuf, 0, lg);
			}
			return;
		}
		catch (Exception e) {
			reportJsonError(request, response, e);
		}

	}

}
