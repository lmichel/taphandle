package servlet;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

import metabase.NodeBase;
import resources.RootClass;

/**
 * Listener invoked by Tomcat at starting time and at shutdown time.
 * It is declared in web.xml
 * @author michel
 *
 */
public class InitBaseAtStart extends RootClass implements ServletContextListener {

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
}



