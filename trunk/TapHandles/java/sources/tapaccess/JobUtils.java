/**
 * 
 */
package tapaccess;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Date;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

import resources.RootClass;
import translator.JsonUtils;


/**
 * A few static method helping to handle jobs
 * @author michel
 *
 */
public class JobUtils extends RootClass {
	
	/**
	 * Build the directory where all data related to the job will be stored
	 * @param nodeKey        : key of the node running the query
	 * @param finalDir       : Id of the job
	 * @param statusFileName : Path of the first status file. This file is written before the job dir is created
	 *                         that is why it is not in the job dir.
	 * @param treepath       : Treepath such as given by the clieny
	 * @return
	 * @throws Exception
	 */
	public static final String setupJobDir(String nodeKey, String finalDir, String statusFileName, String treepath) throws Exception{
		validWorkingDirectory(finalDir);
		(new File(statusFileName)).renameTo(new File(finalDir +  "status.xml"));
		(new File(statusFileName.replaceAll("xml", "json"))).renameTo(new File(finalDir +  "status.json"));
		logger.debug("Create file treepath.json");
		FileWriter fw = new FileWriter(finalDir + "treepath.json");
		fw.write(JsonUtils.convertTreeNode(treepath));
		fw.close();
		return finalDir;
	}
	
	@SuppressWarnings("unchecked")
	private static void writeStatusCore(JSONObject job, String finalDir, String jobId, Date startTime, String query, String phase) throws UnknownHostException{
		Date endTime = new Date();
		job.put("jobId", jobId);
		job.put("runId", RUNID);
		job.put("ownerId", InetAddress.getLocalHost().getHostAddress());
		job.put("phase", phase);
		
		JSONObject tempo = new JSONObject();
		tempo.put("nil", true);
		job.put("quote", tempo);
		job.put("startTime", startTime.toString());
		job.put("endTime", endTime.toString());
		job.put("executionDuration", (endTime.getTime() - startTime.getTime())/1000);
		job.put("destruction", endTime.toString());
		
		JSONArray parameters = new JSONArray();
		tempo = new JSONObject(); tempo.put("id", "maxRec");tempo.put("$", MAX_ROWS);
		parameters.add(tempo);
		tempo = new JSONObject(); tempo.put("id", "progression");tempo.put("$", "FINISHED");
		parameters.add(tempo);
		tempo = new JSONObject(); tempo.put("id", "query");tempo.put("$", query);
		parameters.add(tempo);
		tempo = new JSONObject(); tempo.put("id", "request");tempo.put("$", "doQuery");
		parameters.add(tempo);
		tempo = new JSONObject(); tempo.put("id", "format");tempo.put("$", "votable");
		parameters.add(tempo);
		tempo = new JSONObject(); tempo.put("id", "lang");tempo.put("$", "ADQL");
		parameters.add(tempo);
		tempo = new JSONObject(); tempo.put("id", "version");tempo.put("$", "1");
		parameters.add(tempo);
		
		tempo = new JSONObject(); tempo.put("parameter", parameters);
		job.put("parameters", tempo);
				
	}
	
	/**
	 * Writes a status.json file with the status of a sync job as it was an async one
	 * @throws IOException 
	 */
	@SuppressWarnings("unchecked")
	public static void writeSyncJobStatus(String nodeKey, String finalDir, String jobId, Date startTime, String query) throws IOException{
		JSONObject job = new JSONObject();
		writeStatusCore(job,  finalDir,  jobId,  startTime,  query, "COMPLETED");
		/*
		 * Job result
		 */
		JSONObject tempo = new JSONObject();
		tempo.put("id", "result");
		tempo.put("type", "simple");
		tempo.put("href", "/jobresult?node=" + nodeKey + "&jobid=" + jobId + "&format=json");
		tempo.put("mime", "text/xml");
		tempo.put("size", (new File(finalDir + "result.json")).length());
		job.put("results", tempo);
		/*
		 * Job error
		 */		
		tempo = new JSONObject();
		tempo.put("nil", true);
		job.put("errorSummary", tempo);
		/*
		 * pack
		 */
		JSONObject retour = new JSONObject();
		retour.put("job", job);
		/*
		 * and store
		 */
		FileWriter fw = new FileWriter(finalDir + "status.json");
		retour.writeJSONString(fw);
		fw.close();
		fw = new FileWriter(finalDir + "phase.json");
		retour.writeJSONString(fw);
		fw.close();
	}

	/**
	 * Writes a status.json file with the status of a sync job as it was an async one
	 * @throws IOException 
	 */
	@SuppressWarnings("unchecked")
	public static void writeSyncJobError(String nodeKey, String finalDir, String jobId, Date startTime, String query, String cause) throws IOException{
		JSONObject job = new JSONObject();
		writeStatusCore(job,  finalDir,  jobId,  startTime,  query, "ERROR");
		/*
		 * Job result
		 */
		job.put("results", null);
		/*
		 * Job error
		 */		
		JSONObject tempo = new JSONObject();
		tempo.put("hasDetail", false);
		tempo.put("type", "fatal");
		tempo.put("hasDetail", false);
		tempo.put("message", cause);
		job.put("errorSummary", tempo);
//        "errorSummary": {
//        "hasDetail": false,
//        "type": "fatal",
//        "message": "Could not parse your query: Expected end of text (at char 40), (line:2, col:24)"
//    }
		/*
		 * pack
		 */
		JSONObject retour = new JSONObject();
		retour.put("job", job);
		/*
		 * and store
		 */
		FileWriter fw = new FileWriter(finalDir + "status.json");
		retour.writeJSONString(fw);
		fw.close();
		fw = new FileWriter(finalDir + "phase.json");
		retour.writeJSONString(fw);
		fw.close();
	}
	
//	{
//	    "job": {
//	        "schemaLocation": "http://www.ivoa.net/xml/UWS/v1.0 http://vo.ari.uni-heidelberg.de/docs/schemata/uws-1.0.xsd",
//	        "jobId": "poFZIF",
//	        "ownerId": {
//	            "nil": true
//	        },
//	        "phase": "ERROR",
//	        "startTime": "2013-01-24T10:09:18Z",
//	        "endTime": "2013-01-24T10:09:18Z",
//	        "executionDuration": 3600,
//	        "destruction": "2013-01-26T10:09:17Z",
//	        "parameters": {
//	            "parameter": [
//	                {
//	                    "id": "lang",
//	                    "$": "ADQL"
//	                },
//	                {
//	                    "id": "query",
//	                    "$": "SELECT TOP 10 * \n FROM usnob.platecorrs dsfdsfdsfsdf"
//	                },
//	                {
//	                    "id": "request",
//	                    "$": "doQuery"
//	                },
//	                {
//	                    "id": "runid",
//	                    "$": "TapHandle-130.79.129.84"
//	                }
//	            ]
//	        },
//	        "results": null,
//	        "errorSummary": {
//	            "hasDetail": false,
//	            "type": "fatal",
//	            "message": "Could not parse your query: Expected end of text (at char 40), (line:2, col:24)"
//	        }
//	    }
//	}
}
