/**
 * 
 */
package cart;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.Map.Entry;
import java.util.Set;

import org.apache.commons.io.IOUtils;

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

	/**
	 * Copy and rename all files of the map into the reportdir.
	 * @param baseDir
	 * @throws Exception
	 */
	public void prepareDataFiles(String baseDir, String reportDir) throws Exception {
		emptyDirectory(new File(reportDir));
		for( Entry<String, Set<ZipEntryRef>> e: zipMap.entrySet() ){
			String node = e.getKey();
			String nodeDir = baseDir + File.separator + node;
			if( ! isWorkingDirectoryValid(nodeDir) ) {
				throw new Exception("Cannot acces to " + nodeDir);
			}
			Set<ZipEntryRef> zers = e.getValue();
			LinkedHashSet<ZipEntryRef> statusZers = new LinkedHashSet<ZipEntryRef>();
			for( ZipEntryRef zer: zers) {
				if( zer.getType() == ZipEntryRef.JOB ) {
					this.prepareJobFiles(zer, nodeDir, reportDir, statusZers);
				}
				else {
					throw new Exception("URLs not implemented");
				}
			}
			zers.addAll(statusZers);
		}
	}

	/**
	 * @param zer		 Zip Entry reference
	 * @param nodeDir    Base directory of the TAP node
	 * @param reportDir  Working directory of the ZIP builder
	 * @param statusZers Set of ZIP entries associated with status files added to the ZIP ball
	 * @throws Exception
	 */
	private void prepareJobFiles(ZipEntryRef zer, String nodeDir, String reportDir, Set<ZipEntryRef> statusZers) throws Exception {
		String jobDir = nodeDir + File.separator + "job_" + zer.getUri();
		if( ! isWorkingDirectoryValid(jobDir) ) {
			throw new Exception("Cannot acces to " + jobDir);
		}
		File f = new File(jobDir + File.separator + "result.xml");
		if( !f.exists() || !f.isFile() || !f.canRead()) {
			throw new Exception("Cannot acces to result file " + f.getAbsolutePath());
		}
		/*
		 * Replace the Job ID with the path of the result file renamed with the 
		 * name given by ZipEntryRef
		 */
		String fcopyName         = reportDir + File.separator + zer.getName() + ".xml";
		BufferedInputStream bis  = new BufferedInputStream(new FileInputStream(f));
		BufferedOutputStream bos = new BufferedOutputStream(new FileOutputStream(fcopyName));
		IOUtils.copy( bis, bos );
		bis.close();
		bos.close();
		zer.setUri(fcopyName);
		/*
		 * Add the status file to the ZIP ball;
		 */
		f = new File(jobDir + File.separator + "status.xml");
		if( !f.exists() || !f.isFile() || !f.canRead()) {
			throw new Exception("Cannot acces to status file " + f.getAbsolutePath());
		}
		fcopyName = reportDir + File.separator + zer.getName() + "_status.xml";
		bis       = new BufferedInputStream(new FileInputStream(f));
		bos       = new BufferedOutputStream(new FileOutputStream(fcopyName));
		IOUtils.copy(bis, bos);
		bis.close();
		bos.close();
		statusZers.add(new ZipEntryRef(ZipEntryRef.JOB, zer.getName(), fcopyName));
	}
}
