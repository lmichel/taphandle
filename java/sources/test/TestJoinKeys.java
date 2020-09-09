package test;

import resources.RootClass;
import tapaccess.JoinKeysJob;

public class TestJoinKeys extends RootClass{

	/**
	 * @param args
	 * @throws Exception 
	 */
	public static void main(String[] args) throws Exception {
		//JoinKeysJob.getJoinKeys("http://tapvizier.u-strasbg.fr/TAPVizieR/tap/", "/home/michel/Desktop/vizierJoins");
		JoinKeysJob.getJoinKeys("http://simbad.u-strasbg.fr/simbad/sim-tap/", PERSONAL_DIRECTORY+"/Desktop/simbajoinkey"); // /home/michel/Desktop  was modified to /home/sergeszome/Desktop/simbajoinkey
		//JoinKeysJob.getJoinKeys("http://xcatdb/3xmm/tap/", "/home/michel/Desktop");
	}

}
