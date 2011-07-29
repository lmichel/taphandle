
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
 * @version $Id: GetNode.java 46 2011-07-26 12:55:13Z laurent.mistahl $
*/
public class GetNode extends RootServlet implements Servlet {
	private static final long serialVersionUID = 1L;

	/**
	 * Default constructor. 
	 */
	public GetNode() {
		// TODO Auto-generated constructor stub
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

		printAccess(request, true);

		String node = this.getParameter(request, "node");
		String key=null;;
		if( node == null || node.length() ==  0 ) {
			reportJsonError(request, response, "getnode: no node specified");
			return;
		}
		else if( node .startsWith("http://")) {
			try {
				key = NodeBase.addNode(node);
			} catch (Exception e) {
				reportJsonError(request, response, e);
				return;
			}
		} else {
			key = node;
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
