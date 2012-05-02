/**
 * 
 */
package resources;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.util.Locale;
import java.util.regex.Pattern;

import org.apache.log4j.Logger;

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
	/*
	 * Max time period (ms) between service availability checking
	 */


	public static final long AVAILABILITY_CHECK_FREQUENCY=	10*60*1000;


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
				throw new Exception(baseDirectory + " is not a directory");
			} else if( !f.canWrite() ) {
				throw new Exception("Cannot write in directory " + baseDirectory );
			}
			return;
		} else {
			if( !f.mkdir() ) {
				throw new Exception("Cannot create  directory " + baseDirectory );				
			} else if( !f.canWrite() ) {
				throw new Exception("Cannot write in directory " + baseDirectory );
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

}
