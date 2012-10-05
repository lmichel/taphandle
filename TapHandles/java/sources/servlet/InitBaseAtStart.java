package servlet;

import java.io.File;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

import metabase.NodeBase;
import resources.RootClass;

public class InitBaseAtStart extends RootClass implements ServletContextListener {


	/*This method is invoked when the Web Application has been removed 
		  and is no longer able to accept requests
	 */

	public void contextDestroyed(ServletContextEvent event) {
		logger.info("Bye Bye");
	}


	//This method is invoked when the Web Application
	//is ready to service requests

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



