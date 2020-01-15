package test;


import java.util.Map.Entry;

import registry.RegistryExplorer;
import registry.RegistryMark;
import resources.RootClass;

/**
 * @author laurent
 * @version $Id: AsyncJobTest.java 159 2012-10-10 11:52:54Z laurent.mistahl $
 *
 */
public class TestRegistryExplorer  extends RootClass {


	/**
	 * @param args
	 * @throws Exception 
	 */
	public static void main(String[] args) throws Exception {
		RegistryExplorer.readRegistries();
		for( Entry<String, RegistryMark> entry: RegistryExplorer.registryMarks.entrySet()) {
			if( entry.getValue().mustBeInitAtStart())
				System.out.println(entry.getKey() + " => " + entry.getValue());
		}


	}


}
