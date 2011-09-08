/**
 * 
 */
package cart;

import java.io.File;
import java.util.LinkedHashMap;
import java.util.Map.Entry;
import java.util.Set;

import resources.RootClass;

/**
 * @author laurent
 * @version $Id$
 */
public class ZipMap extends RootClass {
	private LinkedHashMap<String, Set<ZipEntryRef>> zipMap= new LinkedHashMap<String, Set<ZipEntryRef>>();

	public void put(String folder, Set<ZipEntryRef> entries) {
		zipMap.put(folder, entries);
	}

	public Set<ZipEntryRef> get(String folder) {
		return zipMap.get(folder);
	} 
	public Set<String> keySet() {
		return zipMap.keySet();
	}

	public void prepareDataFiles(String baseDir) throws Exception {
		
		for( Entry<String, Set<ZipEntryRef>> e: zipMap.entrySet() ){
			String node = e.getKey();
			String nodeDir = baseDir + File.separator + node;
			if( ! isWorkingDirectoryValid(nodeDir) ) {
				throw new Exception("Cannot acces to " + nodeDir);
			}
			Set<ZipEntryRef> zers = e.getValue();
			for( ZipEntryRef zer: zers) {
				if( zer.getType() == ZipEntryRef.JOB ) {
					String jobDir = nodeDir + File.separator + "job_" + zer.getUri();
					if( ! isWorkingDirectoryValid(jobDir) ) {
						throw new Exception("Cannot acces to " + jobDir);
					}
					File f = new File(jobDir + File.separator + "result.xml");
					if( !f.exists() || !f.isFile() || !f.canRead()) {
						throw new Exception("Cannot acces to result file " + f.getAbsolutePath());
					}
					/*
					 * Replace the Job ID with the path of the result file
					 */
					zer.setUri(f.getAbsolutePath());
				}
				else {
					throw new Exception("URLs not implemented");
				}
			}
		}
	}

}
