/**
 * 
 */
package metabase;


/**
 * Store an unquoted table name with a flag specifying whether quotes must be used to avoid syntax issues with query langages for instance
 * @author michel
 *
 */
public class DataTreePathElement {
	/**
	 * Unquoted name of the table
	 */
	private String name;
	/**
	 * Flag advicing to to use quotes or not
	 */
	private boolean mustBeQuoted = false;
	/**
	 * Filter for name not needing quotes
	 */
	private static final String STANDARD_NAME = "[a-zA-Z][a-zA-Z0-9_]*";

	/**
	 * @param name
	 */
	DataTreePathElement(String name){
		if( name.indexOf("\"") != -1 || !name.matches(STANDARD_NAME)){
			this.name = name.replaceAll("\""	, "");
			this.mustBeQuoted = true;
		} else {
			this.name = name;
			this.mustBeQuoted = false;
		}
	}
	
	/**
	 * @return
	 */
	public String getName() {
		return this.name;
	}
	
	/**
	 * @return
	 */
	public boolean mustBeQuoted() {
		return this.mustBeQuoted;
	}

	/* (non-Javadoc)
	 * @see java.lang.Object#toString()
	 */
	public String toString() {
		return this.name + " " + ((this.mustBeQuoted)?"QUOTED": "NOTQUOTED");
	}
}
