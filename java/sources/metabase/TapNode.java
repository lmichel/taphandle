package metabase;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.Scanner;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;

import registry.RegistryMark;
import resources.RootClass;
import tapaccess.JoinKeysJob;
import tapaccess.QueryModeChecker;
import tapaccess.TablesReconstructor;
import tapaccess.TapAccess;
import tapaccess.TapException;
import test.ExploreTapRegistry;
import translator.NameSpaceDefinition;
import translator.XmlToJson;

/**
 * Manage a TAP node:
 * - get the node description (capabilities, tables)
 * - check the availability
 * - convert node responses in JSON
 * All data related to that node are stored in baseDirectory.
 * 
 * @author laurentmichel
 * @version $Id$
 * 
 * 10/1012: Support per-table access for vizier and cache for table descriptions
 */
public class TapNode  extends RootClass {

	private String baseDirectory;
	private RegistryMark regMark;

	private NameSpaceDefinition availabilityNS = new NameSpaceDefinition();
	private NameSpaceDefinition capabilityNS   = new NameSpaceDefinition();
	private NameSpaceDefinition tablesNS       = new NameSpaceDefinition();

	public final boolean largeResource;	
	/*
	 * true if a query on the tap schema building possible joins succeeded 
	 * Not really used yet
	 */
	private boolean supportCapability = false;
	private boolean supportTables = false;
	private boolean supportTapSchemaJoin = false;
	private boolean supportAsyncMode = true;
	private boolean supportSyncMode = true;
	private boolean supportUpload = false;

	/**
	 * Creator
	 * @param url           TAP node RL
	 * @param baseDirectory Local directory where node data are stored
	 * @param key           key referencing the node
	 * @throws Exception    Rise if something goes wrong
	 */
	public TapNode(RegistryMark regMark, String baseDirectory) throws Exception {
		this.baseDirectory = baseDirectory;
		this.regMark = regMark;

		if( !this.baseDirectory.endsWith(File.separator) ) {
			this.baseDirectory += File.separator;
		}
		emptyDirectory(new File(baseDirectory));
		validWorkingDirectory(baseDirectory);
		this.checkServices();
		/*
		 * Assuming that one table declaration requirs about 100 bytes, we limit infer to limit the 
		 * number of displayed tables to  MAXTABLES
		 */
		if( (new File(this.baseDirectory + "tables.json")).length() > MAXTABLES*100 ) {
			this.largeResource = true;
		} else {
			this.largeResource = false;
		}
	}
	/**
	 * This constructor does not check the real capability of the service.
	 * It is just devited to scan all nodes (see {@link ExploreTapRegistry} without failure
	 * @param regMark
	 * @param baseDirectory
	 * @param simpleInit just to differenciate the constructors
	 * @throws Exception
	 */
	public TapNode(RegistryMark regMark, String baseDirectory, boolean simpleInit) throws Exception {
		this.baseDirectory = baseDirectory;
		this.regMark = regMark;

		if( !this.baseDirectory.endsWith(File.separator) ) {
			this.baseDirectory += File.separator;
		}
		emptyDirectory(new File(baseDirectory));
		validWorkingDirectory(baseDirectory);
		this.largeResource = false;
	}

	/* (non-Javadoc)
	 * @see java.lang.Object#toString()
	 */
	public String toString() {
		String result = this.regMark.toString() + " ";
		result +=  (this.supportCapability())?    "CAPABILITY,": "NOCAPABILITY,";
		result +=  (this.supportTables())?          "TABLES,"    : "NOTABLES,";
		result +=  (this.supportTapSchemaJoin())? "JOIN,"      : "NOJOIN,";
		result +=  (this.supportSyncMode())?      "SYNC,"     : "NOSYNC,";
		result +=  (this.supportAsyncMode())?     "ASYNC,"     : "NOASYNC,";
		result +=  (this.supportUpload())?        "UPLOAD ,"   : "NOUPLOAD,";
		return result;
	}

	/**
	 * Do some checking "by hand"
	 * It is just devoted to scan all nodes (see {@link ExploreTapRegistry} without failure
	 * 
	 * @throws Exception
	 */
	public void check() throws Exception {
		this.checkServices();

	}
	/**
	 * @return
	 */
	public boolean supportSyncMode() {
		return supportSyncMode;
	}
	/**
	 * @return
	 */
	public boolean supportAsyncMode() {
		return supportAsyncMode;
	}

