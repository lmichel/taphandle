package tapaccess;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.CookieHandler;
import java.net.CookieManager;
import java.net.CookiePolicy;
import java.net.CookieStore;
import java.net.HttpCookie;
import java.net.HttpURLConnection;
import java.net.URISyntaxException;
import java.net.URL;
import java.net.URLConnection;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.regex.Matcher;

import resources.RootClass;
import session.NodeCookie;
import translator.JsonUtils;
import translator.NameSpaceDefinition;
import translator.XmlToJson;


/**
 * @author laurent
 * @version $Id
 */
public class TapAccess  extends RootClass {
	private final static String  RUNID = "test-client-lm";


	public static void sendPostRequest(String endpoint, String data, String outputfile, NodeCookie cookie) throws Exception {
		System.out.println("@@@@@@@@@@@@  sendPostRequest " + cookie.getCookie());

        logger.debug("send request " + endpoint + "(" + data + ")");
		// Send the request
		URL url = new URL(endpoint);  
		cookie.addCookieToUrl(url);   

		URLConnection conn = url.openConnection();
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

	private static void sendPostDownloadRequest(String endpoint, String outputdir, String outputfile, NodeCookie cookie) throws Exception {
		logger.debug("send download request " + endpoint );
		System.out.println("@@@@@@@@@@@@  sendPostDownloadRequest " + cookie.getCookie());
		//		LM: Est ce normal que l'URL dans uws:result soit encodée?
		//		GM: Ouaip, c'est une demande Thomas pour UWS...sinon le document XML est déclaré invalide ! Mais en fait, cela est surtout valable
		//		s'il y a des & dans l'URL....et dans ce cas, ça ne plaît pas du tout au navigateur Web (quelqu'il soit) ! 
		URL url = new URL(URLDecoder.decode(endpoint, "ISO-8859-1"));
		cookie.addCookieToUrl(url);   
		URLConnection conn = url.openConnection();
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
		XmlToJson.translateResultTable(outputdir + File.separator + outputfile, outputdir + File.separator + "result.json");
		//XmlToJson.translateVOTable(outputdir, "result", "result", ns);
	}

	private static void sendDeleteRequest(String endpoint, NodeCookie cookie) throws Exception {
		URL url = new URL(endpoint);
		cookie.addCookieToUrl(url);   
		HttpURLConnection httpCon = (HttpURLConnection) url.openConnection();
		httpCon.setDoOutput(true);
		httpCon.setRequestProperty(
				"Content-Type", "application/x-www-form-urlencoded" );
		httpCon.setRequestMethod("DELETE");
		httpCon.connect();
		cookie.storeCookie();
	}



	
	public static String createAsyncJob(String endpoint, String query, String outputfile, NodeCookie cookie) throws Exception {
		sendPostRequest(endpoint + "async"
				,  "RUNID=" + RUNID + "&REQUEST=doQuery&LANG=ADQL&QUERY=" + URLEncoder.encode(query, "ISO-8859-1")
				, outputfile
				, cookie);

		return  JsonUtils.getValue (outputfile.replaceAll("xml", "json"), "job.jobId");
	}

	public static String runAsyncJob(String endpoint, String jobId, String outputfile, NodeCookie cookie) throws Exception {
		sendPostRequest(endpoint + "async/" + jobId + "/phase"
				, "PHASE=RUN"
				, outputfile
				, cookie);

		return  JsonUtils.getValue (outputfile.replaceAll("xml", "json"), "job.phase");
	}

	public static void deleteAsyncJob(String endpoint, String jobId, NodeCookie cookie) throws Exception {
		sendDeleteRequest(endpoint + "async/" + jobId, cookie );
		return  ;
	}

	public static String getAsyncJobPhase(String endpoint, String jobId, String outputfile, NodeCookie cookie) throws Exception {
		sendPostRequest(endpoint + "async/" + jobId
				, null
				, outputfile
				, cookie);
		return  JsonUtils.getValue (outputfile.replaceAll("xml", "json"), "job.phase");
	}

	public static String[] getAsyncJobResults(String endpoint, String jobId, String outputfile, NodeCookie cookie) throws Exception {
		if( getAsyncJobPhase(endpoint,  jobId,  outputfile, cookie).equalsIgnoreCase("COMPLETED") ) {
			return  JsonUtils.getValues (outputfile.replaceAll("xml", "json"), "href");
		}
		else {
			logger.error("No result found in status of job " + jobId );
			return null;
		}
	}

	public static void getAsyncJobResultFile(String url, String outputdir, String outputfile, NodeCookie cookie)throws Exception {
		sendPostDownloadRequest(url, outputdir, outputfile, cookie);

	}

}



