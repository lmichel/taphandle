package tapaccess;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
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

	/**
	 * Set global timeout for URLConnection conn
	 * @param conn
	 * @throws IOException 
	 */
	public static final URLConnection getUrlConnection(URL url) throws IOException{
		URLConnection conn = url.openConnection();
		conn.setConnectTimeout(SOCKET_CONNECT_TIMEOUT);		
		conn.setReadTimeout(SOCKET_READ_TIMEOUT);
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
	public static void sendPostRequest(String endpoint, String data, String outputfile, NodeCookie cookie, boolean translate) throws Exception {

		logger.debug("send POST request " + endpoint + "(" + data + ") " + cookie);
		// Send the request
		URL url = new URL(endpoint);  
		cookie.addCookieToUrl(url);   
		URLConnection conn = getUrlConnection(url);
		((HttpURLConnection)conn).setRequestMethod("POST");		
		conn.setDoOutput(true);
		if( data != null ) {
			OutputStreamWriter writer = new OutputStreamWriter(conn.getOutputStream());
			//write parameters
			writer.write(data);
			writer.flush();
			writer.close();
		}

		// Get the response
		BufferedWriter bw ;
		bw = new BufferedWriter(new FileWriter(outputfile));
		InputStream is = null;
		try {
			is = conn.getInputStream();
			BufferedReader reader = new BufferedReader(new InputStreamReader(is));
			String line;
			while ((line = reader.readLine()) != null) {
				bw.write(line + "\n");
			}
			bw.close();
			reader.close();
			cookie.storeCookie();	   
			if( translate){
				XmlToJson.applyStyle(outputfile, outputfile.replaceAll("xml", "json")
						, StyleDir + "asyncjob.xsl");
			}

		} catch(SocketTimeoutException e){
			logger.warn("Socket on " + endpoint + " closed on client timeout (" + (RootClass.SOCKET_READ_TIMEOUT/1000) + "\")");
			((HttpURLConnection)conn).disconnect();
			throw new SocketTimeoutException("Socket Closed on client timeout (" + (RootClass.SOCKET_READ_TIMEOUT/1000) + "\")");
		}
		/*
		 * Put the error page in the result file
		 *
		if( ((HttpURLConnection)conn).getResponseCode() >= 500 ) {
			logger.error(endpoint + "return error " +  ((HttpURLConnection)conn).getResponseCode());
			is =((HttpURLConnection)conn).getErrorStream();
			BufferedReader reader = new BufferedReader(new InputStreamReader(is));
			String line;
			while ((line = reader.readLine()) != null) {
				bw.write(line + "\n");
			}
			return ;
		} */
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

		URLConnection conn = getUrlConnection(url);
		((HttpURLConnection)conn).setRequestMethod("GET");		

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

		XmlToJson.applyStyle(outputfile, outputfile.replaceAll("xml", "json")
				, StyleDir + "asyncjob.xsl");

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
		URLConnection conn = getUrlConnection(url);
		//((HttpURLConnection)conn).setRequestMethod("POST");		
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
		//XmlToJson.translateVOTable(outputdir, "result", "result", ns);
	}

	/**
	 * @param endpoint
	 * @param cookie
	 * @throws Exception
	 */
	private static void sendDeleteRequest(String endpoint, NodeCookie cookie) throws Exception {
		URL url = new URL(endpoint);
		cookie.addCookieToUrl(url);   
		HttpURLConnection httpCon = (HttpURLConnection) getUrlConnection(url);
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
	 * @param remoteAddress
	 * @return result file path
	 * @throws Exception
	 */
	public static String runSyncJob(String endpoint, String query, String outputfile, NodeCookie cookie, String remoteAddress) throws Exception {
		String runId = (remoteAddress == null )? RUNID: "TapHandle-" + remoteAddress;
		sendPostRequest(endpoint + "sync"
				, "RUNID=" + runId + "&REQUEST=doQuery&LANG=ADQL&QUERY=" + URLEncoder.encode(query, "ISO-8859-1")
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
	 * @param outputfile
	 * @param cookie
	 * @param remoteAddress
	 * @return
	 * @throws Exception
	 */
	public static String createAsyncJob(String endpoint, String query, String outputfile, NodeCookie cookie, String remoteAddress) throws Exception {
		String runId = (remoteAddress == null )? RUNID: "TapHandle-" + remoteAddress;
		sendPostRequest(endpoint + "async"
				, "RUNID=" + runId + "&REQUEST=doQuery&LANG=ADQL&QUERY=" + URLEncoder.encode(query, "ISO-8859-1")
				, outputfile
				, cookie
				, true);
		return  JsonUtils.getValue (outputfile.replaceAll("xml", "json"), "job.jobId");
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
	 * @param outputfile
	 * @param cookie
	 * @return
	 * @throws Exception
	 */
	public static String getAsyncJobPhase(String endpoint, String jobId, String outputfile, NodeCookie cookie) throws Exception {
		sendGetRequest(endpoint + "async/" + jobId
				, outputfile
				, cookie);
		return  JsonUtils.getValue (outputfile.replaceAll("xml", "json"), "job.phase");
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