	public boolean supportUpload() {
		return supportUpload;
	}

	public boolean supportCapability(){
		return this.supportCapability;
	}
	public boolean supportTables(){
		return this.supportTables;
	}
	/**
	 * @return Returns he node directory (ended with a file separator)
	 */
	public String getBaseDirectory() {
		return baseDirectory;
	}

	public boolean supportTapSchemaJoin(){
		return supportTapSchemaJoin;
	}

	/**
	 * @return Return the TAP node URL
	 * @throws MalformedURLException 
	 */
	public String getUrl() throws MalformedURLException {
		return regMark.getAbsoluteURL(null);
	}

	/**
	 * Returns a valid absolute URL containing the path
	 * @param path
	 * @return
	 * @throws MalformedURLException
	 */
	public String getAbsoluteURL(String path) throws MalformedURLException {
		return regMark.getAbsoluteURL(path);
	}

	public String getIvoid() {
		return this.regMark.getIvoid();
	}


	public String getDescription() {
		return this.regMark.getDescription();
	}

	/**
	 * Check all services needed by the node to work
	 * - availability: of the node
	 * - capabilities: list of services supported by the node
	 * - tables: list of tables published by the service
	 * Each service returns an XML files which are systematically translated in JSON
	 * @throws Exception If one service does not respond properly
	 */
	private void checkServices() throws Exception {

		logger.debug("NS for availability " + availabilityNS);
		this.checkCapability() ;
		logger.debug("NS for capability " + capabilityNS.getNsName());
		this.checkTables() ;
		logger.debug("NS for tables " + tablesNS.getNsName());

		this.testCapabilities() ;
		/*
		 * add capability flags (UPLOAD ASYNC) and in tables.JSON
		 */
		this.setCapabilityFlagsInJsonResponse();			

		logger.info("Service " + this.regMark + " seems to be working");		
		if( INCLUDE_JOIN && this.regMark.supportJoin() ) {
			this.setJoinKeys();
		}
	}

	/**
	 * 
	 */
	public void setJoinKeys() {
		try {
			logger.info("Attempt to get join keys from  " + TapNode.this.regMark.getNodeKey() );
			JoinKeysJob.getJoinKeys(this.regMark.getAbsoluteURL(null), this.baseDirectory);
			this.supportTapSchemaJoin = true;
			logger.info("Sucessed");
		} catch (Exception e) {
			if( JOINKEY_MAX_ATTEMPTS <= 1)  {
				logger.warn("Can't get join keys for node: " + this.regMark.getNodeKey() + " no more attemps JOINKEY_MAX_ATTEMPTS="+ JOINKEY_MAX_ATTEMPTS);
			} else {
				logger.warn("Can't get join keys for node: " + this.regMark.getNodeKey() + " continue in background " + this.regMark + " " + e.getMessage());
				Runnable r = new Runnable() {
					public void run() {
						int attempts = 2;
						TapNode.this.supportTapSchemaJoin = false;
						while( true ) {
							try {
								Thread.sleep(JOINKEY_PERIOD);
								logger.info("Attempt # " + attempts + " to get join keys from  " + TapNode.this.regMark.getNodeKey());
								JoinKeysJob.getJoinKeys(TapNode.this.regMark.getAbsoluteURL(null), TapNode.this.baseDirectory);
								TapNode.this.supportTapSchemaJoin = true;
								logger.info("Sucessed");
								return;
							} catch (Exception e) {
								attempts++;
								if( attempts > JOINKEY_MAX_ATTEMPTS ){
									logger.warn("Cannot get join keys from  " + TapNode.this.regMark.getNodeKey() + " after " + JOINKEY_MAX_ATTEMPTS + " attempts, stop to try.");
									return;
								}
								logger.info("Failed (" + e.getMessage() + "), try again in " + JOINKEY_PERIOD/1000 + "\"'");	
							}
						}
					}
				};
				new Thread(r).start();
			}
		}

	}

