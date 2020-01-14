package tapaccess;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.SocketTimeoutException;
import java.net.URL;
import java.net.URLConnection;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import resources.RootClass;
import session.NodeCookie;
import translator.JsonUtils;
import translator.NameSpaceDefinition;
import translator.XmlToJson;


/**
 * @author laurent
 * @version $Id
 * 
 * 10/2012: Add client address to createAsyncJob in order to transmit the real client address to TAP services
 */
public class TapAccess  extends RootClass {

	public static final HttpURLConnection getSimpleUrlConnection(URL url) throws IOException{
		logger.info("Get connection on " + url);
		HttpURLConnection conn = (HttpURLConnection) url.openConnection();
		conn.setConnectTimeout(SOCKET_CONNECT_TIMEOUT);		
		conn.setReadTimeout(SOCKET_READ_TIMEOUT);
		return conn;
	}

	/**
	 * Returns the HTTP URL GET connection with the proper timeouts
	 * If the connection is a redirection, a new connection the that URL is open
	 * with the same timeouts.
	 * The HTTP method is not processed by this method 
	 * TODO handling the HTTP errors
	 * Set global timeout for URLConnection
	 * @param conn : URL connection ready to be used
	 * @throws IOException 
	 */
	public static final HttpURLConnection getGetUrlConnection(URL url) throws IOException{
		logger.info("Get connection on " + url);
		HttpURLConnection conn = (HttpURLConnection) url.openConnection();
		conn.setConnectTimeout(SOCKET_CONNECT_TIMEOUT);		
		conn.setReadTimeout(SOCKET_READ_TIMEOUT);
		conn.setRequestMethod("GET");

		int status = conn.getResponseCode();

		if (status != HttpURLConnection.HTTP_OK) {
		    if (status == HttpURLConnection.HTTP_MOVED_TEMP
		        || status == HttpURLConnection.HTTP_MOVED_PERM
		            || status == HttpURLConnection.HTTP_SEE_OTHER) {
		    HttpURLConnection conn2 ;
		    String newUrl = conn.getHeaderField("Location");
		    logger.debug("Redirect to " + newUrl);
		    conn2 = (HttpURLConnection) (new URL(newUrl)).openConnection();
		    conn2.setConnectTimeout(SOCKET_CONNECT_TIMEOUT);		
		    conn2.setReadTimeout(SOCKET_READ_TIMEOUT);
			return conn2;
		    }

		}
		return conn;
	}
	
	/**
	 * Returns the HTTP URL POSTconnection with the proper timeouts
	 * Data are sent to this connection
	 * If the connection is a redirection, a new GET connection to that URL is open
	 * with the same timeouts but without data.
	 * The HTTP method is not processed by this method 
	 * TODO handling the HTTP errors
	 * Set global timeout for URLConnection
	 * @param conn : URL connection ready to be used
	 * @param data : request parameters
	 * @throws IOException 
	 */
	public static final HttpURLConnection getPostUrlConnection(URL url, String data) throws IOException{
		HttpURLConnection conn = (HttpURLConnection) url.openConnection();
		conn.setConnectTimeout(SOCKET_CONNECT_TIMEOUT);		
		conn.setReadTimeout(SOCKET_READ_TIMEOUT);
		conn.setRequestMethod("POST");
		conn.setDoOutput(true);
		if( data != null ) {
			OutputStreamWriter writer = new OutputStreamWriter(conn.getOutputStream());
			//write parameters
			writer.write(data);
			writer.flush();
			writer.close();
		}
		
		// process redirection by hand
		int status = conn.getResponseCode();

		if (status != HttpURLConnection.HTTP_OK && (status == HttpURLConnection.HTTP_MOVED_TEMP
		        || status == HttpURLConnection.HTTP_MOVED_PERM
		            || status == HttpURLConnection.HTTP_SEE_OTHER) ) {
		    HttpURLConnection conn2 ;
		    String newUrl = conn.getHeaderField("Location");		    
		    logger.debug("Redirect to " + newUrl + " as a GET");
		    conn2 = (HttpURLConnection) (new URL(newUrl)).openConnection();
		    conn2.setConnectTimeout(SOCKET_CONNECT_TIMEOUT);		
		    conn2.setReadTimeout(SOCKET_READ_TIMEOUT);
			conn2.setRequestMethod("GET");
			return conn2;
		}
		return conn;
	}

