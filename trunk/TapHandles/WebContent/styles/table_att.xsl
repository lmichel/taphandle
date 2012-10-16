<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:vosi="http://www.ivoa.net/xml/VOSITables/v1.0">
	<xsl:output method="text" media-type="text/html" encoding="UTF-8" version="4.0" />
	<xsl:strip-space elements="name" />
	<xsl:template match="/">
				<xsl:apply-templates select="vosi:tableset | tableset" />
	</xsl:template>
	
		<xsl:template name="escapeQuote">
     	<xsl:param name="pText" select="."/>
      		<xsl:if test="string-length($pText) >0">
       			<xsl:value-of select=
        		"substring-before(concat($pText, '&quot;'), '&quot;')"/>
      			 <xsl:if test="contains($pText, '&quot;')">
        			<xsl:text>\"</xsl:text>
        			<xsl:call-template name="escapeQuote">
          				<xsl:with-param name="pText" select=
         		 		"substring-after($pText, '&quot;')"/>
        			</xsl:call-template>
       		</xsl:if>
    	</xsl:if>
	</xsl:template>
	
<xsl:template match="vosi:tableset | tableset">
<xsl:for-each select="schema/table"><xsl:if test="name = 'TABLENAME'">
{&quot;nodekey&quot;: &quot;NODEKEY&quot;,
&quot;table&quot;: &quot;<xsl:value-of select="name" />&quot;,
&quot;attributes&quot;: [

<xsl:for-each select="column">
<xsl:if test="position() > 1">,</xsl:if>
{&quot;name&quot;: &quot;<xsl:call-template name="escapeQuote"><xsl:with-param name="pText" select="name"/></xsl:call-template>&quot;,
 &quot;unit&quot;: &quot;<xsl:call-template name="escapeQuote"><xsl:with-param name="pText" select="unit"/></xsl:call-template>&quot;,
 &quot;ucd&quot;: &quot;<xsl:value-of select="ucd" />&quot;,
 &quot;utype&quot;: &quot;<xsl:value-of select="utype" />&quot;,
 &quot;dataType&quot;: &quot;<xsl:value-of select="dataType" /><xsl:if test="dataType[@arraysize]">(<xsl:value-of select="dataType/@arraysize" />)</xsl:if>&quot;,
 &quot;description&quot;: &quot;<xsl:call-template name="escapeQuote"><xsl:with-param name="pText" select="description"/></xsl:call-template>&quot;}
</xsl:for-each>]
</xsl:if></xsl:for-each>}
</xsl:template>
</xsl:stylesheet>