	/**
	 * Check the capability of the service
	 * If the service has already been invoked the name space is extracted from the XML response
	 * to make sure the JSON translation works
	 * @throws Exception If something goes wrong
	 */
	private void checkCapability() throws Exception {
		File f = new File(this.baseDirectory + "capabilities" + ".xml");
		if( f.exists() && f.isFile() &&f.canRead()) {
			logger.debug("capabilities already checked");
			if( capabilityNS.getNsDeclaration() == null )
				this.getNamspaceDefinition("capabilities", capabilityNS);
			return;
		}
		logger.debug("check capabilities");
		this.getServiceReponse("capabilities", capabilityNS);
		this.translateServiceReponse("capabilities", capabilityNS);
		logger.debug(this.regMark + " Capabilities is available");
		this.supportCapability = true;
	}

	/**
	 * Get the table description of the service. 
	 * If the service has already been invoked the name space is extracted from the XML response
	 * to make sure the JSON translation works
	 * The JSON translation of tables.xml do not contain column description but just schema/table names
	 * @throws Exception If something goes wrong
	 */
	private void checkTables() throws Exception {
		String tables = "tables";
		File f = new File(this.baseDirectory + tables + ".xml");
		if( f.exists() && f.isFile() &&f.canRead()) {
			logger.debug("tables already checked");
			if( tablesNS.getNsDeclaration()  == null  )
				this.getNamspaceDefinition(tables, tablesNS);
			return;
		}
		logger.debug("check tables");
		this.getServiceReponse(tables, tablesNS);
		/*
		 * Try first to translate with the standard format schema.tables.table
		 */
		this.translateServiceReponse(tables, tablesNS);
		try {
			
			this.getFirstTableName();
		} catch(Exception e){
			//e.printStackTrace();
			//System.exit(1);
			logger.warn("No tables in tables.xml, try to ignore the schema");		
			/*
			 * Try first to translate with the standard format tab:tables.table (services from *.roe.ac.uk)
			 */
			try {
				this.translateServiceReponse(tables,"tables_noschema", tablesNS);
				this.getFirstTableName();
			} catch (Exception e3) {
				try {
					logger.warn("No tables in tables.xml, Try to scan the TAP_SCHEMA");	
					new TablesReconstructor(this.regMark.getAbsoluteURL(null), this.baseDirectory);
					this.translateServiceReponse(tables, tablesNS);
					if( this.getFirstTableName() == null ) {
						throw new Exception("No tables in tables.xml, is that file compliant with the schema?");
					} else {
						logger.info("succeed");
					}	
				} catch (Exception e2) {
					e2.printStackTrace();
					throw new Exception("No valid tables capability: failed to rebuild it from the TAP schema: " + e2);
				}
			}
		}
		this.setNodekeyInJsonResponse("tables");	
		this.setDataTreePathInTables();
		this.supportTables = true;
	}

	/**
	 * Check if either syn or async query mode is available
	 * @throws TapException If no query succeed
	 */
	private void testCapabilities() throws Exception {
		DataTreePath dtp = this.getFirstDataTreePath();
		String qualifiedTableName = quoteTableName(dtp.geTableOrg()).replace("public.", "\"public\".");
		String query = "SELECT TOP 1 * FROM " + qualifiedTableName;
		String uploadQuery = "SELECT TOP 1 * FROM " + qualifiedTableName + " NATURAL JOIN TAP_UPLOAD.taphandlesample ";

		logger.info("Test capabilities with query " + query);
		QueryModeChecker qmc=null;
		/*
         *  ACDC async mode return e redirection. This means that the base query of service cannot be used to control the job.
         *  This make this capability not usable in the context of the proxy as it is designed now
         */
		if( this.regMark.getUrl().contains("cadc") || this.regMark.getUrl().contains("vao.stsci.edu/CAOMTAP") 
				|| this.regMark.getUrl().contains("esac") || this.regMark.getUrl().contains("cxctap")){
			logger.info("Force " + this.regMark.getUrl() + "  to work in sync mode to avoid redirection issues");
			qmc = new QueryModeChecker(this.regMark.getFullUrl(), query, uploadQuery, this.baseDirectory, true);
			if( ! qmc.supportSyncMode() ){
				logger.info("Cannot run " + query + " this might be a permission issue, let's try with the TAP schema");
				qmc = new QueryModeChecker(this.regMark.getFullUrl()
						, "SELECT TOP 1 * from TAP_SCHEMA.tables"
						, "SELECT TOP 1 * FROM TAP_SCHEMA.tables NATURAL JOIN TAP_UPLOAD.taphandlesample "
						, this.baseDirectory, true);
			}
			this.supportAsyncMode = false;
		} else {
			qmc = new QueryModeChecker(this.regMark.getFullUrl(), query, uploadQuery, this.baseDirectory, false);
			this.supportAsyncMode = qmc.supportAsyncMode();
		}
		this.supportSyncMode = qmc.supportSyncMode();

		if( CHECKUPLOAD ) {
			this.supportUpload = qmc.supportUpload();
		} else {
			this.supportUpload = false;
		}
		if( !this.supportSyncMode && !this.supportAsyncMode ){
			throw new TapException("No query mode supported (neither sync nor async)");
		}
	}

