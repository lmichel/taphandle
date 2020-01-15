package test;

import metabase.NodeBase;
import metabase.TapNode;
import resources.RootClass;


public class TestNodeBase extends RootClass {

	/**
	 * @param args
	 * @throws Exception 
	 */
	public static void main(String[] args) throws Exception {
		try {
			NodeBase.init();
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		System.out.println("==========================");
		
		for( String key : NodeBase.keySet()){
			System.out.println(NodeBase.getNode(key));
		}
	}

}
