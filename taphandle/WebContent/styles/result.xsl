<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" 
xmlns:ivoa="http://www.ivoa.net/xml/VOTable/v1.2"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform" >
	<xsl:output method="text" media-type="text/html" encoding="UTF-8" version="4.0" />

<xsl:template match="/">
{&quot;aoColumns&quot;:
<xsl:for-each select="ivoa:VOTABLE/ivoa:RESOURCE"><xsl:if test="position() = 1"> 
<xsl:for-each select="ivoa:TABLE"><xsl:if test="position() = 1"> 
[
<xsl:for-each select="ivoa:FIELD">
<xsl:if test="position() > 1">,</xsl:if>{&quot;sTitle&quot;: &quot;<xsl:value-of select="@name" />&quot;}
</xsl:for-each>
],
&quot;aaData&quot;: [
<xsl:for-each select="ivoa:DATA/ivoa:TABLEDATA/ivoa:TR">
<xsl:if test="position() > 1">,</xsl:if>
[
<xsl:for-each select="ivoa:TD">
<xsl:if test="position() > 1">,</xsl:if>&quot;<xsl:value-of select="." />&quot;
</xsl:for-each>
]
</xsl:for-each>
] 
</xsl:if></xsl:for-each>
</xsl:if></xsl:for-each>
}
</xsl:template>
</xsl:stylesheet>
