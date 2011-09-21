/**
 * 
 */
package translator;

import java.util.regex.Matcher;

import resources.RootClass;

/**
 * Handle a name space definition extracted from some XML header
 * The namespace declaration looks like xmlns:nsName=http://....
 * The declaration is stored with nsName extracted with a capturing group
 * @author laurent
 * @version $Id$
 */
public class NameSpaceDefinition extends RootClass{
	
	/**
	 * Name of he name space
	 */
	private String nsName;
	/**
	 * Global name space declaration
	 */
	private String nsDeclaration;
	

	/**
	 * Extract the name of the name space from declaration
	 * @param declaration
	 */
	public void init(String declaration) {
		System.out.println("@@@@@ DECLARATION : " + declaration);
		nsDeclaration = declaration;
		Matcher m = NSNamePattern.matcher(nsDeclaration);
		if (m.matches()) {
			nsName =  m.group(1) ;
			System.out.println("@@@@@ NAME : " + nsName);
			logger.debug("Found NS " + nsName);
		}
	}

	/**
	 * @return Returns the name of the name space
	 */
	public String getNsName() {
		return nsName;
	}

	/**
	 * @return Returns the declaration
	 */
	public String getNsDeclaration() {
		return nsDeclaration;
	}
	
	/* (non-Javadoc)
	 * @see java.lang.Object#toString()
	 */
	public String toString() {
		return this.nsName + ": " + this.nsDeclaration;
	}

}
