package session;



import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

/**
 * @author michel
 * @version $Id$
 *
 */
public class UserTrap {

	public static UserSession getUserAccount(HttpServletRequest request) throws Exception {
		HttpSession session = request.getSession(true);  
		session.setMaxInactiveInterval(-1);
		String session_id = session.getId();
		if (session.isNew()) {
			UserSession account = new UserSession(session_id);
			session.setAttribute("account", account);
			return account;
		} 
		else {
			UserSession account =  (UserSession) session.getAttribute("account");
			/*
			 * The reason of this situation (a session without account) are not well understood!!
			 */
			if( account == null ) {
				account = new UserSession(session_id);
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
