package metabase;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.URL;
import java.util.Date;
import java.util.Scanner;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import resources.RootClass;
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
 */
public class TapNode  extends RootClass {

	private String baseDirectory;
	private String url;
	private String key;
	private NameSpaceDefinition availabilityNS = new NameSpaceDefinition();
	private NameSpaceDefinition capabilityNS   = new NameSpaceDefinition();
	private NameSpaceDefinition tablesNS       = new NameSpaceDefinition();
	private long last_availability_check = -1;


	/**
	 * @return Returns he node directory (ended with a file separator)
	 */
	public String getBaseDirectory() {
		return baseDirectory;
	}


	/**
	 * @return Return the TAP node URL
	 */
	public String getUrl() {
		return url;
	}


	/**
	 * Creator
	 * @param url           TAP node RL
	 * @param baseDirectory Local directory where node data are stored
	 * @param key           key referencing the node
	 * @throws Exception    Rise if something goes wrong
	 */
	public TapNode(String url, String baseDirectory, String key) throws Exception {
		this.baseDirectory = baseDirectory;
		this.key = key;
		this.url = url;
		if( !this.url.endsWith("/") ) {
			this.url += "/";
		}
		if( !this.baseDirectory.endsWith(File.separator) ) {
			this.baseDirectory += File.separator;
		}
		emptyDirectory(new File(baseDirectory));
		validWorkingDirectory(baseDirectory);
		this.checkServices();
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
		logger.info("Service " + this.url + " seems to be working");
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
			getServiceReponse("availability", availabilityNS);
			translateServiceReponse("availability", availabilityNS);
			this.last_availability_check = t;
		} else {
			logger.debug("availability already checked");
			if( availabilityNS.getNsDeclaration() == null )
				this.getNamspaceDefinition("capabilities", capabilityNS);
			return;
		}

		String av = JsonUtils.getValue (this.baseDirectory + "availability.json", "available");
		if( "1".equals(av) || "true".equalsIgnoreCase(av)) {
			logger.debug("Service " + this.url + " is available");
		}
		else {
			logger.debug("Service " + this.url + " is unavailable");
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
		getServiceReponse("capabilities", capabilityNS);
		translateServiceReponse("capabilities", capabilityNS);
		logger.debug(this.url + " Capabilities is available");
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
		getServiceReponse("tables", tablesNS);
		translateServiceReponse("tables", tablesNS);
		setNodekeyInJsonResponse("tables");
		logger.debug(this.url + " tables is available");

	}

	/**
	 * Invokes a service of the node, extract its name space which will be used by XLST 
	 * @param service either availability, capabilities or tables
	 * @param nsDefinition {@link NameSpaceDefinition} modeling the name space
	 * @throws Exception If something goes wrong
	 */
	private void getServiceReponse(String service, NameSpaceDefinition nsDefinition) throws Exception {
		Pattern pattern  = Pattern.compile("(?i)(?:.*(xmlns(?:\\:\\w+)?=\\\"http\\:\\/\\/www\\.ivoa\\.net\\/.*" + service + "[^\\\"]*\\\").*)");
		pattern  = Pattern.compile(".*xmlns(?::\\w+)?=(\"[^\"]*(?i)(?:" + service + ")[^\"]*\").*");
		logger.debug("read " + this.url + service);
		BufferedReader in = new BufferedReader(
				new InputStreamReader(
						(new URL(this.url + service)).openStream()));

		String inputLine;
		BufferedWriter bfw = new BufferedWriter(new FileWriter(this.baseDirectory + service + ".xml"));
		boolean found = false;
		while ((inputLine = in.readLine()) != null) {
			if( !found ) {
				Matcher m = pattern.matcher(inputLine);
				if (m.matches()) {				
					System.out.println("@@@@ getServiceReponse NSDECLAR " +inputLine );
					nsDefinition.init("xmlns:vosi=" + m.group(1)) ;
					System.out.println("@@@@ getServiceReponse NSDECLAR " +m.group(1) );
					found = true;
				}
			}
			bfw.write(inputLine + "\n"/*.replaceAll("<\\/.*\\>", ">\n")*/);
		}
		in.close();
		bfw.close();
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
		Pattern pattern  = Pattern.compile("(?i)(?:.*(xmlns(?:\\:\\w+)?=\"http\\:\\/\\/www.ivoa.net\\/.*" + service + "[^\"]*\").*)");
		pattern  = Pattern.compile(".*(xmlns:\\w+=\"[^\"]*(?i)(?:" + service + ")[^\"]*\").*");
		while ( s.hasNextLine()) {
			Matcher m = pattern.matcher(s.nextLine());
			if (m.matches()) {
				System.out.println("@@@@ getNamspaceDefinition NSDECLAR " +m.group(1) );
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
		while( s.hasNextLine() ) {
			fw.println(s.nextLine().replaceAll("NODEKEY", this.key));
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
		XmlToJson.translateTableMetaData(this.baseDirectory, tableName, tablesNS);		
		setNodekeyInJsonResponse(tableName);
	}

	/**
	 * Builds a JSON file describing the table tableName to setup
	 * query form
	 * @param tableName  Name of the table
	 * @throws Exception If something goes wrong
	 */
	public void buildJsonTableAttributes(String tableName) throws Exception {
		XmlToJson.translateTableAttributes(this.baseDirectory, tableName, tablesNS);		
		//@@@@@@@@@@@@@@setNodekeyInJsonResponse(tableName);
	}		
}
