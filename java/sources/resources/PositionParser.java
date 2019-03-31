package resources;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.URL;
import java.net.URLEncoder;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import tapaccess.TapException;

import cds.astro.Astrocoo;
import cds.astro.Astroframe;
import cds.astro.FK5;
import cds.astro.ICRS;

public class PositionParser extends RootClass {
	private String position;
	private int format=0 ;
	private double ra=-1., dec=-1;;
	public static final int DECIMAL=1;
	public static final int HMS=2;
	public static final int NAME=3;
	public static final int NOFORMAT=0;
	private static Pattern p = Pattern.compile(POSITION_COORDINATE);	
	private Astroframe astroframe = new ICRS();
	private String arg;

	/**
	 * @param position
	 * @throws ParsingException
	 */
	public PositionParser(String position) throws Exception {
		this.position = position.trim();
		this.arg = position.trim();
		this.setFormat();
	}

	/**
	 * @param str
	 * @return
	 * @throws ParsingException
	 */
	public static final double[] getRaDec(String str) throws Exception{
		PositionParser pp = new PositionParser(str);
		return new double[]{pp.getRa(),pp.getDec()};
	}

	/**
	 * Extract from the position string the coordinates by using Sezame to solve name
	 * or by using Astroframe to convert coordinates format in double values.
	 * Coordinates are returned n the database system
	 * @throws ParsingException 
	 */
	private void setFormat() throws Exception {
		Matcher m = p.matcher(position);
		if( position.trim().matches("[0-9]+[:\\s]([0-9]+[:\\s])?[0-9]+(\\.[0-9]+)?[,;\\s]*[+-][0-9]+[:\\s]([0-9]+[:\\s])?[0-9]+(\\.[0-9]+)?") ) {
			this.format = HMS;
			this.position = this.position.replaceAll("[,;]", "");		
			Astrocoo acoo = new Astrocoo(this.astroframe,this.position);
			this.ra = acoo.getLon();
			this.dec = acoo.getLat();
		}
		/*
		 * Decimal case must be parsed because Astroframe requires a signed declination
		 * and exponential notation is not supported
		 */
		else if( m.find() && m.groupCount() == 2 ) {
			DecimalFormat deux = new DecimalFormat("0.000000");
			deux.setDecimalFormatSymbols(new DecimalFormatSymbols(Locale.ENGLISH));
			/*
			 * Extract both coordinates from the position string and format them
			 * into a format recognized by Astroframe
			 */
			this.ra = Double.parseDouble(m.group(1).trim().replace('E', 'e'));
			this.dec = Double.parseDouble(m.group(2).trim().replaceAll("[,:;]", " ")
					.replaceAll("\\-\\+", " ")
					.replace('E', 'e')
			);
			this.format = DECIMAL;
			if( this.dec > 0 ) {
				this.position  = deux.format(ra) + " +" +  deux.format(this.dec);
			} else {
				this.position  = deux.format(ra) + " " + deux.format(this.dec);
			}
			//System.out.println("==> " + this.position);
		}
		else {
			this.format = NAME;        	
			String ResolveName = this.resolvesName();
			if (ResolveName != null ){
				this.position = ResolveName.trim();
				/*
				 * Sezam returns FK5/J2000 coordinates, but input coordinates can be expressed 
				 * in another system. The following conversion assures thet the returned position will
				 * be expressed in the right system even if it is a name to solve.
				 */
				if( this.astroframe != null ) {
					Astrocoo acoo = new Astrocoo(this.astroframe,this.position);
					double converted_coord[] = Coord.convert(new FK5(), new double[]{acoo.getLon(), acoo.getLat()}, this.astroframe);
					this.ra = converted_coord[0];
					this.dec = converted_coord[1];
					this.position = new Astrocoo(this.astroframe, this.ra, this.dec).toString("s:");
				}
			} else {
				this.format = NOFORMAT;     
				String msg = "<" + this.position + "> Can not be resolved";
				this.position = "";
				throw new TapException(msg);
			}
		}

		if( this.format != NOFORMAT  ){
			/*
			 * Convert the result in the Database coord system
			 */
			if( this.astroframe != null ) {
				//double converted_coord[] = Coord.convert(this.astroframe, new double[]{this.ra, this.dec}, Database.getAstroframe());
				//this.ra=converted_coord[0];
				//this.dec=converted_coord[1];
			}
		} else {
			throw new TapException("'" + this.arg + "' Position format not recognized");
		}		
	}

	/**
	 * @return
	 */
	public int getFormat() {
		return this.format;
	}


	/**
	 * @return
	 */
	public  String resolvesName() {
		return PositionParser.resolvesName(this.position);
	}

	/**
	 * @param name
	 * @return
	 */
	public static String resolvesName(String name) {
		try {
			String target = URLEncoder.encode(name, "iso-8859-1");
			URL cgi_sesame = new URL("http://cdsweb.u-strasbg.fr/cgi-bin/nph-sesame/-ox?" + target);
			BufferedReader br = new BufferedReader(new InputStreamReader(cgi_sesame.openStream()));
			String inputLine;
			String xml = "";
			while ((inputLine = br.readLine()) != null) {
				xml += inputLine.replaceAll("JPOS", "jpos");
			}
			br.close();

			if (xml.indexOf("<jpos>")>0) {
				return xml.substring(xml.indexOf("<jpos>")+6, xml.indexOf("</jpos>"));
			} else {
				return  null;
			}
		}
		catch (Exception e ) {
			logger.error("Service 'http://cdsweb.u-strasbg.fr/cgi-bin/nph-sesame/' not available");;
			return null;
		}
	}


	/**
	 * @return Returns the dec.
	 */
	public double getDec() {
		return dec;
	}

	/**
	 * @return Returns the ra.
	 */
	public double getRa() {
		return ra;
	}

	/**
	 * @return Returns the position.
	 */
	public String getPosition() {
		return position;
	}

}
