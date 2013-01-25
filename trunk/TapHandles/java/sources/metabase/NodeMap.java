package metabase;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.LinkedHashMap;
import java.util.Map.Entry;
import java.util.Set;

import registry.RegistryExplorer;
import registry.RegistryMark;
import registry.ShortNameBuilder;
import resources.RootClass;
import tapaccess.TapException;

/**
 * This class wraps a {@link LinkedHashMap} of TAP nodes.
 * Each node is referenced by a key (a String) either computed by @see computeKey or
 * given by the caller.
 * @author laurent
 * @version $Id$
 */
public class NodeMap  extends RootClass {
	/**
	 * {@link TapNode} map. Created at loading time
	 */
	private LinkedHashMap<String , TapNode> nodeMap = new LinkedHashMap<String , TapNode>();

	
	/**
	 *  Add to the map node. The key is computed internally.
	 * @param url        URL of the TAP service
	 * @param supportJoins        support join set from TAP_SCHEMA
	 * @return           Returns the node key
	 * @throws Exception if the service is not valid or if another node is already
	 *                   referenced by that key
	 */
	protected  String addNode(String url, boolean supportJoins) throws Exception {
		RegistryMark rm;
		String key;
		if( (key = this.getKeyNodeByUrl(url)) != null) {
			logger.warn("URL " + url + " already in the node base ");
		} if( (rm = RegistryExplorer.getregistryMarkByUrl(url)) != null){
			key = rm.getNodeKey();
			nodeMap.put(key, new TapNode(rm, MetaBaseDir + key));	
		} else  {
			key = ShortNameBuilder.getShortName(null, url);
			rm = new RegistryMark(key, "", url, "TAP NOde added by a user", false, supportJoins);
			nodeMap.put(key, new TapNode(new RegistryMark(key, "", url, "TAP NOde added by a user", false, supportJoins), MetaBaseDir + key));
		}
		return key;
	}
	
	/**
	 * Returns true if the a node exist with key as key.
	 * @param key
	 * @return
	 * @throws Exception
	 */
	public boolean hasNode(String key) throws Exception {
		if( this.getNode(key) != null ) {
			return true;
		} else {
			return false;
		}
	}
	
	/**
	 * Returns the {@link TapNode} referenced by key 
	 * @param   key
	 * @return  Returns the TAP node
	 * @throws Exception If the node cannot be found
	 */
	public TapNode getNode(String key)  throws Exception{
		TapNode tn;
		RegistryMark rm;
		if( (tn = nodeMap.get(key)) != null) {
			return tn;
		} else if( (rm = RegistryExplorer.registryMarks.get(key)) != null ){
			logger.info( "adding node " + rm);
			key = rm.getNodeKey();
			tn = new TapNode(rm, MetaBaseDir + key);
			nodeMap.put(key, tn);	
		} else {
			throw new TapException("There is registry marks referenced by the key " + key);
		}
		return tn;
	}
	
	/**
	 * Return then key of the node having url as url
	 * '/' chars are discarded from the comparison to avoid trail chars issues
	 * @param url
	 * @return
	 * @throws Exception
	 */
	protected String getKeyNodeByUrl(String url) throws Exception {
		String rurl = url.replaceAll("/", "");
		for( Entry<String, TapNode> e : nodeMap.entrySet()) {
			if( e.getValue().getUrl().replaceAll("/", "").equals(rurl) ) {
				return e.getKey();
			}
		}
		return null;
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
