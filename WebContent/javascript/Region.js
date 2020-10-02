/**
 * Class modeling an SCT region in order to be display on Aladin via samp.
 * It must work with degraded STC syntax in order to get some chance to have something visible.
 * The input is supposed to be a blank seprated list of items. The 2 first items are igored and replaced 
 * with Polygon ICRS .
 * All other items must be numeric. they must be an even number.
 */
var decimaleRegexp = new RegExp("^[+-]?[0-9]*([.][0-9]*)?([eE][+-]?[0-9]+)?$","m"); 

function Region(STCRegion) {
	/**
	 * input region: cab be updated after parsing
	 */
    this.STCRegion = STCRegion;
    /**
     * Vertex Array point format {ra: x, dec: y}
     */
	this.points = [];
	/**
	 * Polygon center coordinates
	 * format {ra: x, dec: y}
	 */
    this.center = {};
	/**
	 * Polygon size. format: {ra: x, dec: y}
	 */
    this.size = {};
    /**
     * Parsing is achieved at object creation time
     */
	this.parse();
	
}
Region.prototype = {
		/**
		 * Region parsing: compute points, center and size
		 */
		parse : function(){
            var elements = this.STCRegion.split(" ");
            /*
             * Skip all the first non numeric elements
             */
            for( var i=0 ; i<elements.length ; i++){
                if( decimaleRegexp.test(elements[i]) ) break;
            }
            /*
             * Only the 2 first elements can be non numeric
             */
            if( i != 2 ){
    			Modalinfo.error("Region not valid: " + this.STCRegion);
    			return;
            } 
            /*
             * Waiting on better days: the region type is set as Polygon
             */
            if( elements[0] != 'Polygon' ) {
                 elements[0] =  'Polygon';              
            }
            /*
             * Waiting on better days: the region frame is set as ICRS
             */
            if( elements[1] != 'ICRS' ) {
                 elements[1] =  'ICRS';              
            }
            elements = elements.slice(i);
            /*
             * Reconstruct the ST string with the forced parameters. This string will feed Aladin
             */
            this.STCRegion = 'Polygon ICRS ' +  elements.join(" ");
            /*
             * Number of coordinates must be even (cannot guess the missing one
             */
            if( (elements.length % 2) === 0 ){
                for( var j=0 ; j<(elements.length/2) ; j++){
                    this.points.push({ra: parseFloat(elements[2*j]), dec: parseFloat(elements[(2*j) + 1])});
                }
                this.searchCenter();
             } else {
     			Modalinfo.error("Region not valid: " + this.STCRegion);           	 
             }
		},
		/**
		 * Get the polygon center
		 */
		searchCenter: function() {
			var Height = this.computeHeight();		
			var Width = this.computeWidth();
			this.size = {ra: Height.height, dec: Width.width};
			if( Height.largeur === 0 || Width.width === 0 ) {
				return;
			}
			this.center.ra = ((Height.ramax +  Height.ramin)/2);
			this.center.dec =  ((Width.decmax + Width.decmin)/2);
			return this.center.ra+" "+this.center.dec;
		},
		/*
		 * The code below is taken from JSResource RegionEditor
		 */
		/**
		 * Get the polygon height
		 */
        computeHeight: function () 	{		
			var Ramax = null, Ramin = null;
			var finaltemp;
			var largeur;

			for(var i in this.points)	{
                temp = this.points[i].ra;        	
				if(Ramax === null)	{
					Ramax = temp;
				} else if(temp >= Ramax) {
					Ramax = temp;
				}
				if(Ramin === null) {
					Ramin = temp;
				} else if(temp <= Ramin ) {
					Ramin = temp;
				}
			}
			largeur = (Ramax -Ramin);
			if(largeur > 180) {
				largeur = 360 - largeur;
			}
			return { ramax: Ramax, ramin: Ramin , height: largeur  };
		},
		/**
		 * Get the polygon width
		 */
       computeWidth: function () {		
			var Decmax = null, Decmin = null;	
			var temp;
			var width;

			for(var i in this.points) {
				temp = (this.points[i].dec);        	
				if(Decmax === null) {
					Decmax = temp;
				} else if(temp >= Decmax) {
					Decmax = temp;
				}

				if(Decmin === null) {
					Decmin = temp;
				} else if(temp <= Decmin ) {
					Decmin = temp;
				}
			}
			width = (Decmax - Decmin);
			if(width > 180) {
				width = 360 - width;
			}
			return { decmax: Decmax, decmin: Decmin , width: width  };
		},
		/**
		 * Returns an Aladin script displaying the polygon and centering the view on it
		 * @returns {String}
		 */
		getAladinScript: function(){
		    return this.STCRegion + ";" 
		    + this.center.ra + " " + this.center.dec + ";" 
		    + "zoom " + ((this.size.ra> this.size.dec)? this.size.ra: this.size.dec) + " deg ;";
		},
		
		
		

}
/**
 * Unit test:
 *
region = new Region("Polygon UNKNOWNFrame 256.9895 60.9734913333 256.9827987577 60.9738114124 256.9763546484 60.974759368 256.9704149831 60.9762988245 256.9652077975 60.9783707022 256.9609331225 60.980895475 256.9577553089 60.9837762124 256.9557967002 60.9869022901 256.955132897 60.9901536286 256.9557898013 60.9934052999 256.9577425614 60.9965323252 256.960916467 60.9994144808 256.9651897698 61.0019409264 256.9703983277 61.004014477 256.9763419009 61.0055553517 256.9827918588 61.0065042549 256.9895 61.0068246667 256.9962081412 61.0065042549 257.0026580991 61.0055553517 257.0086016723 61.004014477 257.0138102302 61.0019409264 257.018083533 60.9994144808 257.0212574386 60.9965323252 257.0232101987 60.9934052999 257.023867103 60.9901536286 257.0232032998 60.9869022901 257.0212446911 60.9837762124 257.0180668775 60.980895475 257.0137922025 60.9783707022 257.0085850169 60.9762988245 257.0026453516 60.974759368 256.9962012423 60.9738114124");
alert(region.getAladinScript());
*/
