package test;

import java.io.IOException;

import resources.RootClass;
import translator.GoodiesIngestor;


public class GoodiesTester extends RootClass {

	/**
	 * @param args
	 * @throws IOException 
	 */
	public static void main(String[] args) throws IOException {
		GoodiesIngestor gi = new GoodiesIngestor("/home/michel/Desktop", "list.pos", 3);
		gi.ingestUserList();
	}

}
