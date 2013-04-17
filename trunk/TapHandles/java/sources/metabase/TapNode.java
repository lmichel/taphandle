package metabase;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
import java.util.ArrayList;
import java.util.Date;
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
import translator.JsonUtils;
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
	private long last_availability_check = -1;

	public final boolean largeResource;	
	/*
	 * true if a query on the tap schema building possible joins succeeded 
	 * Not really used yet
	 */
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
		this.checkAvailability();		
		logger.debug("NS for availability " + availabilityNS);
		this.checkCapability() ;
		logger.debug("NS for capability " + capabilityNS.getNsName());
		this.checkTables() ;
		logger.debug("NS for tables " + tablesNS.getNsName());

		this.testCapabilities() ;
		/*
		 * DO it again to add capability flags in tables.JSON
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
	 * Check the service availability. This method is invoked each time the node is acceded.
	 * The avoid useless network accesses, the  service is actually invoked every 
	 * AVAILABILITY_CHECK_FREQUENCY ms. Otherwise the method returns the availability read in the file
	 * returned by the service
	 * @throws Exception
	 */
	private void checkAvailability() throws Exception {
		logger.debug("check availability");
		long t = new Date().getTime();
		if( (t - this.last_availability_check) > AVAILABILITY_CHECK_FREQUENCY) {
			this.getServiceReponse("availability", availabilityNS);
			this.translateServiceReponse("availability", availabilityNS);
			this.last_availability_check = t;
		} else {
			logger.debug("availability already checked");
			if( availabilityNS.getNsDeclaration() == null )
				this.getNamspaceDefinition("capabilities", capabilityNS);
			return;
		}

		String av = JsonUtils.getValue (this.baseDirectory + "availability.json", "available");
		if( "1".equals(av) || "true".equalsIgnoreCase(av)) {
			logger.debug("Service " + this.regMark + " is available");
		}
		else {
			logger.debug("Service " + this.regMark + " is unavailable");
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
	}

	/**
	 * Get the table description of the service. 
	 * If the service has already been invoked the name space is extracted from the XML response
	 * to make sure the JSON translation works
	 * The JSON translation of tables.xml do not contain column description but just schema/table names
	 * @throws Exception If something goes wrong
	 */
	private void checkTables() throws Exception {
		File f = new File(this.baseDirectory + "tables.xml");
		if( f.exists() && f.isFile() &&f.canRead()) {
			logger.debug("tables already checked");
			if( tablesNS.getNsDeclaration()  == null  )
				this.getNamspaceDefinition("tables", tablesNS);
			return;
		}
		logger.debug("check tables");
		this.getServiceReponse("tables", tablesNS);
		this.translateServiceReponse("tables", tablesNS);
		try {
			this.getFirstTableName();
		} catch(Exception e){
			logger.warn("No tables in tables.xml, Try to scan the TAP_SCHEMA");		
			try {
				new TablesReconstructor(this.regMark.getAbsoluteURL(null), this.baseDirectory);
				this.translateServiceReponse("tables", tablesNS);
				if( this.getFirstTableName() == null ) {
					throw new Exception("No tables in tables.xml, is that file compliant with the schema?");
				} else {
					logger.info("succeed");
				}	
			} catch (Exception e2) {
				throw new Exception("No valid tables capability: failed to rebuild it from the TAP schema: " + e2);
			}
		}
		this.setNodekeyInJsonResponse("tables");			
	}

	/**
	 * Check if either syn or async query mode is available
	 * @throws TapException If no query succeed
	 */
	private void testCapabilities() throws Exception {
		String query = "SELECT TOP 1 * FROM " + quoteTableName(getFirstTableName());
		String uploadQuery = "SELECT TOP 1 * FROM " + quoteTableName(getFirstTableName()) + " NATURAL JOIN TAP_UPLOAD.taphandlesample ";
		logger.debug("Test query " + query);
		QueryModeChecker qmc = new QueryModeChecker(this.regMark.getFullUrl(), query, uploadQuery, this.baseDirectory);
		this.supportSyncMode = qmc.supportSyncMode();
		this.supportAsyncMode = qmc.supportAsyncMode();
		this.supportUpload = qmc.supportUpload();
System.out.println("@@@@@@@@@@@@@@@@@@@@ " + this.supportUpload);
		if( !this.supportSyncMode && !this.supportSyncMode ){
			
			throw new TapException("No query mode supported (neither sync nor async");
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
			if( tbls.size() == 0 ){
				throw new TapException("No table published in node " + this.regMark.getNodeKey());
			}
			for( int t=0 ; t<jsa.size() ; t++) {
				return  (String) ((JSONObject)(tbls.get(i))).get("name");
			}
		}
		return null;
	}
	/**
	 * Invokes a service of the node, extract its name space which will be used by XLST 
	 * @param service either availability, capabilities or tables
	 * @param nsDefinition {@link NameSpaceDefinition} modeling the name space
	 * @throws Exception If something goes wrong
	 */
	private String getServiceReponse(String service, NameSpaceDefinition nsDefinition) throws Exception {
		//Pattern pattern  = Pattern.compile("(?i)(?:.*(xmlns(?:\\:\\w+)?=\\\"http\\:\\/\\/www\\.ivoa\\.net\\/.*" + service + "[^\\\"]*\\\").*)");
		Pattern pattern  = Pattern.compile(".*xmlns(?::\\w+)?=(\"[^\"]*(?i)(?:" + service + ")[^\"]*\").*");
		logger.debug("Connect " + this.regMark.getAbsoluteURL(null) + service);
		URLConnection conn = TapAccess.getUrlConnection(new URL(this.regMark.getAbsoluteURL(null) + service));
		InputStream is = conn.getInputStream();
		BufferedReader in = new BufferedReader(new InputStreamReader(is));

		String inputLine;
		String outputFileName = this.baseDirectory + RootClass.vizierNameToFileName(service) + ".xml";
		BufferedWriter bfw = new BufferedWriter(new FileWriter(outputFileName));
		boolean found = false;
		while ((inputLine = in.readLine()) != null) {
			if( !found ) {
				Matcher m = pattern.matcher(inputLine);
				if (m.matches()) {				
					nsDefinition.init("xmlns:vosi=" + m.group(1)) ;
					found = true;
				}
			}
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
	 * Write the node key in JSON file if ther is a filed with "NODEKEY" as value.
	 * This feature is used by the client interface identify the nodes
	 * @param service     either availability, capabilities or tables
	 * @throws Exception  If something goes wrong
	 */
	private void setNodekeyInJsonResponse(String service) throws Exception {
		String filename = this.baseDirectory + service + ".json";
		Scanner s = new Scanner(new File(filename));
		PrintWriter fw = new PrintWriter(new File(filename + ".new"));
		System.out.println("@@@@@@@@@@@@@@@@@@@@222222 " + this.supportUpload);
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
	 * @param service
	 * @throws Exception
	 */
	private void setCapabilityFlagsInJsonResponse() throws Exception {
		String filename = this.baseDirectory  + "tables.json";
		Scanner s = new Scanner(new File(filename));
		PrintWriter fw = new PrintWriter(new File(filename + ".new"));
		System.out.println("@@@@@@@@@@@@@@@@@@@@222222 " + this.supportUpload);
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
	 * @param tableName  Name of the table
	 * @throws Exception If something goes wrong
	 */
	public void buildJsonTableDescription(String tableName) throws Exception {
		String tableFileName = RootClass.vizierNameToFileName(tableName);
		String productName = this.baseDirectory + tableFileName ;
		if( new File(productName + ".json").exists()) {
			return;
		}
		logger.debug("JSON file " + tableName + ".json not found: build it");
		XmlToJson.translateTableMetaData(this.baseDirectory, "tables", tableName, tablesNS);            
		/*
		 * If there is no attribute in the JSON table description, the service delivers it likley table by table
		 */
		if( !isThereJsonTableDesc(tableName) ) {
			logger.debug("No colmuns found in " + tableFileName + ": make a per table query");
			File fn = new File(productName + ".xml");
			String noSchemaName = tableName;
			int pos = noSchemaName.indexOf('.');
			if( pos > 0 ) {
				noSchemaName = noSchemaName.substring(pos + 1);
			}
			String outputFilename = this.getServiceReponse("tables/" + noSchemaName, tablesNS);
			//this.getServiceReponse("columns?query=" + noSchemaName, tablesNS);
			if( ! (new File(outputFilename)).renameTo(fn) ) {
				throw new TapException("Cannot store columns of table  " + tableName +" in file " + outputFilename);
			}
			XmlToJson.translateTableMetaData(this.baseDirectory, tableName, tablesNS);      
			fn.delete();
			(new File(this.baseDirectory + tableName  +  ".xsl")).delete();
		}

		setNodekeyInJsonResponse(tableFileName);
	}
	/**
	 * Return true if the JSON file describing the metadata of the table tableName is not empty of attributes.
	 * If it is, the table comes likely from Vizier and a special query must be sent to get those column description
	 * @param tableName
	 * @return
	 * @throws Exception
	 */
	private boolean isThereJsonTableDesc(String tableName) throws Exception{
		JSONParser parser = new JSONParser();
		Object obj = parser.parse(new FileReader(this.baseDirectory + RootClass.vizierNameToFileName(tableName) + ".json"));
		JSONObject jsonObject = (JSONObject) ((JSONObject) obj).get("attributes");

		return (((JSONArray) jsonObject.get("aaData")).size() > 0)? true: false;
	}

	/**
	 * Builds a JSON file describing the table tableName to setup
	 * query form
	 * @param tableName  Name of the table
	 * @throws Exception If something goes wrong
	 */
	public void buildJsonTableAttributes(String tableName) throws Exception {
		String tableFileName = RootClass.vizierNameToFileName(tableName);
		String productName = this.baseDirectory + tableFileName + "_att";
		if( new File(tableFileName + ".json").exists()) {
			return;
		}
		logger.debug("JSON file " + tableFileName + ".json not found: build it");
		XmlToJson.translateTableAttributes(this.baseDirectory, "tables", tableName, tablesNS);		
		/*
		 * If there is no attribute in the JSON table description, the service delivers it likley table by table
		 */
		if( !isThereJsonTableAtt(tableName) ) {
			logger.debug("No colmuns found in " + tableFileName + ": make a per table query");
			File fn = new File(productName  +  ".xml");
			String noSchemaName = tableName;
			int pos = noSchemaName.indexOf('.');
			if( pos > 0 ) {
				noSchemaName = noSchemaName.substring(pos + 1);
			}
			String outputFilename = this.getServiceReponse("tables/" + noSchemaName, tablesNS);
			if( ! (new File(outputFilename)).renameTo(fn) ) {
				throw new TapException("Cannot store columns of table  " + tableName +" in file " + this.baseDirectory + tableFileName  +  "_att.xml");
			}
			XmlToJson.translateTableAttributes(this.baseDirectory, tableName, tablesNS);	
			fn.delete();
			(new File(this.baseDirectory + tableFileName  +  "_att.xsl")).delete();
		}
	}		

	/**
	 * Return true if the JSON file describing the table tableName is not empty of attributes.
	 * If it is, the table comes likely from Vizier and a special query must be sent to get those column description
	 * @param tableName
	 * @return
	 * @throws Exception
	 */
	private boolean isThereJsonTableAtt(String tableName) throws Exception{
		JSONParser parser = new JSONParser();
		Object obj = parser.parse(new FileReader(this.baseDirectory + RootClass.vizierNameToFileName(tableName) + "_att.json"));
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
	public JSONObject filterTableList(int maxSize) throws Exception {
		JSONParser parser = new JSONParser();
		Object obj = parser.parse(new FileReader(this.getBaseDirectory() + "tables.json"));
		JSONObject jsonObject = (JSONObject) obj;
		JSONArray schemas = (JSONArray) jsonObject.get("schemas");
		boolean truncated = false;
		for(Object sn: schemas) {
			boolean takeAnyway = false;
			ArrayList<JSONObject> toRemove = new ArrayList<JSONObject>();
			JSONObject s = (JSONObject)sn;
			if( ((String)s.get("name")).equalsIgnoreCase("tap_schema") ) {
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
		 * Advice the client that the litt is truncated
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
	public JSONObject filterTableList(String filter) throws Exception {
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
				if(takeAnyway ) {
					continue;
				} else if( kept >= MAXTABLES ) {
					truncated = true;
					toRemove.add(t);	
					continue;
				} else if (!desc.matches("(?i)(.*" + filter + ".*)") && !table.matches("(?i)(.*" + filter + ".*)") ){
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
	 * and not contained in rejectedIndividuals in addition with tap schema tables which cannot be discarded
	 * @param filter
	 * @param rejectedIndividuals
	 * @return
	 * @throws Exception
	 */
	public JSONObject filterTableList(String filter, Set<String> rejectedIndividuals) throws Exception {
		JSONObject jsonObject = this.filterTableList(filter) ;
		if( rejectedIndividuals != null && rejectedIndividuals.size() != 0 ) {
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
					} else if (rejectedIndividuals.contains(table)  ){
						toRemove.add(t);	
						continue;
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
		}
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
