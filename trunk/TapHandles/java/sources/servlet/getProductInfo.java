package servlet;

import java.io.IOException;
import java.net.URL;
import java.net.URLConnection;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import javax.servlet.Servlet;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.simple.JSONObject;

/**
 * Servlet implementation class getProductInfo
 * Return the http header of an url as a JSON string
 * @Author LM
 * @Version $Id$
 */
public class getProductInfo extends RootServlet implements Servlet {
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
		if( url == null || url.length() == 0  ) {
			reportJsonError(request, response, "No url given");
			return;
		}
		try {
			URLConnection conn = (new URL(url)).openConnection(); 
			Map<String, List<String>>  map = conn.getHeaderFields();
			JSONObject jso = new JSONObject();
			for( Entry<String, List<String>> s: map.entrySet()) {
				String k = s.getKey();
				k = (k != null)?k.replaceAll("-", ""): "nokey";
				jso.put(k, s.getValue().get(0));
			}
			//conn.getInputStream().close();
			response.getWriter().write(jso.toJSONString());
			return;
		}
		catch (Exception e) {
			reportJsonError(request, response, e);
		}

	}
}
