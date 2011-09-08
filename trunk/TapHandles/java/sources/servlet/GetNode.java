
package servlet;

import java.io.IOException;

import javax.servlet.Servlet;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import metabase.NodeBase;
import resources.RootClass;

/**
 * Servlet implementation class GetNode
 * @version $Id$
 */
public class GetNode extends RootServlet implements Servlet {
	private static final long serialVersionUID = 1L;


	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

		printAccess(request, true);

		String node = this.getParameter(request, "node");
		if( node == null || node.length() ==  0 ) {
			reportJsonError(request, response, "getnode: no node specified");
			return;
		}
		String key= NodeBase.computeKey(node);
		try {
			if( !NodeBase.hasNode(key) ) {
				key = NodeBase.addNode(node);
			}
		} catch (Exception e) {
			reportJsonError(request, response, e);
		}

		try {
			if(  NodeBase.getNode(key) == null ) {				
				reportJsonError(request, response, "Node " + key + " does not exist");
				return;
			}
			dumpJsonFile("/" + RootClass.WEB_NODEBASE_DIR + "/" + key + "/tables.json", response);
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
