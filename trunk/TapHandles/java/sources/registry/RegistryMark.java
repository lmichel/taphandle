/**
 * 
 */
package registry;

import java.net.MalformedURLException;
import java.net.URL;

import resources.RootClass;


/**
 * @author michel
 *
 */
public class RegistryMark extends RootClass {
	/*
	 * Params read in the registry
	 */
	private final String nodeKey;
	private final String ivoid;
	private final String url;
	private final String decsription;
	/*
	 * Computed parameters
	 */
	private final String fullUrl ;
	private final String serverUrl;
	private final String appPath;
	private final boolean supportJoin;
	private final boolean mustBeInitAtStart;
	
	/**
	 * @param nodeKey
	 * @param ivoid
	 * @param url
	 * @param decsription
	 * @param mustBeInitAtStart
	 * @param supportJoin
	 * @throws MalformedURLException
	 */
	public RegistryMark(String nodeKey, String ivoid, String url, String decsription,
			boolean mustBeInitAtStart, boolean supportJoin) throws MalformedURLException {
		super();
		this.nodeKey = nodeKey;
		this.ivoid = ivoid;
		this.url = url;
		this.decsription = decsription;
		this.mustBeInitAtStart = mustBeInitAtStart;
		
		this.fullUrl = this.url + ((!this.url.endsWith("?") && !this.url.endsWith("/"))? "/": "");
		logger.debug("Create registry mark " + nodeKey + " from " + this.fullUrl);
		URL u = new URL(fullUrl);
		this.serverUrl = u.getProtocol() + "://" + u.getAuthority();
		this.appPath = u.getFile();
		this.supportJoin = supportJoin; // joins based on TAP_SCHEMA must be checked at init time

	}
	public String getNodeKey() {
		return nodeKey;
	}
	public String getIvoid() {
		return ivoid;
	}
	public String getUrl() {
		return url;
	}
	public String getDescription() {
		return decsription;
	}
	public boolean mustBeInitAtStart() {
		return mustBeInitAtStart;
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
	public boolean hasSamUrlAs(String url){
		String u = url + ((!url.endsWith("?") && !url.endsWith("/"))? "/": "");
		return u.equals(this.fullUrl);

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
