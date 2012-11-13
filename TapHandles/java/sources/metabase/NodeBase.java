package metabase;

import java.io.File;
import java.net.MalformedURLException;
import java.util.LinkedHashMap;
import java.util.Map.Entry;
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
	private static final LinkedHashMap<String, NodeUrl> defaultNodes = new LinkedHashMap<String, NodeUrl>();

	static {
		try {
			defaultNodes.put("vizier", new NodeUrl("http://tapvizier.u-strasbg.fr/TAPVizieR/tap/"));
			defaultNodes.put("xcatdb", new NodeUrl("http://xcatdb.u-strasbg.fr/2xmmidr3/tap"));
			defaultNodes.put("cadc"  , new NodeUrl("http://www.cadc-ccda.hia-iha.nrc-cnrc.gc.ca/tap"));
			defaultNodes.put("gavo"  , new NodeUrl("http://dc.zah.uni-heidelberg.de/__system__/tap/run/tap"));
			defaultNodes.put("simbad", new NodeUrl("http://simbad.u-strasbg.fr/simbad/sim-tap"));
			defaultNodes.put("heasarc-xamin", new NodeUrl("http://heasarc.gsfc.nasa.gov/xamin/vo/tap"));
		} catch (Exception e) {
			logger.error(e);
		}
	}

	class ThreadInit extends Thread {
		private String url;
		private String key;

		ThreadInit(Entry<String, NodeUrl> node) {
			try {
				url = node.getValue().getAbsoluteURL("");
				key = node.getKey();
			} catch (MalformedURLException e) {
				logger.error(e);
			}
		}
		public void run() {
			try {
				nodeMap.addNode(url, key);
			} catch (Exception ex) {
				logger.error("Cannot init node " + key + " served by " + url, ex);
			}	
		}
	}
	/**
	 * Private creator checking he validity of the base and recording some nodes
	 */
	private NodeBase() {
		synchronized (this) {

			try {
				validWorkingDirectory(MetaBaseDir);
				emptyDirectory(new File(MetaBaseDir));
				emptyDirectory(new File(SessionBaseDir));
				if( !NOINIT){
					for( Entry<String, NodeUrl> e: defaultNodes.entrySet()) {
						(new ThreadInit(e)).start();
					}
					//						for( Entry<String, String> e: defaultNodes.entrySet()) {
					//						try {
					//							nodeMap.addNode(e.getValue(), e.getKey());
					//						} catch (Exception ex) {
					//							logger.error("Cannot init node " + e.getKey() + " served by " + e.getValue(), ex);
					//						}					
					//					}
				}
			} catch (Exception e) {
				logger.error("Cannot init node base", e);
			}
		}
	}

	public static void init() throws Exception {
		if( NodeBase.instance == null ) {
			NodeBase.instance = new NodeBase();
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
	public static Set<String> keySet() {
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