	/**
	 * Return the first table name found in /tables query result. Could be used to check the service 
	 * @return
	 * @throws Exception
	 */
	private String getFirstTableName() throws Exception {
		JSONParser parser = new JSONParser();
		JSONObject jso = (JSONObject) parser.parse(new FileReader(this.baseDirectory + "tables.json"));
		JSONArray jsa = (JSONArray)(jso.get("schemas"));
		if( jsa.size() == 0 ) {
			throw new Exception("No schema in tables.json");
		}
		for( int i=0 ; i<jsa.size() ; i++) {
			JSONArray tbls = (JSONArray) ((JSONObject)(jsa.get(i))).get("tables");
			//			if( tbls.size() == 0 ){
			//				throw new TapException("No table published in node " + this.regMark.getNodeKey());
			//			}
			if( tbls.size() != 0 ){
				for( int t=0 ; t<tbls.size() ; t++) {			
					return  (String) ((JSONObject)(tbls.get(t))).get("name");
				}
			}
		}
		throw new TapException("No table published in node " + this.regMark.getNodeKey());
		//return null;
	}
	
	private DataTreePath getFirstDataTreePath()throws Exception {
		JSONParser parser = new JSONParser();
		JSONObject jso = (JSONObject) parser.parse(new FileReader(this.baseDirectory + "tables.json"));
		JSONArray jsa = (JSONArray)(jso.get("schemas"));
		if( jsa.size() == 0 ) {
			throw new Exception("No schema in tables.json");
		}
		for( int i=0 ; i<jsa.size() ; i++) {
			JSONObject jsonSchema = (JSONObject)(jsa.get(i));
			JSONArray tbls = (JSONArray) (jsonSchema).get("tables");
			//			if( tbls.size() == 0 ){
			//				throw new TapException("No table published in node " + this.regMark.getNodeKey());
			//			}
			if( tbls.size() != 0 ){
				for( int t=0 ; t<tbls.size() ; t++) {	
					String schemaName = (String)(jsonSchema.get("name"));
					return new DataTreePath(schemaName, (String) ((JSONObject)(tbls.get(t))).get("name"), "");
				}
			}
		}
		throw new TapException("No table published in node " + this.regMark.getNodeKey());
	}
	/**
	 * Invokes a service of the node, extract its name space which will be used by XLST 
	 * @param service either availability, capabilities or tables
	 * @param nsDefinition {@link NameSpaceDefinition} modeling the name space
	 * @throws Exception If something goes wrong
	 */
	private String getServiceReponse(String service, NameSpaceDefinition nsDefinition) throws Exception {
		Pattern nsPattern  = Pattern.compile(".*xmlns(?::\\w+)?=(\"[^\"]*(?i)(?:" + service + ")[^\"]*\").*");
		logger.debug("Connect " + this.regMark.getAbsoluteURL(null) + service);
		URLConnection conn = TapAccess.getGetUrlConnection(new URL(this.regMark.getAbsoluteURL(null) + service));
		InputStream is = conn.getInputStream();
		BufferedReader in = new BufferedReader(new InputStreamReader(is));

		String inputLine;
		String outputFileName = this.baseDirectory +  URLEncoder.encode(service, "UTF-8") + ".xml";
		BufferedWriter bfw = new BufferedWriter(new FileWriter(outputFileName));
		boolean found = false;
		while ((inputLine = in.readLine()) != null) {
			if( !found ) {
				Matcher m = nsPattern.matcher(inputLine);
				if (m.matches()) {				
					nsDefinition.init("xmlns:vosi=" + m.group(1)) ;
					found = true;
				}
			}
			/*
			 * Some sites (STCSI) set VOSITables as default namespace, this make style sheets ignoring anything but <tableset>
			 */
			inputLine = inputLine.replace("xmlns=\"http://www.ivoa.net/xml/VOSITables/v1.0\"", "xmlns:vosi=\"http://www.ivoa.net/xml/VOSITables/v1.0\"");
			bfw.write(inputLine + "\n"/*.replaceAll("<\\/.*\\>", ">\n")*/);
		}
		in.close();
		bfw.close();
		return outputFileName;
	}

