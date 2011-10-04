/**
 * 
 */
package cart;

import java.util.Date;
import java.util.List;
import java.util.Map;

import resources.RootClass;

/**
 * @author laurent
 * @version $Id$
 */
public class ZipEntryRef extends RootClass {
	public static final int JOB = 0;
	public static final int URL = 1;
	private int type;
	private String name;
	private String uri;
	
	public ZipEntryRef(int type, String name, String uri) {
		super();
		this.type = type;
		this.name = name;
		this.uri  = uri;
	}

	public int getType() {
		return type;
	}

	public String getName() {
		return name;
	}

	public String getUri() {
		return uri;
	}
	
	protected void setUri(String uri) {
		this.uri = uri;
	}

	public String toString() {
		return this.type + " " + this.name + " " + this.uri;
	}
	
	/**
	 * @param headerFields
	 * @return
	 */
	public String getFilenameFromHttpHeader(Map<String, List<String>>  headerFields) {
		if( this.name == null || this.name.length() == 0 || this.name.toLowerCase().equals("preserve")) {
			/*
			 * Try first to get the filename from the Content-Disposition header fields
			 */
			List<String> cds = null;
			if( ( cds = headerFields.get("Content-Disposition")) != null ) {
				String[] cd = cds.get(0).split("=");
				logger.debug("take " + cd[cd.length-1] + " as filename");
				return cd[cd.length-1].replaceAll("\"", "");
			}
			/*
			 * Otherwise, try to infer the filename from tehe URI and the ContentType
			 */
			int pos = -1;
			if( (pos = this.uri.lastIndexOf("=")) != -1 ){
				String fn = this.uri.substring(pos + 1);
				logger.debug("take " +fn + " as filename");
				return fn;
			}
			/*
			 * Other take some dummy name
			 */
			this.name = "DefaultName" + (new Date()).getTime();
		}
		/*
		 * Then add a suffix
		 */
		List<String> cts = null;
		String suffix = ".nosuffix";
		if( ( cts = headerFields.get("Content-Type")) != null ) {
			String[] cd = cts.get(0).split("/");
			logger.debug("take " + cd[cd.length-1] + " as suffix");
			suffix = "." + cd[cd.length-1];
		}
		List<String> ccs = null;
		String comp = "";
		if( ( ccs = headerFields.get("Content-Encoding")) != null ) {
			comp = "." +  ccs.get(0);
			logger.debug("take " + comp + " as encoding");
		}
		return this.name + suffix + comp;
	}

}
