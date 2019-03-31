package servlet;

import java.io.IOException;
import javax.servlet.Servlet;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import metabase.NodeBase;
import metabase.TapNode;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

import registry.RegistryExplorer;
import registry.RegistryMark;
import resources.RootClass;
import session.UserSession;
import session.UserTrap;
import translator.JsonUtils;

/**
 * Returns a list of the nodes stored in the node base in addition with the sessiosn id.
 * The session id is set here because this servlet is supposed to be called at page loading.
 * The session id is stired by the client and add to parameters of all further ajax callback
 */
public class AvailableNodes extends RootServlet implements Servlet {
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
		printAccess(request, true);
		response.setContentType("application/json; charset=UTF-8");
		try {
			JSONObject retour = new JSONObject();
			UserSession session = UserTrap.getUserAccount(request);

			retour.put("sessionID", session.sessionID);
			JSONArray nodes = new JSONArray();
			for( RegistryMark rm: RegistryExplorer.registryMarks.values() ) {
			//for( String n : NodeBase.keySet()) {
				//TapNode tn = NodeBase.getNode(n);
				JSONObject jsonNode = new JSONObject();
				jsonNode.put("key", rm.getNodeKey());
				jsonNode.put("description", rm.getDescription());
				jsonNode.put("url",  rm.getUrl());
				jsonNode.put("ivoid",  rm.getIvoid());
				nodes.add(jsonNode);
			}
			retour.put("nodes", nodes);
			retour.put("version", RootClass.VERSION);
			JsonUtils.teePrint(response, retour.toJSONString());
		} catch (Exception e) {
			reportJsonError(request, response, e);
			return;
		}
	}

}
