package test;

import metabase.NodeUrl;
import resources.RootClass;


public class NodeUrlTest extends RootClass {

	/**
	 * @param args
	 * @throws Exception 
	 */
	public static void main(String[] args) throws Exception {
		NodeUrl nu = new NodeUrl("http://heasarc.gsfc.nasa.gov/xamin/vo/tap/", true);
		System.out.println(nu);
		System.out.println(nu.getAbsoluteURL("/xamin/vo/tap/qsqqs"));
		System.out.println(nu.getAbsoluteURL("/qqxamin/vo/tap/qsqqs"));
		nu = new NodeUrl("http://heasarc.gsfc.nasa.gov:8080/xamin/vo/tap?", true);
		System.out.println(nu.getAbsoluteURL("/xamin/vo/tap/qsqqs"));
		System.out.println(nu.getAbsoluteURL("/qqxamin/vo/tap/qsqqs"));
		System.out.println(nu);
		nu = new NodeUrl("http://heasarc.gsfc.nasa.gov/xamin/vo/tap/", true);
		System.out.println(nu);
	}

}
