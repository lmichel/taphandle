package tapaccess;

import java.io.File;

import resources.RootClass;
import session.NodeCookie;
import translator.XmlToJson;

/**
 * This class handle an asynchronous job on a TAP node returning all declared joins between tables.
 * The result is stored in JSON files, one file per source_table having at least one join.
 * @author michel 
 * @version $Id
 *
 */
public class JoinKeysJob extends RootClass {
	// standard ADQL query returning joined table with key colmuns
	public static final String noschema_query="SELECT keys.from_table, keys.target_table, from_column, target_column"
		+ " FROM keys" 
		+ " JOIN key_columns"
		+ " ON keys.key_id = key_columns.key_id";
	// ADQL query returning joined table with key colmuns for systems not supportiong schemas (SAADA)
	public static final String schema_query="SELECT keys.from_table, keys.target_table, from_column, target_column"
		+ " FROM TAP_SCHEMA.keys as keys" 
		+ " JOIN TAP_SCHEMA.key_columns AS key_columns"
		+ " ON keys.key_id = key_columns.key_id";
	public static final String prefix =  "joinkeys_";

	/**
	 * Attempt to run one query 
	 * @param url           : TAP node to query
	 * @param query         : Query to be executed
	 * @param baseDirectory : Output directory
	 * @throws Exception
	 */
	private static void tryJoinKeys(String url, String query, String baseDirectory) throws Exception{
		String baseFN = baseDirectory + File.separator + prefix;
		NodeCookie cookie=new NodeCookie();
		String jobID = TapAccess.createAsyncJob(url, query,baseFN + "job.xml", cookie);
		TapAccess.runAsyncJob(url, jobID, baseFN + "status.xml", cookie);
		String phase;
		do {
			phase = TapAccess.getAsyncJobPhase(url, jobID,  baseFN + "phase.xml", cookie);
			Thread.sleep(1000);

		} while( phase.equals("EXECUTING") || phase.equals("PENDING"));
		String[] resultURLs = TapAccess.getAsyncJobResults(url
				, jobID
				, baseFN + "result.xml"
				, cookie);
		for( String r: resultURLs) {
			//if( r.matches(".*\\.xml.*") ) {
				logger.debug("Download " + r);
				TapAccess.getAsyncJobResultFile(r
						, baseDirectory + File.separator
						,  prefix + "result.xml"
						, cookie);

				XmlToJson.translateJoinKeysTable(baseFN  + "result.xml", baseDirectory);
			//}
		}
	}

	/**
	 * try to get join keys with both queries
	 * @param url           : TAP node to query
	 * @param baseDirectory : Output directory
	 * @throws Exception
	 */
	public static void getJoinKeys(String url, String baseDirectory) throws Exception{
		try {
			logger.info("Get join keys for node " + url);
			tryJoinKeys(url, schema_query, baseDirectory);
		} catch (Exception e) {
			logger.warn("Error when getting Join keys, try a query without schema");
			tryJoinKeys(url, noschema_query, baseDirectory);
		}
	}
}
