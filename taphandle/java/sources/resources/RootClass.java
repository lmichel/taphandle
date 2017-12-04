/**
 * 
 */
package resources;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.util.Properties;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import metabase.DataTreePath;

import org.apache.log4j.Logger;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;

import tapaccess.TapException;

/**
 * Super class of he project
 * Contains constants and regexp used by the project and some methods managing working directories
 * @author laurent
 * @version $Id$
 */
/**
 * @author laurentmichel
 *
 */
public class RootClass {
	public static final String VERSION = "2.2";
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
	protected static  String StyleDir       = System.getProperty("user.dir") + "/WebContent/styles/";
	protected static  String MetaBaseDir    = System.getProperty("java.io.tmpdir") + "/meta/";
	protected static  String SessionBaseDir = System.getProperty("java.io.tmpdir") + "/sessions/";
	/*
	 * Working directory name: cannot be changed
	 */
	public static final String WEB_XSL_DIR      =  "styles";   // Style sheets dir
	public static final String WEB_NODEBASE_DIR =  "nodebase"; // meta data repository
	public static final String WEB_USERBASE_DIR =  "userbase"; // session data repository
	public static final String WEB_USER_GOODIES_DIR =  "goodies"; // Directory where user can upload data files
	public static final String WEB_USER_GOODIES_LIST =  "myLists"; // Directory where user can upload data files
	public static final String WEB_USER_GOODIES_JOB = "myJobs";// Directory where user can upload jobs result
	public final static String RUNID = "TapHandle-Proxy";
	/*
	 * some standard file names
	 */
	public static final String VOTABLE_JOB_RESULT = "result.xml";
	public static final String JSON_JOB_RESULT = "result.json";
	/*
	 * Max time period (ms) between service availability checking
	 */
	public static final long AVAILABILITY_CHECK_FREQUENCY=	10*60*1000;
	/*
	 * Initialization directives
	 */
	public static final boolean INCLUDE_JOIN;
	public static final boolean NOINIT;
	public static final boolean CHECKUPLOAD ;
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
	public static final int  SOCKET_READ_TIMEOUT   = 60000;					
	public static int JOINKEY_PERIOD = 5*60*1000;
	public static int JOINKEY_MAX_ATTEMPTS = 1;
	public static int ASYNC_CHECK_POLLPERIOD=2;
	public static int ASYNC_CHECK_ATTEMPTS=6;
	/**
	 * Read the file taphandle.porpoerties to set up the init mode
	 */
	static  {
		System.setProperty("http.agent", "TapHandle/"+VERSION);
		boolean noinit = true;
		boolean checkupload = false;
		boolean includejoin = true;
		
		int ascpollperiod=ASYNC_CHECK_POLLPERIOD, ascattemps=ASYNC_CHECK_ATTEMPTS; 
		try {
			Properties prop = new Properties(); 
			prop.load(RootClass.class.getClassLoader().getResourceAsStream("taphandle.properties"));
			String p = prop.getProperty("init.node");
			if( "true".equals(p) ) {
				noinit = false;
			} else if( "false".equals(p) ) {
				noinit = true;
			}
			p = prop.getProperty("upload.check");
			if( "true".equals(p) ) {
				checkupload = true;
			} else if( "false".equals(p) ) {
				checkupload = false;
			}
			p = prop.getProperty("include.join");
			if( "true".equals(p) ) {
				includejoin = true;
			} else if( "false".equals(p) ) {
				includejoin = false;
			}
			p = prop.getProperty("async.check.pollperiod");
			if( p!= null && p.matches("\\d+") ) {
				ascpollperiod = Integer.parseInt(p);
			} 
			p = prop.getProperty("async.check.attemps");
			if( p!= null && p.matches("\\d+") ) {
				ascattemps = Integer.parseInt(p);
			} 
		} 
		catch (IOException ex) {
			ex.printStackTrace();
		} finally {
			NOINIT = noinit;
			INCLUDE_JOIN = includejoin;
			CHECKUPLOAD = checkupload;
			ASYNC_CHECK_ATTEMPTS = ascattemps;
			ASYNC_CHECK_POLLPERIOD = ascpollperiod;
		}
	}
	/**
	 * Use working directories contained in contextPath
	 * MetaBaseDir and SessionBaseDir are set in system properties.
	 * @param contextPath   Low level function: no param validation
	 * @throws Exception 
	 */
	public static void switchToContext(String contextPath) {
		logger.info("Switch context to " + contextPath);
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

//	/**
//	 * Convert a Vizier table name to something acceptable for a filename.
//	 * remove surrouding quotes and apply an URL like encoding
//	 * @param vizierName
//	 * @return
//	 * @throws UnsupportedEncodingException 
//	 */
//	public static String vizierNameToFileName(String vizierName) throws UnsupportedEncodingException {
//		return URLEncoder.encode(vizierName.replaceAll("\"",  ""), "UTF-8");
//		//return vizierName.replaceAll("/", "v_v");
//	}
//	/**
//	 * Convert a filename to the Vizier table name it is issued
//	 * @param fileName
//	 * @return
//	 * @throws UnsupportedEncodingException 
//	 */
//	public static String fileNameToVizierName(String fileName) throws UnsupportedEncodingException {
//		return URLDecoder.decode(fileName, "UTF-8");
//		//return fileName.replaceAll("v_v", "/");
//	}

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
				table = m.group(1);
				schema = "";
			} else {
				table =  m.group(2);  
				schema = m.group(1) + ".";
			}
		} else {
			table = tableName;
			schema = "";
		}
		if( table.startsWith("\"") ){
			return schema + table;			
		} else	if( table.matches("^[a-zA-Z0-9][a-zA-Z0-9_]*$" ) ){
			return schema + table;
		} else {
			return schema + '"' + table +'"';
		}
	}
	
	/**
	 * Insert the datatreepath in the JSON file named productName.json
	 * @param productName
	 * @param dataTreePath
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public	static void setDataTreePathInJsonResponse(String productName, DataTreePath dataTreePath) throws Exception {
		JSONParser parser = new JSONParser();
		FileReader fr = new FileReader(productName + ".json");
		Object obj = parser.parse(fr);
		JSONObject jsonObject = (JSONObject) obj;
		jsonObject.put("dataTreePath", dataTreePath.getJSONObject());
		FileWriter fw = new FileWriter(productName + ".json");
		fw.write(jsonObject.toJSONString());
		fw.close();   
		fr.close();
	}

}
