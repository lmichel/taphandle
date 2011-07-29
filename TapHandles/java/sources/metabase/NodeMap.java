package metabase;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.LinkedHashMap;
import java.util.Set;

import resources.RootClass;

/**
 * This class wraps a {@link LinkedHashMap} of TAP nodes.
 * Each node is referenced by a key (a String) either computed by @see computeKey or
 * given by the caller.
 * @author laurent
 * @version $Id: NodeMap.java 46 2011-07-26 12:55:13Z laurent.mistahl $
 */
class NodeMap  extends RootClass {
	/**
	 * {@link TapNode} map. Created at loading time
	 */
	private LinkedHashMap<String , TapNode> nodeMap = new LinkedHashMap<String , TapNode>();

	/**
	 * Attempt to extract a key from a node URL. 
	 * The key is built from the host name and from application name 
	 * @param  url
	 * @return Returns the key
	 * @throws MalformedURLException
	 */
	private String computeKey(String url) throws MalformedURLException {
		URL hurle = new URL(url);
		return hurle.getHost().replaceAll("www.", "").replaceAll("[_\\.]", "") + "_" + hurle.getPath().split("\\/")[1].replaceAll("[_\\.]", "");
	}
	
	/**
	 *  Add to the map node. The key is computed internally.
	 * @param url        URL of the TAP service
	 * @return           Returns the node key
	 * @throws Exception if the service is not valid or if another node is already
	 *                   referenced by that key
	 */
	protected  String addNode(String url) throws Exception {
		return this.addNode(url, this.computeKey(url));
	}
	
	/**
	 * Add to the map node.
	 * @param url        URL of the TAP service
	 * @param key        key referencing the node
	 * @return           Returns  the node key
	 * @throws Exception if the service is not valid or if another node is already
	 *                   referenced by that key
	 */
	protected String addNode(String url, String key) throws Exception {
		TapNode nm;
		if( (nm = this.getNode(key)) != null ) {
			throw new Exception("Node with \"" + key + "\" as key already exists (" + nm.getUrl() + ")");
		}
		else {
			logger.info("Create new Tap node " + url + " referenced with the key " + key);
			nm = new TapNode(url, MetaBaseDir + key, key );
			nodeMap.put(key, nm);
			return key;
		}
	}
	
	/**
	 * Returns the {@link TapNode} referenced by key 
	 * @param   key
	 * @return  Returns the TAP node
	 * @throws Exception If the node cannot be found
	 */
	protected TapNode getNode(String key)  throws Exception{
		return  nodeMap.get(key);
	}
	
	/**
	 * Removes the node referenced by key. Does nothing of the node des not exist.
	 * @param Returns key
	 */
	protected void removeNode(String key) {
		nodeMap.remove(key);
	}
	
	/**
	 * @return Returns the set of keys of he node map
	 */
	protected Set<String>  keySet() {
		return nodeMap.keySet();
	}

}
