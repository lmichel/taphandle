package session;



import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import resources.RootClass;

/**
 * Get the stuff attached to the current user session 
 * @author michel
 * @version $Id$
 *
 */
public class UserTrap extends RootClass {
	/*
	 * Session are stored in a map in order to make taphandle working without cookies.
	 * Note that URLs rewriting cannot be used in this context as AJAX anchors are embedded in JS code
	 */
	private static final Map<String, HttpSession> sessions = new LinkedHashMap<String, HttpSession>();
	private static final Pattern restSession = Pattern.compile(".*\\/jid([0-9A-Z]*$)");

	public static UserSession getUserAccount(HttpServletRequest request, String paramSessionId) throws Exception {
		HttpSession session = null;
		session = request.getSession();  
		session.setMaxInactiveInterval(-1);
		String session_id = session.getId();
		logger.debug("Get session id :" + session_id + " paramSessionId:" + paramSessionId);
		if (session.isNew()) {
			HttpSession localSession = null;
			/*
			 * Try first to get the session from the HTTP parameter
			 */
			if( paramSessionId != null && (localSession = sessions.get(paramSessionId)) != null ) {
				logger.debug("session " + paramSessionId + " retreived in session map");
				return  (UserSession) localSession.getAttribute("account");
			} else {
				Matcher m = restSession.matcher(request.getRequestURI());
				if (m.matches() && (localSession = sessions.get(m.group(1))) != null ) {
					logger.debug("session " + paramSessionId + " retreived in session map (rest mode)");
					return  (UserSession) localSession.getAttribute("account");			
				}
			}			
			UserSession account = new UserSession(session_id, request.getRemoteAddr());
			session.setAttribute("account", account);
			logger.debug("Save session id : " + session_id  + " : " + session);
			sessions.put(session_id, session);
			return account;
		} else {
			UserSession account =  (UserSession) session.getAttribute("account");
			logger.debug("session " + session_id + " retreived in cookies");
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
	
	public static UserSession getUserAccount(HttpServletRequest request) throws Exception {
			return getUserAccount(request, request.getParameter("jsessionid"));
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
