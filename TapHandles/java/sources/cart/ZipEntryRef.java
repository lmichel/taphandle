/**
 * 
 */
package cart;

import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

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
			List<String> cds = null;
			if( ( cds = headerFields.get("Content-Disposition")) != null ) {
				String[] cd = cds.get(0).split("=");
				logger.debug("take " + cd[cd.length-1] + " as filename");
				return cd[cd.length-1];
			}
			this.name = "DefaultName";
		}
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
