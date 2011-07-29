package metabase;

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
 * @version $Id: NodeBase.java 46 2011-07-26 12:55:13Z laurent.mistahl $
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
			nodeMap.addNode("http://xcatdb.u-strasbg.fr/xidresult/tap", "xidresult");
			nodeMap.addNode("http://www.cadc-ccda.hia-iha.nrc-cnrc.gc.ca/caom/", "cadc");
			nodeMap.addNode("http://dc.zah.uni-heidelberg.de/__system__/tap/run/tap", "gavot");
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
	 * Very basic test method: check that the default init is fine.
	 * @param args
	 * @throws Exception
	 */
	public static void main(String[] args) throws Exception {
		new NodeBase();
	}
}
