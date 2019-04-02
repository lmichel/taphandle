package metabase;

import java.net.MalformedURLException;
import java.net.URL;

import resources.RootClass;

/**
 * Simple class managing both server part and application part of a node URL
 * It is used to reconstruct an URL from a relative path as it can be returned by a server
 * @author michel
 *
 */
public class NodeUrl extends RootClass{
	private final String fullUrl ;
	private final String serverUrl;
	private final String appPath;
	private final boolean supportJoin;
	
	public NodeUrl(String fullUrl, boolean supportJoin ) throws Exception{
		this.fullUrl = fullUrl + ((!fullUrl.endsWith("?") && !fullUrl.endsWith("/"))? "/": "");
		URL url = new URL(fullUrl);
		this.serverUrl = url.getProtocol() + "://" + url.getAuthority();
		this.appPath = url.getFile();
		this.supportJoin = supportJoin; // joins based on TAP_SCHEMA must be checked at init time
	}
	
	
	public String getFullUrl() {
		return fullUrl;
	}
	public String getServerUrl() {
		return serverUrl;
	}
	public String getAppPath() {
		return appPath;
	}
	public String toString() {
		return this.fullUrl + ": server=" + this.serverUrl + " appl=" + this.appPath;
	}
	public boolean supportJoin() {
		return supportJoin;
	}
	/**
	 * Attempt to make an absolute URL from path.
	 * Does nothing if path looks like the full URL
	 * @param path
	 * @return the absolute URL
	 * @throws MalformedURLException: if the absolute URLS cannot be infered
	 */
	public String getAbsoluteURL(String path) throws MalformedURLException {
		if( path == null || path.trim().length() == 0 || this.fullUrl.startsWith(path) ) {
			return fullUrl;
		} else if(path.matches("http[s]?://.*") ) {
			return path;
		} else if( path.startsWith("/") ) {
			if( path.startsWith(this.appPath) ) {
				return this.serverUrl + path;
			} else if( this.fullUrl.endsWith("/")){
				return this.fullUrl + path.substring(1);
			} else {
				return this.fullUrl + path;
			}
		} else {
			 throw new java.net.MalformedURLException("Cannot build absolute URL with path=" + path + " for " + fullUrl);
		}
	}

}