	/**
	 * Extract the service name space which will be used by XLST 
	 * @param service either availability, capabilities or tables
	 * @param nsDefinition {@link NameSpaceDefinition} modeling the name space
	 * @throws Exception If something goes wrong
	 */
	private void getNamspaceDefinition(String service, NameSpaceDefinition nsDefinition) throws Exception {
		logger.debug("get VOSI ns for " + service);
		Scanner s = new Scanner(new File(this.baseDirectory + service + ".xml"));
		//Pattern pattern  = Pattern.compile("(?i)(?:.*(xmlns(?:\\:\\w+)?=\"http\\:\\/\\/www.ivoa.net\\/.*" + service + "[^\"]*\").*)");
		Pattern pattern  = Pattern.compile(".*(xmlns:\\w+=\"[^\"]*(?i)(?:" + service + ")[^\"]*\").*");
		while ( s.hasNextLine()) {
			Matcher m = pattern.matcher(s.nextLine());
			if (m.matches()) {
				nsDefinition.init(m.group(1)) ;
				break;
			}
		}
		s.close();
	}

	/**
	 * Translate the service response in JSON
	 * @param service     either availability, capabilities or tables
	 * @param namespace   Namespace t be used by XSLT
	 * @throws Exception  If something goes wrong
	 */
	private void translateServiceReponse(String service, NameSpaceDefinition namespace) throws Exception {
		XmlToJson.translate(this.baseDirectory, service, namespace);
	}
	/**
	 * Translate the service response in JSON by using the style sheet .
	 * Rename the output as service.json
	 * @param service     either availability, capabilities or tables
	 * @param style
	 * @param namespace   Namespace t be used by XSLT
	 * @throws Exception  If something goes wrong
	 */
	private void translateServiceReponse(String service, String style,  NameSpaceDefinition namespace) throws Exception {
		XmlToJson.translate(this.baseDirectory, service, style, namespace);
		new File(this.baseDirectory + "/" + style + ".json").renameTo(new File(this.baseDirectory + "/" + service + ".json"));
	}

	/**
	 * Write the node key in JSON file if ther is a filed with "NODEKEY" as value.
	 * This feature is used by the client interface identify the nodes
	 * @param service     either availability, capabilities or tables
	 * @throws Exception  If something goes wrong
	 */
	private void setNodekeyInJsonResponse(String service) throws Exception {
		String filename = this.baseDirectory + service + ".json";
		Scanner s = new Scanner(new File(filename));
		PrintWriter fw = new PrintWriter(new File(filename + ".new"));
		while( s.hasNextLine() ) {
			fw.println(s.nextLine().replaceAll("NODEKEY", this.regMark.getNodeKey())
					.replaceAll("NODEURL", this.regMark.getAbsoluteURL(null))
					);
		}
		s.close();
		fw.close();
		(new File(filename + ".new")).renameTo(new File(filename));	
	}



