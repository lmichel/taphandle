
package servlet;

import java.io.IOException;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

import javax.servlet.Servlet;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.simple.JSONObject;

import metabase.NodeBase;
import metabase.TapNode;
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
		response.setContentType("application/json; charset=UTF-8");

		String node = this.getParameter(request, "node");
		String filter = this.getParameter(request, "filter");
		String selected = this.getParameter(request, "selected");
		if( node == null || node.length() ==  0 ) {
			reportJsonError(request, response, "getnode: no node specified");
			return;
		}
		try {
			String key;
			node = TapNode.filterURLTail(node);
			if( NodeBase.getNode(node) != null ) {
				key = node;
			} else if( (key = NodeBase.getKeyNodeByUrl(node) ) != null) {

			} else if( node.startsWith("http://") || node.startsWith("https://") ){
				logger.info("Node " + node + " is an URL: add it to the base if it is not referenced");
				key = NodeBase.addNode(node, true);			
			} else {
				reportJsonError(request, response, "Node " + node + " not referenced, enter its URL please");
				return ;
			}
			
			TapNode tn = NodeBase.getNode(key);
			/*
			 * If there is either a filter or a discriminative selection list, we apply the filter
			 */
			if( (filter != null && filter.length() > 0) || (selected != null && selected.length() > 0 && !selected.equalsIgnoreCase("any"))) {
				logger.debug("Node " + key + " Apply the filter: " + filter);
				Set<String> ra = null;
				if( selected != null && selected.length() > 0) {
					ra = new HashSet<String>(Arrays.asList(selected.split(",")));
				}
				// IN 2 steps in order not to call twice response.getWriter() in case of error
				JSONObject jso = tn.filterTableList(filter, ra);
				response.getWriter().print(jso.toJSONString());		
			/*
			 * otherwise, we take the full list
			 */
			} else if( tn.largeResource ){
				JSONObject jso = tn.filterTableList(100);		
				byte[] bytes  = (jso.toJSONString() + "\n              \n").getBytes();
				logger.debug("Node " + key + " Seems to be too large to return all tables: apply a selection " + bytes.length + " bytes returned");
				response.setContentLength(bytes.length);
				response.getOutputStream().write(bytes);
			} else {
				dumpJsonFile("/" + RootClass.WEB_NODEBASE_DIR + "/" + key + "/tables.json", response);				
			}
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
