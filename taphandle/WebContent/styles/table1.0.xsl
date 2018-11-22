<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" 
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
	xmlns:xs="http://www.w3.org/2001/XMLSchema" 
	xmlns:xlink="http://www.w3.org/1999/xlink" 
	xmlns:vosi="http://www.ivoa.net/xml/VOSITables/v1.0"
	xmlns:json="http://json.org/">
	
	<xsl:output method="text" media-type="text/html" encoding="UTF-8" version="4.0" />
	<xsl:strip-space elements="name" />
	<xsl:template match="/">
		<xsl:apply-templates select="vosi:tableset | tableset" />
 	</xsl:template>

	<xsl:function name="json:encode-string" as="xs:string">
		<xsl:param name="string" as="xs:string?"/>
<!-- 		<xsl:sequence select="replace($string, '(\{|\}|\[|\]|\\|&quot;|\\n)', '\\$1')"/> -->	
        <xsl:sequence select="replace($string, '(\\|&quot;|\\n)', '\\$1')"/>	
	</xsl:function>

	<xsl:function name="json:remove-quotes" as="xs:string">
		<xsl:param name="string" as="xs:string?"/>
<!-- 		<xsl:sequence select="replace($string, '(\{|\}|\[|\]|\\|&quot;|\\n)', '\\$1')"/> -->	
        <xsl:sequence select="replace($string, '&quot;', '')"/>	
    </xsl:function>


<xsl:template match="vosi:tableset | vosi:table |tableset">
<xsl:for-each select="schema/table"><xsl:if  test="name = 'TABLENAME' or name = '&quot;TABLENAME&quot;' 
		or name = 'SCHEMA.TABLENAME' or name = 'SCHEMA.&quot;TABLENAME&quot;' 
		or name = '&quot;SCHEMA&quot;.&quot;TABLENAME&quot;' or name = '&quot;SCHEMA&quot;.TABLENAME'">
{&quot;nodekey&quot;: &quot;NODEKEY&quot;,
&quot;table&quot;: &quot;<xsl:value-of select="json:remove-quotes(name)" />&quot;,
&quot;attributes&quot;: 
{&quot;aoColumns&quot;: [
{&quot;sTitle&quot;: &quot;nameattr&quot;}
,{&quot;sTitle&quot;: &quot;unit&quot;}
,{&quot;sTitle&quot;: &quot;ucd&quot;}
,{&quot;sTitle&quot;: &quot;utype&quot;}
,{&quot;sTitle&quot;: &quot;dataType&quot;}
,{&quot;sTitle&quot;: &quot;description&quot;}
],
&quot;aaData&quot;: [
<xsl:for-each select="column">
<xsl:if test="position() > 1">,</xsl:if>
[&quot;<xsl:value-of select="json:encode-string(name)"/>&quot;,
 &quot;<xsl:value-of select="json:encode-string(unit)"/>&quot;,
 &quot;<xsl:value-of select="ucd" />&quot;,
 &quot;<xsl:value-of select="utype" />&quot;,
 &quot;<xsl:value-of select="dataType" />&quot;,
 &quot;<xsl:value-of select="json:encode-string(description)"/>&quot;]
</xsl:for-each>]}
</xsl:if></xsl:for-each>}
</xsl:template>




</xsl:stylesheet>