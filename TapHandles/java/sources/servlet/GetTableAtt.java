package servlet;

import java.io.IOException;
import javax.servlet.Servlet;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import metabase.NodeBase;
import metabase.TapNode;
import resources.RootClass;

/**
 * Servlet implementation class GetTableAtt
 * @version $Id$
 */
public class GetTableAtt extends RootServlet implements Servlet {
	private static final long serialVersionUID = 1L;

 
	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		printAccess(request, true);
		response.setContentType("application/json; charset=UTF-8");

		String node = this.getParameter(request, "node");
		String table = this.getParameter(request, "table");
		if( node == null || node.length() ==  0 ) {
			reportJsonError(request, response, "gettableatt: no node specified");
			return;
		}
		if( table == null || table.length() ==  0 ) {
			reportJsonError(request, response, "gettableatt: no table specified");
			return;
		}
		try {
			TapNode tn;
			if(  (tn = NodeBase.getNode(node)) == null ) {				
				reportJsonError(request, response, "Node " + node + " does not exist");
				return;
			}
			tn.buildJsonTableAttributes(table);
			dumpJsonFile("/" + RootClass.WEB_NODEBASE_DIR + "/" + node + "/" + RootClass.vizierNameToFileName(table) + "_att.json", response);
		} catch (Exception e) {
			reportJsonError(request, response, e);
			return;
		}
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doGet(request, response);
	}

}
