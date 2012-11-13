package session;



import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

/**
 * Get the stuff attached to the current user session 
 * @author michel
 * @version $Id$
 *
 */
public class UserTrap {
	/*
	 * Session are stored in a map in order to make taphandle working without cookies.
	 * Note that URLs rewriting cannot be used in this context as AJAX anchors are embedded in JS code
	 */
	private static final Map<String, HttpSession> sessions = new LinkedHashMap<String, HttpSession>();
	
	public static UserSession getUserAccount(HttpServletRequest request) throws Exception {
		HttpSession session = null;
		/*
		 * Try first to get the session from the HTTP parameter
		 */
		String jsessionid = request.getParameter("jsessionid");
		if( jsessionid != null && (session = sessions.get(jsessionid)) != null ) {
			System.out.println("sessiosn stored");
			return  (UserSession) session.getAttribute("account");
		}
		session = request.getSession(true);  
		session.setMaxInactiveInterval(-1);
		String session_id = session.getId();
		if (session.isNew()) {
			UserSession account = new UserSession(session_id, request.getRemoteAddr());
			session.setAttribute("account", account);
			sessions.put(session_id, session);
			return account;
		} else {
			UserSession account =  (UserSession) session.getAttribute("account");
			/*
			 * The reason of this situation (a session without account) are not well understood!!
			 */
			if( account == null ) {
				account = new UserSession(session_id, request.getRemoteAddr());
				session.setAttribute("account", account);
			}
			return account;	    			
		}
	}
	
	public static void destroySession(HttpServletRequest request) throws IOException {
		HttpSession session = request.getSession(true);  
		if ( !session.isNew()) {
			UserSession account =  (UserSession) session.getAttribute("account");	
			if( account != null ) account.destroySession();
		}
		session.invalidate();		
	}

}
