
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
		try {
			String key;
			if( NodeBase.getNode(node) != null ) {
				key = node;
			}
			else if( (key = NodeBase.getKeyNodeByUrl(node) ) != null) {

			}
			else if( node.startsWith("http://") || node.startsWith("https://") ){
				key = NodeBase.addNode(node);			
			}
			else {
				reportJsonError(request, response, "Node " + node + " not referenced, enter its URL please");
				return ;
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
