package metabase;

import java.io.File;
import java.net.MalformedURLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import registry.RegistryExplorer;
import registry.RegistryMark;
import registry.ShortNameBuilder;
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

	class ThreadInit extends Thread {
		private String url;
		private String key;
		private boolean supportJoin;
		private boolean done = false;

		ThreadInit(RegistryMark node) {
			url = node.getFullUrl();
			key = node.getNodeKey();
			supportJoin = node.supportJoin();
		}
		public void run() {
			try {
				nodeMap.addNode(url, supportJoin);
			} catch (Exception ex) {
				logger.error("Cannot init node " + key + " served by " + url, ex);
			}	
			logger.info(this.url + " ready");
			this.done = true;
		}
		public boolean isDone(){
			return this.done;
		}
	}
	/**
	 * Private creator checking he validity of the base and recording some nodes
	 */
	private NodeBase() {
		synchronized (this) {
			List<ThreadInit> regMarkToInit = new ArrayList<>();

			try {
				validWorkingDirectory(metaBaseDir);
				emptyDirectory(new File(metaBaseDir));
				emptyDirectory(new File(sessionBaseDir));
				RegistryExplorer.readRegistries();
				if( !NOINIT){
					for( RegistryMark r: RegistryExplorer.registryMarks.values()) {
						if(r.mustBeInitAtStart() ){
							logger.info("load node " + r.getNodeKey());
							ThreadInit ti = new ThreadInit(r);
							regMarkToInit.add(ti);
							ti.start();
						}
					}
				}
			} catch (Exception e) {
				logger.error("Cannot init node base", e);
			}
			boolean notDone = true;
			logger.info("Waiting on init done");
			while( notDone ) {
				boolean ok = true;
				for( ThreadInit ti: regMarkToInit){
					if( ! ti.isDone()) {
						ok = false;
						break;
					}
				}
				try {
					logger.debug("Waiting on init done");
					Thread.sleep(3000);
				} catch (InterruptedException e) {}
				notDone = !ok;
			}
			logger.info("Init done");

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
	 * @param supportJoins        support join set from TAP_SCHEMA
	 * @param nodeURL
	 * @throws Exception if the node cannot be added or if it already exists
	 */
	public static String  addNode(String nodeURL, boolean supportJoin) throws Exception{
		return NodeBase.instance.nodeMap.addNode(nodeURL, supportJoin);		

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
		return ShortNameBuilder.getShortName("", url); 
	}

}
