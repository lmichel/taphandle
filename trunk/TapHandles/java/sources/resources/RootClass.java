/**
 * 
 */
package resources;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.log4j.Logger;

import tapaccess.TapException;

/**
 * Super class of he project
 * Contains constants and regexp used by the project and some methods managing working directories
 * @author laurent
 * @version $Id$
 */
public class RootClass {
	/**
	 * Logger used everywhere in the project
	 */
	public static final Logger logger = Logger.getLogger("TapBrowser"); 
	/**
	 * Rexp used to detect name space definition in XML files
	 */
	public static final Pattern NSNamePattern = Pattern.compile(".*xmlns\\:(\\w+)=.*");
	public static final Pattern NSDefPattern  = Pattern.compile(".*(xmlns(?:\\:\\w+)?=\"http\\:\\/\\/www.ivoa.net\\/[^\"]*\").*");
	public static final Pattern NSPattern     = Pattern.compile(".*(xmlns=\"[^\"]*\").*");
	/**
	 * Regular expression used to identify file types
	 */
	public static final String FITS_FILE    = "(?i)(.*(\\.(((fit|fits)(\\.gz)?)|(ftz|fgz))))$";
	public static final String VOTABLE_FILE = "(?i)(.*(\\.(vot|votable|xml)(\\.gz)?))$";
	public static final String IMAGE_FILE   = "(?i)(.*(\\.(gif|jpeg|jpg|png|tiff|bmp)))$";
	/**
	 * Regexp used to detect numeric values
	 */
	public static final String FITS_INT_VAL     = "[+\\-]?[0-9]+";
	/**
	 * EXP=power of 10, D=dot, N=numeric
	 */
	public static final String FITS_FLOAT_NDNEXP = "(?:[0-9]+\\.[0-9]+[Ee][+-]?[0-9]*)";
	public static final String FITS_FLOAT_DNEXP  = "(?:\\.[0-9]+[Ee][+-]?[0-9]*)";
	public static final String FITS_FLOAT_NDEXP  = "(?:[0-9]+\\.[Ee][+-]?[0-9]*)";
	public static final String FITS_FLOAT_NEXP   = "(?:[0-9]+[Ee][+-]?[0-9]+)";
	public static final String FITS_FLOAT_NDN    = "(?:[0-9]+\\.[0-9]+)";
	public static final String FITS_FLOAT_DN     = "(?:\\.[0-9]+)";
	public static final String FITS_FLOAT_ND     = "(?:[0-9]+\\.)";
	/**
	 * Float regex must be classed from the most complex to the simplest in order
	 * not to loose part of the number with capturing groups
	 */
	public static final String FITS_FLOAT_VAL = "[+\\-]?(?:" + FITS_FLOAT_NDNEXP + "|" 
	+ FITS_FLOAT_DNEXP  + "|" 
	+ FITS_FLOAT_NDEXP  + "|" 
	+ FITS_FLOAT_NEXP   + "|" 
	+ FITS_FLOAT_NDN    + "|" 
	+ FITS_FLOAT_DN     + "|" 
	+ FITS_FLOAT_ND     + ")";
	public static final String NUMERIC = "[+\\-]?(?:" + FITS_FLOAT_NDNEXP + "|" 
	+ FITS_FLOAT_DNEXP  + "|" 
	+ FITS_FLOAT_NDEXP  + "|" 
	+ FITS_FLOAT_NEXP   + "|" 
	+ FITS_FLOAT_NDN    + "|" 
	+ FITS_FLOAT_DN     + "|" 
	+ FITS_FLOAT_ND     + "|"
	+ "[0-9]+)";

	public static final String ONE_COORDINATE = "[+-]?(?:(?:\\.[0-9]+)|(?:[0-9]+\\.?[0-9]*))(?:[eE][+-]?[0-9]+)?";
	public static final String POSITION_COORDINATE = "^(" + ONE_COORDINATE + ")((?:[+-]|(?:[,:;\\s]+[+-]?))" +  ONE_COORDINATE + ")$";

	/*
	 * 
	 */
	public static final String URL = "(http|https)://[\\w-]+(\\.[\\w-]+)+([\\w.,@?^=%&amp;:/~+#-]*[\\w@?^=%&amp;/~+#-])?";



	/*
	 * Working directories pathes used in standalone mode (in dev e.g.). In production mode these directories
	 * are replaced with Tomcat subdirs.
	 * Could be initialized with properties
	 */
	protected static  String StyleDir       = "/home/michel/workspace/TapHandles/WebContent/styles/";
	protected static  String MetaBaseDir    = "/home/michel/Desktop/tapbase/meta/";
	protected static  String SessionBaseDir = "/home/michel/Desktop/tapbase/sessions/";
	/*
	 * Working directory name: cannot be changed
	 */
	public static final String WEB_XSL_DIR      =  "styles";   // Style sheets dir
	public static final String WEB_NODEBASE_DIR =  "nodebase"; // meta data repository
	public static final String WEB_USERBASE_DIR =  "userbase"; // session data repository
	public final static String RUNID = "TapHandle-Proxy";
	/*
	 * Max time period (ms) between service availability checking
	 */


