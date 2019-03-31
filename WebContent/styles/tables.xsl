<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
	xmlns:xs="http://www.w3.org/2001/XMLSchema"
	xmlns:json="http://json.org/" 
	xmlns:vosi="http://www.ivoa.net/xml/VOSITables/v1.0"
	xmlns:vod="http://www.ivoa.net/xml/VODataService/v1.1"	
	xmlns:uws="http://www.ivoa.net/xml/UWS/v1.0">
	<xsl:import href="http://saada.unistra.fr/resources/xml-to-json.xsl" />
	<xsl:output method="text" media-type="text/html" encoding="UTF-8" version="4.0" />
	<xsl:strip-space elements="name" />
	<xsl:template match="/">
	<xsl:apply-templates select="vosi:tableset | vod:tableset | tableset" />
	</xsl:template>
	
<xsl:template match="vosi:tableset | vod:tableset | tableset">
{&quot;nodekey&quot;: &quot;NODEKEY&quot;,
&quot;nodeurl&quot;: &quot;NODEURL&quot;,
&quot;asyncsupport&quot;: &quot;NODEASYNC&quot;,
&quot;uploadsupport&quot;: &quot;NODEUPLOAD&quot;,
&quot;schemas&quot;: [<xsl:for-each select="schema"><xsl:if test="position() > 1">,</xsl:if>
    {&quot;name&quot;: &quot;<xsl:value-of select="name" />&quot;,
    &quot;description&quot;: &quot;<xsl:for-each select="description"><xsl:value-of select="json:encode-string(.)" /></xsl:for-each>&quot;,
    &quot;tables&quot;: [
    <xsl:for-each select="table"><xsl:if test="position() > 1">,</xsl:if>
    {&quot;name&quot;: &quot;<xsl:for-each select="name"><xsl:value-of select="json:encode-string(.)" /></xsl:for-each>&quot;,
    <!--  
        {&quot;name&quot;: &quot;<xsl:value-of select="name" />&quot;,
        -->
         &quot;description&quot;: &quot;<xsl:for-each select="description"><xsl:value-of select="json:encode-string(.)" /></xsl:for-each>&quot;}</xsl:for-each>
    ]}
</xsl:for-each>
]}
</xsl:template>
</xsl:stylesheet>
