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
	public static final String xcatdb_schema_query="SELECT keys.from_table, keys.target_table, from_column, target_column"
		+ " FROM tap_schema_keys as keys" 
		+ " JOIN tap_schema_key_columns AS key_columns"
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
		NodeCookie nc=new NodeCookie();
		String baseFN = baseDirectory + File.separator + prefix;		
		
		logger.debug(TapAccess.runSyncJob(url, query, baseFN + VOTABLE_JOB_RESULT , nc, "JoinKeys>tables"));
		XmlToJson.translateJoinKeysTable(baseFN  + VOTABLE_JOB_RESULT, baseDirectory);

	}

	/**
	 * try to get join keys with both queries
	 * @param url           : TAP node to query
	 * @param baseDirectory : Output directory
	 * @throws Exception
	 */
	public static void getJoinKeys(String url, String baseDirectory) throws Exception{
		try {
			logger.info("Get join keys for node " + url );
			tryJoinKeys(url, schema_query, baseDirectory);
		} catch (Exception e) {
			try {
				logger.warn("Error when getting Join keys (" + schema_query + "), try a query without schema" );
				tryJoinKeys(url, noschema_query, baseDirectory);
			} catch (Exception e2) {
				logger.warn("Error when getting Join keys(" + noschema_query + "), try a query without schema but table prefixed" );
				tryJoinKeys(url, xcatdb_schema_query, baseDirectory);
			}
		}
	}
}