	/**
	 * Insert into tables.json the fields pathname and tablename, both extracted from the full path. 
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	private void setDataTreePathInTables() throws Exception{
		String filename = this.baseDirectory  + "tables.json";
		JSONParser parser = new JSONParser();
		Object obj = parser.parse(new FileReader(filename));

		JSONObject jsonObject = (JSONObject) obj;
		JSONArray schemas = (JSONArray) jsonObject.get("schemas");
		for( int s=0 ; s<schemas.size() ; s++){
			JSONObject schema = (JSONObject) schemas.get(s);
			JSONArray tables = (JSONArray) schema.get("tables");
			for( int t=0 ; t<tables.size() ; t++){
				JSONObject table = (JSONObject) tables.get(t);
				DataTreePath dtp = new DataTreePath((String)(schema.get("name")), (String)(table.get("name")),(String)(table.get("description")));
				table.put("dataTreePath", dtp.getJSONObject());
			}
		}
		FileWriter fw = new FileWriter(filename);
		fw.write(jsonObject.toJSONString());
		fw.close();


	}
	/**
	 * @param service
	 * @throws Exception
	 */
	private void setCapabilityFlagsInJsonResponse() throws Exception {
		String filename = this.baseDirectory  + "tables.json";
		Scanner s = new Scanner(new File(filename));
		PrintWriter fw = new PrintWriter(new File(filename + ".new"));
		while( s.hasNextLine() ) {
			fw.println(s.nextLine().replaceAll("NODEASYNC", Boolean.toString(this.supportAsyncMode))
					.replaceAll("NODEUPLOAD", Boolean.toString(this.supportUpload()))
					);
		}
		s.close();
		fw.close();
		(new File(filename + ".new")).renameTo(new File(filename));	
	}

	/**
	 * Builds a JSON file describing the table tableName in a format 
	 * comprehensible by JQuery datatable widget
	 * @param dataTreePath  Data node descriptor
	 * @throws Exception If something goes wrong
	 */
	public void buildJsonTableDescription(DataTreePath dataTreePath) throws Exception {
		String tableFileName = dataTreePath.getEncodedFileName();
		String productName = this.baseDirectory + tableFileName ;
		if( new File(productName + ".json").exists()) {
			return;
		}
		logger.debug("buildJsonTableDescription JSON file " + dataTreePath.getTable() + ".json not found: build it");
		XmlToJson.translateTableMetaData(this.baseDirectory, "tables", dataTreePath, tablesNS);            
		/*
		 * If there is no attribute in the JSON table description, the service delivers it likley table by table
		 */
		if( !isThereJsonTableDesc(dataTreePath) ) {
			logger.debug("No column found in " + tableFileName + ": make a per table query");
			File fn = new File(productName + ".xml");
//			String noSchemaName = dataTreePath.getTableName();
//			int pos = noSchemaName.indexOf('.');
//			
//			if( pos > 0 ) {
//				noSchemaName = noSchemaName.substring(pos + 1);
//			}
			String outputFilename = null;
			try {
				outputFilename = this.getServiceReponse("tables/" + dataTreePath.getTable(), tablesNS);
				if( ! (new File(outputFilename)).renameTo(fn) ) {
					throw new TapException("Cannot store columns of table  " + dataTreePath +" in file " + outputFilename);
				}
				XmlToJson.translateTableMetaData(this.baseDirectory, dataTreePath, tablesNS, "1.0");      

			} catch(FileNotFoundException e){
				logger.debug("Vosi 1.1");
				outputFilename = this.getServiceReponse("tables/" + dataTreePath.geTableOrg(), tablesNS);
				if( ! (new File(outputFilename)).renameTo(fn) ) {
					throw new TapException("Cannot store columns of table  " + dataTreePath +" in file " + outputFilename);
				}
				XmlToJson.translateTableMetaData(this.baseDirectory, dataTreePath, tablesNS, "1.1");      

			}
			//fn.delete();
			//(new File(this.baseDirectory + dataTreePath.getEncodedFileName()  +  ".xsl")).delete();
		}

		setNodekeyInJsonResponse(tableFileName);
		setDataTreePathInJsonResponse(productName, dataTreePath);
	}
	/**
	 * Return true if the JSON file describing the metadata of the table tableName is not empty of attributes.
	 * If it is, the table comes likely from Vizier and a special query must be sent to get those column description
	 * @param dataTreePath
	 * @return
	 * @throws Exception
	 */
	private boolean isThereJsonTableDesc(DataTreePath dataTreePath) throws Exception{
		JSONParser parser = new JSONParser();
		Object obj = parser.parse(new FileReader(this.baseDirectory + dataTreePath.getEncodedFileName() + ".json"));
		JSONObject jsonObject = (JSONObject) ((JSONObject) obj).get("attributes");

		return (((JSONArray) jsonObject.get("aaData")).size() > 0)? true: false;
	}

