package servlet;

import java.io.IOException;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.http.HttpSessionEvent;
import javax.servlet.http.HttpSessionListener;

import metabase.NodeBase;
import resources.RootClass;
import session.UserSession;

/**
 * Listener invoked by Tomcat at starting time and at shutdown time.
 * It is declared in web.xml
 * @author michel
 *
 */
public class InitBaseAtStart extends RootClass implements ServletContextListener , HttpSessionListener{

	public void contextDestroyed(ServletContextEvent event) {
		logger.info("Bye Bye");
	}

	public void contextInitialized(ServletContextEvent event) {
		try {
			NodeBase.switchToContext(event.getServletContext().getRealPath("/"));
			NodeBase.init();
			logger.info("Taphandle is ready to be used, enjoy it!");
		} catch (Exception e) {
			logger.error("Can't init the node base : " + e.getMessage());
		}
	}

	public void sessionCreated(HttpSessionEvent event) {
	}
	public void sessionDestroyed(HttpSessionEvent event) {
		logger.info("Session " + event.getSession().getId() + " destroyed");
		UserSession account =  (UserSession) event.getSession().getAttribute("account");	
		if( account != null )
			try {
				account.destroySession();
			} catch (IOException e) {
				logger.error("Destroying session", e);
			}

	}
}



