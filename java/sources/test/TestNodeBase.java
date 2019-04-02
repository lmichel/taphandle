package test;

import metabase.NodeBase;
import resources.RootClass;


public class TestNodeBase extends RootClass {

	/**
	 * @param args
	 */
	public static void main(String[] args) {
		try {
			NodeBase.init();
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

}
