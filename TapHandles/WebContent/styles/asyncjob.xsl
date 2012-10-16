<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="2.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:xs="http://www.w3.org/2001/XMLSchema"
	xmlns:json="http://json.org/" xmlns:uws="http://www.ivoa.net/xml/UWS/v1.0">
	<xsl:import href="http://saada.unistra.fr/resources/xml-to-json.xsl" />


	<xsl:template match="uws:job | job">
		<xsl:value-of select="json:generate(.)" />
	</xsl:template>
</xsl:stylesheet>