<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" 
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
	xmlns:xs="http://www.w3.org/2001/XMLSchema" 
	xmlns:xlink="http://www.w3.org/1999/xlink" 
	xmlns:tab='urn:astrogrid:schema:TableMetadata'
	xmlns:vosi="http://www.ivoa.net/xml/VOSITables/v1.0"
	xmlns:vod="http://www.ivoa.net/xml/VODataService/v1.1"		
	xmlns:json="http://json.org/">
	
	<xsl:output method="text" media-type="text/html" encoding="UTF-8" version="4.0" />
	<xsl:strip-space elements="name" />
	<xsl:function name="json:encode-string" as="xs:string">
	
	<xsl:param name="string" as="xs:string?"/>
<!-- 		<xsl:sequence select="replace($string, '(\{|\}|\[|\]|\\|&quot;|\\n)', '\\$1')"/> -->	
        <xsl:sequence select="replace($string, '(\\|&quot;|\\n)', '')"/>	
    </xsl:function>

<!-- 
Disable default rule pattern printing any text
 -->
<xsl:template match="text( )|@*">
</xsl:template>

<xsl:template name='loop' match="vosi:tableset/schema[name='SCHEMA'] | vod:tableset/schema[name='SCHEMA'] | tableset/schema[name='SCHEMA']">
<!-- 
Table name can be either tableName or schema.tableName 
but the variable TABLENAME is always given as schema.tableName 
At the ends, we want  name = schema.tableName 
-->
<!--  xsl:for-each select="table"><xsl:value-of select="json:encode-string(name)"/ -->
<xsl:for-each  select="table[name = 'TABLENAME' or ends-with(name, '.TABLENAME') or ends-with(name, '&quot;TABLENAME&quot;') or ends-with('&quot;TABLENAME&quot;', name)]">
{&quot;nodekey&quot;: &quot;NODEKEY&quot;,
<!--  &quot;table&quot;: &quot;<xsl:value-of select="name" />&quot;, -->
&quot;table&quot;: &quot;TABLENAME&quot;,
&quot;attributes&quot;: [
<xsl:for-each select="column">
<xsl:if test="position() > 1">,</xsl:if>
{&quot;nameattr&quot;: &quot;<xsl:value-of select="json:encode-string(name)"/>&quot;,
 &quot;nameorg&quot;: &quot;<xsl:value-of select="json:encode-string(name)"/>&quot;,
 &quot;unit&quot;: &quot;<xsl:value-of select="json:encode-string(unit)"/>&quot;,
 &quot;ucd&quot;: &quot;<xsl:value-of select="ucd" />&quot;,
 &quot;utype&quot;: &quot;<xsl:value-of select="utype" />&quot;,
 &quot;type&quot;: &quot;<xsl:value-of select="dataType" /><xsl:if test="dataType[@arraysize]">(<xsl:value-of select="dataType/@arraysize" />)</xsl:if>&quot;,
 &quot;dataType&quot;: &quot;<xsl:value-of select="dataType" /><xsl:if test="dataType[@arraysize]">(<xsl:value-of select="dataType/@arraysize" />)</xsl:if>&quot;,
 &quot;description&quot;: &quot;<xsl:value-of select='translate(description, "&#125;&#123;&#xA;&apos;", "XXXXXXXXXX")' />&quot;}
</xsl:for-each>]
}
</xsl:for-each>
</xsl:template>
</xsl:stylesheet>
