package test;

import java.lang.reflect.Array;

public class TestType {

	/**
	 * @param args
	 */
	public static void main(String[] args) {
		Object obj = new Object[3];
		int[] is = new int[3];
		Object o = is;
		if(obj.getClass().isArray()) {
			Object[] ot = (Object[])obj;
			String v = "";
			for( Object cell: ot) {
				v += cell + " ";
			}
			System.out.println(v);
		}
		if(o.getClass().isArray()) {
			String v = "";
			for( int i=0 ; i<Array.getLength(o) ; i++ ){
				v += Array.get(o, i) + " ";
			}
			System.out.println(v);
		}
	}

}
