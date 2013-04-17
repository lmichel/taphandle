package servlet;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;

import javax.servlet.ServletContext;
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
			new LocalConfig(event.getServletContext());
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
	
	/**
	 * Look at the file dbname.txt located at application root.
	 * Take the url_root.
	 * @author laurent
	 *
	 */
	class LocalConfig{
		
		LocalConfig(ServletContext servletContext)  throws Exception{
			File f = new File(servletContext.getRealPath("") + File.separatorChar + "/WEB-INF/dbname.txt");
			if( f.exists() ) {
				logger.info("file dbname.txt found in " + f.getAbsolutePath());
				BufferedReader fr = new BufferedReader(new FileReader(f));
				String buff;
				while( (buff = fr.readLine()) != null ) {
					if( buff.trim().startsWith("#") ) {
						continue;
					} else if( buff.matches("urlroot=.*")) {
						String retour =  buff.trim().split("=")[1];
						logger.info("take " + retour + " as root RUL");
						RootServlet.ROOT_URL = retour;
						return;
					}
				}
			} else {
				logger.info("file WEB-INF/dbname.txt not found: keep " + RootServlet.ROOT_URL + " as root RUL");
			}
		}
	}
}



