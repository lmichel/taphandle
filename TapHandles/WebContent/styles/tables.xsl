<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:vosi="http://www.ivoa.net/xml/VOSITables/v1.0">
	<xsl:output method="text" media-type="text/html" encoding="UTF-8" version="4.0" />
	<xsl:strip-space elements="name" />
	<xsl:template match="/">
				<xsl:apply-templates select="vosi:tableset | tableset" />
	</xsl:template>
	
<xsl:template match="vosi:tableset | tableset">
{&quot;nodekey&quot;: &quot;NODEKEY&quot;,
&quot;schemas&quot;: [<xsl:for-each select="schema"><xsl:if test="position() > 1">,</xsl:if>
    {&quot;name&quot;: &quot;<xsl:value-of select="name" />&quot;,
     &quot;tables&quot;: [
    <xsl:for-each select="table"><xsl:if test="position() > 1">,</xsl:if>&quot;<xsl:value-of select="name" />&quot;</xsl:for-each>
    ]}
</xsl:for-each>
]}
</xsl:template>
</xsl:stylesheet>