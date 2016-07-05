package test;

import metabase.TapNode;

public class FilterNodeUrl {

	/**
	 * @param args
	 * @throws Exception 
	 */
	public static void main(String[] args) throws Exception {
		String s = "http://voparis-srv.obspm.fr/srv/tap-titan_temperature2-?/";
		System.out.println(TapNode.filterURLTail(s));

	}

}
