package translator;

import javax.xml.transform.ErrorListener;
import javax.xml.transform.TransformerException;

import resources.RootClass;

public class EcouteurDErreurs extends RootClass implements ErrorListener{
	public void warning(TransformerException exception)
	throws TransformerException{
		printException(exception);      
	}
	public void error(TransformerException exception)
	throws TransformerException{
		printException(exception);    
	}
	public void fatalError(TransformerException exception)
	throws TransformerException{
		printException(exception);
		throw exception;
	}
	private void printException(TransformerException exception){
		String message = exception.getMessageAndLocation() ;
		logger.info("********** " + message);
	}
}