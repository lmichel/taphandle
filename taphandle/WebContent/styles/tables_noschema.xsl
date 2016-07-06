<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
	xmlns:xs="http://www.w3.org/2001/XMLSchema"
	xmlns:json="http://json.org/" 
	xmlns:vosi="http://www.ivoa.net/xml/VOSITables/v1.0"
    xmlns:tab='urn:astrogrid:schema:TableMetadata'
	xmlns:uws="http://www.ivoa.net/xml/UWS/v1.0">
	<xsl:import href="http://saada.unistra.fr/resources/xml-to-json.xsl" />
	<xsl:output method="text" media-type="text/html" encoding="UTF-8" version="4.0" />
	<xsl:strip-space elements="name" />
	<xsl:template match="/">
	<xsl:apply-templates select="tab:tables | tables" />
	</xsl:template>
	
<xsl:template match="tab:tables | tables">
{&quot;nodekey&quot;: &quot;NODEKEY&quot;,
&quot;nodeurl&quot;: &quot;NODEURL&quot;,
&quot;schemas&quot;: [
    {&quot;name&quot;: &quot;<xsl:value-of select="name" />&quot;,
    &quot;description&quot;: &quot;<xsl:for-each select="description"><xsl:value-of select="json:encode-string(.)" /></xsl:for-each>&quot;,
    &quot;tables&quot;: [
    <xsl:for-each select="table"><xsl:if test="position() > 1">,</xsl:if>
        {&quot;name&quot;: &quot;<xsl:value-of select="name" />&quot;,
         &quot;description&quot;: &quot;<xsl:for-each select="description"><xsl:value-of select="json:encode-string(.)" /></xsl:for-each>&quot;}</xsl:for-each>
    ]}
]}
</xsl:template>
</xsl:stylesheet>
