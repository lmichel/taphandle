package test;

import resources.RootClass;
import tapaccess.JoinKeysJob;

public class TestJoinKeys extends RootClass{

	/**
	 * @param args
	 * @throws Exception 
	 */
	public static void main(String[] args) throws Exception {
		JoinKeysJob.getJoinKeys("http://tapvizier.u-strasbg.fr/TAPVizieR/tap/", "/home/michel/Desktop/vizierJoins");
	}

}