	/**
	 * Builds a JSON file describing the table tableName to setup
	 * query form
	 * @param dataTreePath  Descriptor of the data node
	 * @throws Exception If something goes wrong
	 */
	@SuppressWarnings("unchecked")
	synchronized public void buildJsonTableAttributes(DataTreePath dataTreePath) throws Exception {

		String tableFileName = dataTreePath.getEncodedFileName();
		String productName = this.baseDirectory + tableFileName + "_att";
		if( new File(productName + ".json").exists()) {
			return;
		}
		logger.debug("buildJsonTableAttributes JSON file " + tableFileName + ".json not found: build it");
		XmlToJson.translateTableAttributes(this.baseDirectory, "tables", dataTreePath, tablesNS);		
		/*
		 * If there is no attribute in the JSON table description, the service delivers likely it  table by table
		 */
		if( !isThereJsonTableAtt(dataTreePath) ) {
			logger.debug("No column found in " + tableFileName + ": make a per table query");
			File fn = new File(productName  +  ".xml");
			String outputFilename = null;
			try {
				outputFilename = this.getServiceReponse("tables/" + dataTreePath.getTable(), tablesNS);
			} catch(FileNotFoundException e){
				logger.debug("Vosi 1.1");
				outputFilename = this.getServiceReponse("tables/" + dataTreePath.geTableOrg(), tablesNS);
			}
			if( ! (new File(outputFilename)).renameTo(fn) ) {
				throw new TapException("Cannot rename " + fn.getAbsolutePath() + " to " + outputFilename );
			}
			XmlToJson.translateTableAttributes(this.baseDirectory, dataTreePath, tablesNS);	
			//fn.delete();
			//(new File(productName  +  ".xsl")).delete();
		}
		/*
		 * Insert pathname and tablename in json file
		 * 
		 */
		setDataTreePathInJsonResponse(productName, dataTreePath);
	}		

	/**
	 * Return true if the JSON file describing the table tableName is not empty of attributes.
	 * If it is, the table comes likely from Vizier and a special query must be sent to get those column description
	 * @param dataTreepath descriptor of the data tree path (schema.table)
	 * @return
	 * @throws Exception
	 */
	private boolean isThereJsonTableAtt(DataTreePath dataTreepath) throws Exception{
		JSONParser parser = new JSONParser();
		String vizFilename =  dataTreepath.getEncodedFileName() + "_att.json";
		Object obj = parser.parse(new FileReader(this.baseDirectory + vizFilename));
		JSONObject jsonObject = (JSONObject) obj;
		return (((JSONArray) jsonObject.get("attributes")).size() > 0)? true: false;
	}

