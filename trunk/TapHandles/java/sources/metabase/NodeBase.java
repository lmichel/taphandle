package metabase;

import java.io.File;
import java.net.MalformedURLException;
import java.util.Set;

import resources.RootClass;


/**
 * This class handle the list of tap nodes {@link TapNode}.
 * Tap node are stores in a {@link NodeMap}
 * Node base is built on the single instance pattern.
 * Tap nodes must always be acceded through this class
 * @TODO connect to the registry to get all published nodes
 * 
 * @author laurentmichel
 * @version $Id$
 */
public class NodeBase extends RootClass{
	/**
	 * 
	 */
	private  final NodeMap nodeMap = new NodeMap();
	private static NodeBase instance;

	/**
	 * Private creator checking he validity of the base and recording some nodes
	 */
	private NodeBase()  {
		try {
			validWorkingDirectory(MetaBaseDir);
			emptyDirectory(new File(MetaBaseDir));
			try {

				nodeMap.addNode("http://xcatdb.u-strasbg.fr/2xmmidr3/tap", "xcatdb");
			} catch (Exception e) {
				logger.error("Cannot init node base http://xcatdb.u-strasbg.fr/2xmmidr3/tap", e);
			}
			try {
				nodeMap.addNode("http://www.cadc-ccda.hia-iha.nrc-cnrc.gc.ca/tap", "cadc");
			} catch (Exception e) {
				logger.error("Cannot init node base http://www.cadc-ccda.hia-iha.nrc-cnrc.gc.ca/tap", e);
			}
			try {
				nodeMap.addNode("http://dc.zah.uni-heidelberg.de/__system__/tap/run/tap", "gavot");
			} catch (Exception e) {
				logger.error("Cannot init node base http://dc.zah.uni-heidelberg.de/__system__/tap/run/tap", e);
			}
			try {
				nodeMap.addNode("http://simbad.u-strasbg.fr/simbad/sim-tap", "simbad");
			} catch (Exception e) {
				logger.error("Cannot init node base http://simbad.u-strasbg.fr/simbad/sim-tap", e);
			}
		} catch (Exception e) {
			logger.error("Cannot init node base", e);
		}
	}

	/**
	 * Return the node referenced by the key @see #key
	 * @param key
	 * @return the requested @link TapNode
	 * @throws Exception if the node cannot be found
	 */
	public static TapNode getNode(String key) throws Exception {
		if( NodeBase.instance == null ) {
			NodeBase.instance = new NodeBase();
		}
		return NodeBase.instance.nodeMap.getNode(key);
	}

	/**
	 * Return key of the node with url as url
	 * @param key
	 * @return the requested @link TapNode
	 * @throws Exception if the node cannot be found
	 */
	public static String getKeyNodeByUrl(String url) throws Exception {
		if( NodeBase.instance == null ) {
			NodeBase.instance = new NodeBase();
		}
		return NodeBase.instance.nodeMap.getKeyNodeByUrl(url);		
	}

	/**
	 * Add a new node pointed by nodeURL.
	 * The node key is computed from the nodeURL, it is not necessarily relevant!
	 * @param nodeURL
	 * @return the key of the new node
	 * @throws Exception if the node cannot be added or if it already exists
	 */
	public static String  addNode(String nodeURL) throws Exception{
		if( NodeBase.instance == null ) {
			NodeBase.instance = new NodeBase();
		}
		return NodeBase.instance.nodeMap.addNode(nodeURL);
	}

	/**
	 * The node key is computed from the nodeURL, it is not necessarily relevant!
	 * @param nodeURL
	 * @param key
	 * @return the key of the new node
	 * @throws Exception if the node cannot be added or if it already exists
	 */
	public static String  addNode(String nodeURL, String key) throws Exception{
		if( NodeBase.instance == null ) {
			NodeBase.instance = new NodeBase();
		}
		return NodeBase.instance.nodeMap.addNode(nodeURL, key);
	}

	/**
	 * Returns true if a node with key as key exists
	 * @param key
	 * @return
	 * @throws Exception
	 */
	public static boolean  hasNode(String key) throws Exception{
		if( NodeBase.instance == null ) {
			NodeBase.instance = new NodeBase();
		}
		return NodeBase.instance.nodeMap.hasNode( key);
	}

	/**
	 * Remove the node referenced by key.
	 * Does nothing if the node does not exist
	 * @param key
	 */
	public static void removeNode(String key) {
		if( NodeBase.instance == null ) {
			NodeBase.instance = new NodeBase();
		}
		NodeBase.instance.nodeMap.removeNode(key);		
	}

	/**
	 * Return the Set of keys referenced nodes
	 * @return
	 */
	public Set<String> keySet() {
		if( NodeBase.instance == null ) {
			NodeBase.instance = new NodeBase();
		}
		return NodeBase.instance.nodeMap.keySet();
	}

	/**
	 * Extract a key from a node URL. 
	 * The key is built from the host name and from application name 
	 * @param url
	 * @return
	 * @throws MalformedURLException
	 */
	public static String computeKey(String url) throws MalformedURLException {
		if( NodeBase.instance == null ) {
			NodeBase.instance = new NodeBase();
		}
		return NodeBase.instance.nodeMap.computeKey(url);
	}

	/**
	 * Very basic test method: check that the default init is fine.
	 * @param args
	 * @throws Exception
	 */
	public static void main(String[] args) throws Exception {
		new NodeBase();
	}
}
