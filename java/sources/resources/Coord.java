package resources;


import cds.astro.Astrocoo;
import cds.astro.Astroframe;
import cds.astro.Coo;
import cds.astro.Ecliptic;
import cds.astro.FK4;
import cds.astro.FK5;
import cds.astro.Galactic;
import cds.astro.ICRS;
import tapaccess.TapException;

public class Coord extends RootClass {
	/** Ascension droite (J2000 en degres) */
	protected double al = Double.NaN;
	/** Declinaison (J2000 en degres) */
	protected double del = Double.NaN;
	/** abcisse courante dans une projection (en reel) */
	protected double x = Double.NaN;
	protected double dx = Double.NaN;
	/** ordonnee courante dans une projection (en reel)*/
	protected double y = Double.NaN;
	protected double dy = Double.NaN;
	/** 1ere coordonnee standard */
	protected double xstand = Double.NaN;
	/** 2eme coordonnee standard */
	protected double ystand = Double.NaN;
	
	/** Creation */
	public Coord() {}
	public Coord(double ra,double dej) { al=ra; del=dej;}
	
	/**
	 * @param sys
	 * @param equi
	 * @return
	 * @throws FatalException 
	 */
	public static Astroframe getAstroframe(String sys, String equi) throws Exception {
		if( sys.equalsIgnoreCase("FK4") ) {
			if( equi == null ) {
				logger.info("No equinox takes, (B1950.0,Ep=J2000.0) by default");
				return new FK4();				
			}
			else {
				return new FK4(Double.parseDouble(equi.replaceAll("J", "")));
			}
		}
		else if( sys.equalsIgnoreCase("FK5") ) {
			if( equi == null ) {
				logger.info("No equinox takes, J2000 by default");
				return new FK5();				
			}
			else {
				return new FK5(Double.parseDouble(equi.replaceAll("J", "")));
			}
		}
		else if( sys.equalsIgnoreCase("ICRS") ) {
			return  new ICRS();
		}
		else if( sys.equalsIgnoreCase("galactic") ) {
			return new Galactic();
		}
		else if( sys.equalsIgnoreCase("ecliptic") ) {
			return new Ecliptic();
		}
		else {
			throw new TapException( "Unsupported coordinate system <" + sys + ">");
		} 
	}
	
	/**
	 * @param astro_org
	 * @param coord_org
	 * @param astro_new
	 * @return
	 */
	public static double[] convert(Astroframe astro_org, double[] coord_org, Astroframe astro_new) {
		Astrocoo acoo= new Astrocoo(astro_org, coord_org[0], coord_org[1]) ;
		acoo.convertTo(astro_new);
		return (new double[]{acoo.getLon(), acoo.getLat()});	  
	}
	
	public double getPOS_RA()
	{
		return this.al;
	}
	
	public double getPOS_DEC()
	{
		return this.del;
	}
	
	public double getX()
	{
		return this.x;
	}
	public double getY()
	{
		return this.y;
	}
		
	public void setXY(double x, double y) {
		this.x = x;
		this.y = y;
	}
	
	/** Affichage dans la bonne unite.
	 * Retourne un angle en degres sous forme de chaine dans la bonne unite
	 * @param x l'angle
	 * @return l'angle dans une unite coherente + l'unite utilisee
	 */
	protected static String getUnit(double x) {
		String s=null;
		boolean flagCeil=true;
		if( x>=1.0 ) s="deg";
		if( x<1.0 ) { s="'"; x=x*60.0; }
		if( x<1.0 ) { s="\""; x=x*60.0; flagCeil=false; }
		if( flagCeil ) x=Math.ceil(x*100.0)/100.0;
		else x=Math.ceil(x*10000.0)/10000.0;
		s=x+s;
		
		return s;
	}
	
	/** Affichage dans la bonne unite (H:M:S).
	 * Retourne un angle en degres sous forme de chaine dans la bonne unite
	 * @param x l'angle
	 * @return l'angle dans une unite coherente + l'unite utilisee
	 */
	protected static String getUnitTime(double x) {
		String s=null;
		if( x>=1.0 ) s="h";
		if( x<1.0 ) { s="min"; x=x*60.0; }
		if( x<1.0 ) { s="s"; x=x*60.0; }
		x=((int)(x*100.0))/100.0;
		s=x+" "+s;
		
		return s;
	}
	
	/** Calcul d'un distance entre deux points reperes par leurs coord
	 * @param c1 premier point
	 * @param c2 deuxieme point
	 * @return La distance angulaire en degres
	 protected static double getDist1(Coord c1, Coord c2) {
	 double dra = c2.al-c1.al;
	 double dde = Math.abs(c1.del-c2.del);
	 dra = Math.abs(dra);
	 if( dra>180 ) dra-=360;
	 double drac = dra*Astropos.cosd(c1.del);
	 return Math.sqrt(drac*drac+dde*dde);
	 }
	 */
	
	protected static double getDist(Coord c1, Coord c2) {
		return Coo.distance(c1.al,c1.del,c2.al,c2.del);
	}
	
	/* (non-Javadoc)
	 * @see java.lang.Object#toString()
	 */
	public String toString() {
		return "x=" + this.x + " y=" + this.y + " ra=" + this.al + " dec=" + this.del ; 
	}
}
