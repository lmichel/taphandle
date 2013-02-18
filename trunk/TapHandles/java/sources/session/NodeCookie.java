/**
 * 
 */
package session;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.net.CookieHandler;
import java.net.CookieManager;
import java.net.CookiePolicy;
import java.net.CookieStore;
import java.net.HttpCookie;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.List;

import resources.RootClass;

/**
 * @author laurent
 * @version $Id$
 */
public class NodeCookie extends RootClass {
	private HttpCookie cookie;
	public static final  CookieManager manager= new CookieManager();

	static {
		manager.setCookiePolicy(CookiePolicy.ACCEPT_ALL);
		CookieHandler.setDefault(manager);			
	}
	public NodeCookie() {
//		manager.setCookiePolicy(CookiePolicy.ACCEPT_ALL);
//		CookieHandler.setDefault(manager);	
	}

	public void addCookieToUrl(URL url) throws URISyntaxException {
		if( this.getCookie() != null ) {
			manager.getCookieStore().add(url.toURI(), this.getCookie());
		}		
	}		 

	public void storeCookie() {
		List<HttpCookie>  cookies = manager.getCookieStore().getCookies();
		for (HttpCookie c: cookies) {
			this.setCookie(c);
		}
	}

	public void saveCookie(String dir) throws FileNotFoundException, IOException {
		if( this.cookie == null ) {
			logger.debug("No cookie set");
		}
		else {
			logger.debug("cookie stored");
			File f = new File(dir, "cookie.txt");
			FileWriter fw = new FileWriter(f);
			fw.write(this.cookie.toString());
			fw.close();
		}
	}
	
	public void restoreCookie(String dir) throws FileNotFoundException, IOException, ClassNotFoundException {
		File f = new File(dir, "cookie.txt");
		if( f.exists() ) {
			BufferedReader br = new BufferedReader(new FileReader(f));
			String[] ckv = br.readLine().trim().split("=");
			this.cookie = new HttpCookie(ckv[0], ckv[1]);
			br.close();
		}
	}
	
	public HttpCookie getCookie() {
		return cookie;
	}

	public void setCookie(HttpCookie cookie) {
		this.cookie = cookie;
	}

	public String toString() {
		if( this.cookie != null )
			return this.cookie.toString();
		else
			return "Not Set";
	}

}
