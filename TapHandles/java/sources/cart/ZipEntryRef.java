/**
 * 
 */
package cart;

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
	

}