	/**
	 * Returns a JSON table list with maxSize first tables and tap schema tables
	 * @param maxSize
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	synchronized public JSONObject filterTableList(int maxSize) throws Exception {
		JSONParser parser = new JSONParser();
		Object obj = parser.parse(new FileReader(this.getBaseDirectory() + "tables.json"));
		JSONObject jsonObject = (JSONObject) obj;
		JSONArray schemas = (JSONArray) jsonObject.get("schemas");
		boolean truncated = false;
		for(Object sn: schemas) {
			boolean takeAnyway = false;
			ArrayList<JSONObject> toRemove = new ArrayList<JSONObject>();
			JSONObject s = (JSONObject)sn;
			String schemaName = (String)s.get("name");
			if( schemaName.equalsIgnoreCase("tap_schema") ||schemaName.equalsIgnoreCase("ivoa") ) {
				takeAnyway = true;
			}
			JSONArray tables = (JSONArray) s.get("tables");

			int cpt = 0;
			for( Object ts: tables) {
				JSONObject t = (JSONObject)ts;

				if( cpt >= maxSize && !takeAnyway ) {
					truncated = true;
					toRemove.add(t);
				}
				if( !takeAnyway) cpt++;
			}
			for( JSONObject tr: toRemove) {
				tables.remove(tr);
			}
		}
		/*
		 * Advice the client that the list is truncated
		 */
		if( truncated ) {
			jsonObject.put("truncated", "true");
		}
		return jsonObject;
	}

	/**
	 * Returns a JSON table list with only tables matching the filer (filtered by name or by description)
	 * and tap schema tables
	 * @param filter
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	synchronized public JSONObject filterTableList(String filter) throws Exception {
		JSONParser parser = new JSONParser();
		Object obj = parser.parse(new FileReader(this.getBaseDirectory() + "tables.json"));
		JSONObject jsonObject = (JSONObject) obj;
		JSONArray schemas = (JSONArray) jsonObject.get("schemas");
		boolean truncated = false;
		int kept = 0;
		for(Object sn: schemas) {
			boolean takeAnyway = false;
			ArrayList<JSONObject> toRemove = new ArrayList<JSONObject>();
			JSONObject s = (JSONObject)sn;
			String schema = (String) s.get("name");
			if( schema.equalsIgnoreCase("tap_schema") ) {
				takeAnyway = true;
			}
			JSONArray tables = (JSONArray) s.get("tables");
			for( Object ts: tables) {
				JSONObject t = (JSONObject)ts;
				String table = (String) t.get("name");
				String desc = (String) t.get("description");
				String re = "(?i)(.*" + filter + ".*)";
				if(takeAnyway ) {
					continue;
				} else if( kept >= MAXTABLES ) {
					//@@@@@@@@@@@
					//					truncated = false;
					//					toRemove.add(t);	
					//					continue;
				} else if (!desc.matches(re) 
						&& !table.matches(re)
						&& !schema.matches(re)
						){
					toRemove.add(t);	
					continue;
				} else {
					kept++;					
				}
			}
			for( JSONObject tr: toRemove) {
				tables.remove(tr);
			}
		}
		/*
		 * remove empty schemas
		 */
		ArrayList<JSONObject> toRemove = new ArrayList<JSONObject>();
		for(Object sn: schemas) {
			JSONObject s = (JSONObject)sn;
			JSONArray tables = (JSONArray) s.get("tables");
			if( tables.size() == 0 ) {
				toRemove.add(s);					
			}
		}			
		for( JSONObject tr: toRemove) {
			schemas.remove(tr);
		}
		/*
		 * Advice the client that the lsit is truncated
		 */
		if( truncated ) {
			jsonObject.put("truncated", "true");
		}
		return jsonObject;
	}

	/**
	 * Returns a JSON table list with only tables matching the filer (filtered by name or by description)
	 * and  contained in seleced list in addition with tap schema tables which cannot be discarded
	 * Any element are taken if selected = ["any"]
	 * @param filter
	 * @param selected: list a table to select
	 * @return
	 * @throws Exception
	 */
	synchronized public JSONObject filterTableList(String filter, Set<String> selected) throws Exception {
		JSONObject jsonObject = this.filterTableList(filter) ;
		int nbSelected = 0;
		boolean any = ( selected != null && selected.size() == 1 && selected.contains("any"))? true: false;
		JSONArray schemas = (JSONArray) jsonObject.get("schemas");
		for(Object sn: schemas) {
			boolean takeAnyway = false;
			ArrayList<JSONObject> toRemove = new ArrayList<JSONObject>();
			JSONObject s = (JSONObject)sn;
			String schema = (String) s.get("name");
			if( schema.equalsIgnoreCase("tap_schema") ) {
				takeAnyway = true;
			}
			JSONArray tables = (JSONArray) s.get("tables");
			for( Object ts: tables) {
				JSONObject t = (JSONObject)ts;
				String table = (String) t.get("name");
				if(takeAnyway ) {
					continue;
				} else if (nbSelected > MAXTABLES ){
					toRemove.add(t);	
					continue;
				} else if ( any || selected == null  || selected.size() == 0 || selected.contains(table) ){
					nbSelected ++;
				} else {
					toRemove.add(t);	
					continue;
				}
			}
			int si = tables.size();
			for( JSONObject tr: toRemove) {
				tables.remove(tr);
			}

		}
		/*
		 * remove empty schemas
		 */
		ArrayList<JSONObject> toRemove = new ArrayList<JSONObject>();
		for(Object sn: schemas) {
			JSONObject s = (JSONObject)sn;
			JSONArray tables = (JSONArray) s.get("tables");
			if( tables.size() == 0 ) {
				toRemove.add(s);					
			}
		}			
		for( JSONObject tr: toRemove) {
			schemas.remove(tr);
		}
		//		}
		return jsonObject;
	}

	/**
	 * Filter not significant characters ending the URLS
	 * @param url
	 * @return
	 * @throws Exception
	 */
	public static String filterURLTail(String url) throws Exception{
		return url.replaceAll("[^a-zA-Z\\d_-]*$", "");
	}

}