	public static final long AVAILABILITY_CHECK_FREQUENCY=	10*60*1000;
	/*
	 * Initialization directives
	 */
	public static final boolean INCLUDE_JOIN = true;
	public static final boolean NOINIT = false;
	/*
	 * Max number of rows in a result table
	 */
	public static final int MAX_ROWS = 10000;	
	/*
	 * Max number of table sent to a client
	 */
	public static final int MAXTABLES = 100; // Max number of tables sent back to the client

	/*
	 * Socket timeout used by URLConnection instance in ms
	 * a shorter SOCKET_READ_TIMEOUT do not act anymore!
	 */
	public static final int SOCKET_CONNECT_TIMEOUT = 5000;
	public static final int  SOCKET_READ_TIMEOUT = 10000;					

	public static int JOINKEY_PERIOD = 5*60*1000;
	public static int JOINKEY_MAX_ATTEMPTS = 10;


	/**
	 * Use working directories contained in contextPath
	 * MetaBaseDir and SessionBaseDir are set in system properties.
	 * @param contextPath   Low level function, no param validation
	 */
	public static void switchToContext(String contextPath){
		logger.info("Switch contexte to " + contextPath);
		StyleDir       = contextPath + File.separator + WEB_XSL_DIR      + File.separator;
		MetaBaseDir    = contextPath + File.separator + WEB_NODEBASE_DIR + File.separator;
		SessionBaseDir = contextPath + File.separator + WEB_USERBASE_DIR + File.separator;
		System.setProperty("metabase.dir", MetaBaseDir);
		System.setProperty("sessions.dir", SessionBaseDir);
	}
	/**
	 * Check that baseDirectory is a writable directory. 
	 * Attempt to create it if it does not exist
	 * @param baseDirectory
	 * @throws Exception :Rise if baseDirectory cannot be used as working directory
	 */
	public static final void validWorkingDirectory(String baseDirectory) throws Exception {
		File f = new File(baseDirectory);
		if( f.exists() ) {
			if( !f.isDirectory() ) {
				throw new TapException(baseDirectory + " is not a directory");
			} else if( !f.canWrite() ) {
				throw new TapException("Cannot write in directory " + baseDirectory );
			}
			return;
		} else {
			if( !f.mkdir() ) {
				throw new TapException("Cannot create  directory " + baseDirectory );				
			} else if( !f.canWrite() ) {
				throw new TapException("Cannot write in directory " + baseDirectory );
			}
			return;
		}
	}

	/**
	 * Check that baseDirectory is a writable directory. 
	 * @param baseDirectory
	 * @return  true if the directory can be used as working directory
	 * @throws Exception if something goes wrong with @link File 
	 */
	public static final boolean isWorkingDirectoryValid(String baseDirectory) throws Exception {
		File f = new File(baseDirectory);
		if( f.exists() ) {
			if( !f.isDirectory() ) {
				return false;
			} else if( !f.canWrite() ) {
				return false;
			}
			return true;
		} else {
			return false;
		}
	}

	/**
	 * Delete recursively the content of the file f
	 * @param f file (or directory) to delete
	 * @throws IOException
	 */
	public static void delete(File f) throws IOException {
		if (f.isDirectory()) {
			for (File c : f.listFiles())
				delete(c);
		}
		if (!f.delete())
			throw new FileNotFoundException("Failed to delete file: " + f);
	}

	/**
	 * Remove recursively the content of the directory f
	 * @param f
	 * @throws IOException
	 */
	public static void emptyDirectory(File f) throws IOException {
		logger.debug("empty directory " + f.getAbsolutePath());
		if (f.isDirectory()) {
			for (File c : f.listFiles())
				delete(c);
		}		
	}

	/**
	 * Convert a Vizier table name to something acceptable for a filenamz
	 * @param vizierName
	 * @return
	 */
	public static String vizierNameToFileName(String vizierName) {
		return vizierName.replaceAll("/", "v_v");
	}
	/**
	 * Convert a filename to the Vizier table table name it comes from
	 * @param fileName
	 * @return
	 */
	public static String fileNameToVizierName(String fileName) {
		return fileName.replaceAll("v_v", "/");
	}

	/**
	 * Quote tableName is required (used for test query)
	 * @param tableName
	 * @return
	 */
	public static String  quoteTableName(String tableName){
		Pattern pattern = Pattern.compile("([^.]*)\\.(.*)");
		Matcher m = pattern.matcher(tableName);
		String table, schema;
		if (m.matches()) {
			if( m.groupCount() != 2) {
				System.out.println("2");
				table = m.group(1);
				schema = "";
			} else {
				System.out.println("3");
				table =  m.group(2);  
				schema = m.group(1) + ".";
			}
		} else {
			table = tableName;
			schema = "";
		}
		if( table.matches("^[a-zA-Z0-9][a-zA-Z0-9_]*$" ) ){
			return schema + table;
		} else {
			return schema + '"' + table +'"';
		}
	}

}
