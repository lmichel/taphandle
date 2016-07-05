package cart;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Set;
import java.util.zip.GZIPInputStream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import resources.RootClass;

/**
 * @author laurent
 * @version $Id$
 */
public class ZIPUtil extends RootClass{
	public static final int MAX_SIZE = 300; //Mb	
	

	public static final void buildZipBall(ZipMap zipMap, String outputFilepath) throws Exception {
		/*
		 * Build now the zip file
		 */
		String outFilename =  outputFilepath;
		if( !outFilename.endsWith(".zip") ) {
			outFilename += ".zip";
		}
		logger.info("Build ZIP file <" + outputFilepath + ">");
		ZipOutputStream out;
		out = new ZipOutputStream(new FileOutputStream(outFilename));			

		long file_size=0;
		boolean full = false;
		for(String dir: zipMap.keySet()) {
			Set<ZipEntryRef> zers = zipMap.get(dir);

			for( ZipEntryRef zer : zers) {
				String fileitem = zer.getUri();
				byte[] buf = new byte[1024];
				
				/*
				 * We suppose that files exist but can be compressed
				 */
				FileInputStream in;
				File f;
				if( (f = new File(fileitem)).exists() ) {
					in = new FileInputStream(fileitem);
					file_size += f.length()/1000000;
				}
				else if( (f = new File(fileitem+ ".gz")).exists()) {
					in = new FileInputStream(fileitem + ".gz");				
					file_size += f.length()/1000000;
				}
				else {
					logger.error("File <" + fileitem + "> or <" + fileitem + ".gz> not found");
					continue;
				}
				logger.info( "Compress " + fileitem);
				ZipEntry ze = new ZipEntry(dir + "/" + (new File(fileitem)).getName());
				out.putNextEntry(ze);
				int len;
				while ((len = in.read(buf)) > 0) {
					out.write(buf, 0, len);
				}
				in.close();
				out.closeEntry();	
				if( file_size > MAX_SIZE) {
					logger.warn("The size of zipped file exceed " + MAX_SIZE + "Mb: zipball truncated");
					full = true;
					break;
				}
			}
			if( full ) {
				break;
			}
		}		

		out.closeEntry();	
		out.close();	
	}

	/**
	 * Gunzip input file if its name ends with .gz
	 * @param input_file
	 * @return : the path of the uncompressed file
	 * @throws Exception
	 */
	public static  String gunzip(String input_file) throws Exception {

		if( input_file.toLowerCase().endsWith(".gz") ) {
			logger.debug("Gunzip " + input_file);
			InputStream in = new FileInputStream(input_file);
			String outputfile = input_file.substring(0, input_file.length() - 3);
			OutputStream out = new FileOutputStream(outputfile);


			byte[] buffer = new byte[8192];
			in = new GZIPInputStream(in, buffer.length);
			int count = in.read(buffer);
			while (count > 0) {
				out.write(buffer, 0, count);
				count = in.read(buffer);
			}
			in.close();
			out.close();
			return outputfile;
		}
		else {
			return input_file;
		}
	}
}
