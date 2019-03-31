<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:xlink="http://www.w3.org/1999/xlink"
	xmlns:vosi="http://www.ivoa.net/xml/Availability/v0.4" xmlns:fn="http://www.w3.org/2005/xpath-functions/#">

	<xsl:output method="text" media-type="text/json" encoding="UTF-8" />
	<xsl:template match="/">
		{
		&quot;available": &quot;<xsl:value-of select="available/availability/vosi:availability/vosi:available" />&quot;
		<xsl:for-each select="vosi:availability/vosi:note">&quot;note&quot;: &quot;<xsl:value-of select="." />&quot;</xsl:for-each>
		}
	</xsl:template>
</xsl:stylesheet>