	/**
	 * @param endpoint : service URL
	 * @param data : HTTP parameters
	 * @param outputfile: name of he output file
	 * @param cookie: Session cookie
	 * @param translate: Apply the asyncjob style sheet if needed
	 * @throws Exception
	 */
	public static void sendPostRequest(String endpoint, String data, String statusFileName, NodeCookie cookie, boolean translate) throws Exception {

		logger.debug("send POST request " + endpoint + "(" + data + ") " + cookie);
		// Send the request
		URL url = new URL(endpoint);  
		cookie.addCookieToUrl(url);   
		HttpURLConnection conn = getPostUrlConnection(url, data);
		/*
		 * In case of error, we asume te the server returns an error VOTABLE
		 * looking like this <...><...>...<...>MESSAGE</>...</></>
		 * The MESSAGE is extracted and sent to the client as an Exception  message
		 */
		if( conn.getResponseCode() != HttpURLConnection.HTTP_OK) {
			logger.error(endpoint + " returns error " +  ((HttpURLConnection)conn).getResponseCode());
			
			InputStream is = conn.getErrorStream();
			BufferedReader reader = new BufferedReader(new InputStreamReader(is));
			StringBuilder stringBuffer = new StringBuilder();
			String line;
			while ((line = reader.readLine()) != null) {
				stringBuffer.append(line);
			}
			reader.close();
			Pattern p = Pattern.compile(".*>([^<>]+)<.*", Pattern.DOTALL);
			Matcher m = p.matcher(stringBuffer.toString());
			if (m.find( )) {
				 logger.error("Error " + m.group(1));
		         throw new TapException(m.group(1));

		    } else {
				 logger.error("Error Uncaught error");
		         throw new TapException("Uncaught error");
		    }
		
        }
		// Get the response
		try {
			String ce;
			/*
			 * Encoded content
			 */
			if( (ce = conn.getContentEncoding() ) != null && ce.length() > 0 ) {
				FileOutputStream fileOutputStream = null;
				BufferedInputStream in = null;
				try {
					fileOutputStream = new FileOutputStream(statusFileName);
					in = new BufferedInputStream(conn.getInputStream());
					byte dataBuffer[] = new byte[1024];
					int bytesRead;
					int lg = 0;
					while ((bytesRead = in.read(dataBuffer, 0, 1024)) != -1) {
						fileOutputStream.write(dataBuffer, 0, bytesRead);
						lg += bytesRead;
					}
					logger.debug("got " + lg + "b of encoded data ");
			
				} finally {
				    if(fileOutputStream != null ) fileOutputStream.close();
				    if(in != null ) in.close();
				}
			/*
			 * ASCII content
			 */
			} else {
				BufferedWriter bw = null;
				InputStream inputStream = conn.getInputStream();
				BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream));
				try {
					bw = new BufferedWriter(new FileWriter(statusFileName));
					String line;
					int lg = 0;
					while ((line = reader.readLine()) != null) {
						bw.write(line + "\n");
						lg += line.length();
					}
					logger.debug("got " + lg + "b of ASCII data ");

				} finally {
					if( bw != null ) bw.close();
					if(reader != null ) reader.close();
				}

			}

