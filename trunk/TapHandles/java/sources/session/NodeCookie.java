/**
 * 
 */
package session;

import java.net.HttpCookie;

/**
 * @author laurent
 * $Id
 */
public class NodeCookie {
	private HttpCookie cookie;

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
