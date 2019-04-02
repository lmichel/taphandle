package servlet;

import java.io.IOException;

import javax.servlet.Servlet;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;

import session.Goodies;
import session.UserSession;
import session.UserTrap;
import translator.JsonUtils;

public class DeleteGoodies extends RootServlet implements Servlet {
	private static final long serialVersionUID = 1L;


	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String sessid = request.getParameter("jsessionid");
		String list = request.getParameter("list");
		//list = "{\"myList\": [\"aa\",\"a\"] , \"myJobs\": [{\"node\": \"vizier\", \"jobs\": [\"1\"]}]}";
		
		UserSession session;
		try {
			
			//{"myList": [] , "myJobs": [{"node": "vizier", "jobs": ["1"]}]}
			session = UserTrap.getUserAccount(request, request.getParameter("jsessionid"));
			Goodies goodies = session.goodies;
			JSONParser parser = new JSONParser();
			logger.debug(list);			
			

			JSONObject json = (JSONObject) parser.parse(list);;
			
			JSONArray goodiesDel = (JSONArray)json.get("myList");
			JSONArray jobsDel = (JSONArray)json.get("myJobs");
			
			logger.debug(goodies.WEB_USER_GOODIES_LIST);
			for(int i = 0; i < goodiesDel.size(); i++){
				String goodiesname = goodiesDel.get(i).toString().substring(0,goodiesDel.get(i).toString().length() - 4);
				goodies.dropUserList(goodiesname);
			}
			for(int i = 0; i < jobsDel.size(); i++){
				JSONObject job = (JSONObject)(jobsDel.get(i));
				String node = job.get("node").toString();
				String jobname = job.get("jobs").toString();
				goodies.dropUserJob(node, jobname);
			}
			
			JsonUtils.teePrint(response, list);

		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doGet(request, response);
	}

}