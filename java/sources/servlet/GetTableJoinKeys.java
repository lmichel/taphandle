package servlet;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;

import javax.servlet.Servlet;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import metabase.DataTreePath;
import resources.RootClass;

/**
 * @author michel
 * @version $Id
 */
public class GetTableJoinKeys extends RootServlet implements Servlet {
	private static final long serialVersionUID = 1L;

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		printAccess(request, true);
		response.setContentType("application/json; charset=UTF-8");
		String schema = this.getParameter(request, "schema");
		if( schema == null  ) {
			schema = "";
		}
		String node = this.getParameter(request, "node");
		if( node == null ){
			node = this.getParameter(request, "nodekey");
		}
		String table = this.getParameter(request, "table");
		if( node == null || node.length() ==  0 ) {
			reportJsonError(request, response, "gettableatt: no node specified");
			return;
		}
		if( table == null || table.length() ==  0 ) {
			reportJsonError(request, response, "gettableatt: no table specified");
			return;
		}
		try {
			/*
			 * join key files are not prefixed with the schema (see XmlToJson.translateJoinKeysTable)
			 * Meanwhile this is fixed, we try both filename versions
			 */
			String filename = "/" + RootClass.WEB_NODEBASE_DIR + "/" + node + "/" + (new DataTreePath(schema, table, "")).getEncodedFileName() + "_joinkeys.json";
			if( (new File(filename)).exists() == false ) {
				filename = "/" + RootClass.WEB_NODEBASE_DIR + "/" + node + "/" + (new DataTreePath(table, "")).getEncodedFileName() + "_joinkeys.json";

			}
			dumpJsonFile(filename, response);

		} catch (FileNotFoundException e) {
			return;
		} catch (Exception e) {
			reportJsonError(request, response, e);
			return;
		}
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doGet(request, response);
	}

}