			cookie.storeCookie();	   
			if( translate){
				XmlToJson.applyStyle(statusFileName, statusFileName.replaceAll("xml", "json")
						, styleDir + "asyncjob.xsl");
			}

		} catch(SocketTimeoutException e){
			logger.warn("Socket on " + endpoint + " closed on client timeout (" + (RootClass.SOCKET_READ_TIMEOUT/1000) + "\")");
			conn.disconnect();
			throw new SocketTimeoutException("Socket Closed on client timeout (" + (RootClass.SOCKET_READ_TIMEOUT/1000) + "\")");
		}
	}

	/**
	 * @param endpoint
	 * @param data
	 * @param outputfile
	 * @param cookie
	 * @throws Exception
	 */
	public static void sendGetRequest(String endpoint, String outputfile, NodeCookie cookie) throws Exception {

		logger.debug("send GET request " + endpoint + " cookie: " + cookie);
		// Send the request
		URL url = new URL(endpoint);  
		cookie.addCookieToUrl(url);   

		HttpURLConnection conn = getGetUrlConnection(url);

		// Get the response
		BufferedWriter bw ;
		bw = new BufferedWriter(new FileWriter(outputfile));

		BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
		String line;
		while ((line = reader.readLine()) != null) {
			bw.write(line + "\n");
		}
		bw.close(); 
		reader.close();
		cookie.storeCookie();	 
		// TODO: removing these debug messages make applyStyle failing on an unexistant file on Saada
		// as if  bw was not flushed !!!
logger.info("@@@ " + outputfile );
File f = new File(outputfile);
logger.info("@@@ " + f.exists() + " " + f.length() );

		XmlToJson.applyStyle(outputfile, outputfile.replaceAll("xml", "json")
				, styleDir + "asyncjob.xsl");
	}

	/**
	 * @param endpoint
	 * @param outputdir
	 * @param outputfile
	 * @param cookie
	 * @throws Exception
	 */
	private static void sendPostDownloadRequest(String endpoint, String outputdir, String outputfile, NodeCookie cookie) throws Exception {
		logger.debug("send download request " + endpoint );
		//		LM: Est ce normal que l'URL dans uws:result soit encodée?
		//		GM: Ouaip, c'est une demande Thomas pour UWS...sinon le document XML est déclaré invalide ! Mais en fait, cela est surtout valable
		//		s'il y a des & dans l'URL....et dans ce cas, ça ne plaît pas du tout au navigateur Web (quelqu'il soit) ! 
		URL url = new URL(URLDecoder.decode(endpoint, "ISO-8859-1"));
		cookie.addCookieToUrl(url);   
		URLConnection conn = getSimpleUrlConnection(url);
		conn.setDoOutput(true);

		// Get the response
		BufferedWriter bw ;
		bw = new BufferedWriter(new FileWriter(outputdir + File.separator + outputfile));

		BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
		String inputLine;
		NameSpaceDefinition ns = new NameSpaceDefinition();
		boolean found = false;
		while ((inputLine = reader.readLine()) != null) {
			if( ! found ) {
				Matcher m = NSPattern.matcher(inputLine);
				if (m.matches()) {
					ns.init(m.group(1)) ;
					found = true;
				}
			}
			bw.write(inputLine + "\n");
		}
		bw.close();
		reader.close();
		cookie.storeCookie();
		XmlToJson.translateResultTable(outputdir + File.separator + outputfile, outputdir + File.separator + JSON_JOB_RESULT);
	}

	/**
	 * @param endpoint
	 * @param cookie
	 * @throws Exception
	 */
	private static void sendDeleteRequest(String endpoint, NodeCookie cookie) throws Exception {
		URL url = new URL(endpoint);
		cookie.addCookieToUrl(url);   
		HttpURLConnection httpCon = (HttpURLConnection) getSimpleUrlConnection(url);
		httpCon.setDoOutput(true);
		httpCon.setRequestProperty(
				"Content-Type", "application/x-www-form-urlencoded" );
		httpCon.setRequestMethod("DELETE");
		httpCon.connect();
		cookie.storeCookie();
	}

	/**
	 * @param endpoint
	 * @param query
	 * @param uploadParam : SOMETHING LIKE: tableNmae,tableuRL
	 * @param outputfile
	 * @param cookie
	 * @param remoteAddress
	 * @return
	 * @throws Exception
	 */
	public static String runSyncJob(String endpoint, String query, String uploadParam, String outputfile, NodeCookie cookie, String remoteAddress) throws Exception {
		String runId = (remoteAddress == null )? RUNID: "TapHandle-" + remoteAddress;
		sendPostRequest(endpoint + "sync"
				, "RUNID=" + runId + "&REQUEST=doQuery&LANG=ADQL&QUERY=" + URLEncoder.encode(query, "ISO-8859-1") + "&UPLOAD=" + uploadParam
				, outputfile
				, cookie
				, false);
		logger.debug("Result reveived, start JSON translation");
		XmlToJson.translateResultTable(outputfile, outputfile.replaceAll("xml", "json"));
		return outputfile.replaceAll("xml", "json");
	}
	
	/**
	 * @param endpoint
	 * @param query
	 * @param outputfile
	 * @param cookie
	 * @param treePath
	 * @return result file path
	 * @throws Exception
	 */
	public static String runSyncJob(String endpoint, String query, String outputfile, NodeCookie cookie, String treePath) throws Exception {
		String runId = (treePath == null )? RUNID: "TapHandle-" + treePath;
		/*
		 * Services based on DACHs 	are forced to return VOTable with data in a table (not BINARY)
		 * In order to be consumable by Aladin Lite
		 */
		String format = (endpoint.indexOf("__system__") > 0 || endpoint.indexOf("heidelberg") > 0 )
				? "&FORMAT=" + URLEncoder.encode("application/x-votable+xml;serialization=tabledata" , "ISO-8859-1"): "";
		sendPostRequest(endpoint + "sync"
				, "RUNID=" + runId + "&REQUEST=doQuery" + format + "&LANG=ADQL&QUERY=" + URLEncoder.encode(query, "ISO-8859-1")
				, outputfile
				, cookie
				, false);
		logger.debug("Result retrieved, start JSON translation");
		XmlToJson.translateResultTable(outputfile, outputfile.replaceAll("xml", "json"));
		return outputfile.replaceAll("xml", "json");
	}

	/**
	 * @param endpoint
	 * @param query
	 * @param statusFileName
	 * @param cookie
	 * @param remoteAddress
	 * @return
	 * @throws Exception
	 */
	public static String createAsyncJob(String endpoint, String query, String statusFileName, NodeCookie cookie, String remoteAddress) throws Exception {
		String runId = (remoteAddress == null )? RUNID: "TapHandle-" + remoteAddress;
		/*
		 * Services based on DACHs 	are forced to return VOTable with data in a table (not BINARY)
		 * In order to be consumable by Aladin Lite
		 */
		String format = (endpoint.indexOf("__system__") > 0 || endpoint.indexOf("heidelberg") > 0 )
				? "&FORMAT=" + URLEncoder.encode("application/x-votable+xml;serialization=tabledata" , "ISO-8859-1"): "";
		sendPostRequest(endpoint + "async"
				, "RUNID=" + runId + format + "&REQUEST=doQuery&LANG=ADQL&QUERY=" + URLEncoder.encode(query, "ISO-8859-1")
				, statusFileName
				, cookie
				, true);
		return  JsonUtils.getValue (statusFileName.replaceAll("xml", "json"), "job.jobId");
	}

	/**
	 * @param endpoint
	 * @param query
	 * @param uploadParamString
	 * @param outputfile
	 * @param cookie
	 * @param remoteAddress
	 * @return
	 * @throws Exception
	 */
	public static String createAsyncJob(String endpoint, String query, String uploadParam, String outputfile, NodeCookie cookie, String remoteAddress) throws Exception {
		String runId = (remoteAddress == null )? RUNID: "TapHandle-" + remoteAddress;
		sendPostRequest(endpoint + "async"
				, "RUNID=" + runId + "&REQUEST=doQuery&LANG=ADQL&QUERY=" + URLEncoder.encode(query, "ISO-8859-1") + "&UPLOAD=" + uploadParam
				, outputfile
				, cookie
				, true);
		return  JsonUtils.getValue (outputfile.replaceAll("xml", "json"), "job.jobId");
	}

	/**
	 * @param endpoint
	 * @param jobId
	 * @param outputfile
	 * @param cookie
	 * @return
	 * @throws Exception
	 */
	public static String runAsyncJob(String endpoint, String jobId, String outputfile, NodeCookie cookie) throws Exception {
		sendPostRequest(endpoint + "async/" + jobId + "/phase"
				, "PHASE=RUN"
				, outputfile
				, cookie
				, true);
		return  JsonUtils.getValue (outputfile.replaceAll("xml", "json"), "job.phase");
	}

	/**
	 * @param endpoint
	 * @param jobId
	 * @param cookie
	 * @throws Exception
	 */
	public static void deleteAsyncJob(String endpoint, String jobId, NodeCookie cookie) throws Exception {
		sendDeleteRequest(endpoint + "async/" + jobId, cookie );
		return  ;
	}

	/**
	 * @param endpoint
	 * @param jobId
	 * @param statusFilename
	 * @param cookie
	 * @return
	 * @throws Exception
	 */
	public static String getAsyncJobPhase(String endpoint, String jobId, String statusFilename, NodeCookie cookie) throws Exception {
		sendGetRequest(endpoint + "async/" + jobId
				, statusFilename
				, cookie);
		System.out.println(statusFilename.replaceAll("xml", "json") + " " + JsonUtils.getValue (statusFilename.replaceAll("xml", "json"), "job.phase"));
		return  JsonUtils.getValue (statusFilename.replaceAll("xml", "json"), "job.phase");
	}

	/**
	 * @param endpoint
	 * @param jobId
	 * @param outputfile
	 * @param cookie
	 * @return
	 * @throws Exception
	 */
	public static String[] getAsyncJobResults(String endpoint, String jobId, String outputfile, NodeCookie cookie) throws Exception {
		if( getAsyncJobPhase(endpoint,  jobId,  outputfile, cookie).equalsIgnoreCase("COMPLETED") ) {
			return  JsonUtils.getValues (outputfile.replaceAll("xml", "json"), "href");
		}
		else {
			logger.error("No result found in status of job " + jobId );
			return new String[0];
		}
	}

	/**
	 * @param url
	 * @param outputdir
	 * @param outputfile
	 * @param cookie
	 * @throws Exception
	 */
	public static void getAsyncJobResultFile(String url, String outputdir, String outputfile, NodeCookie cookie)throws Exception {
		sendPostDownloadRequest(url, outputdir, outputfile, cookie);

	}

}



