<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" 
 xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
 xmlns:xlink="http://www.w3.org/1999/xlink" 
 xmlns:uws="http://www.ivoa.net/xml/UWS/v1.0">
	<xsl:output method="text" media-type="text/html" encoding="UTF-8" version="4.0" />
	<xsl:strip-space elements="name" />
	<xsl:template match="/">
		<xsl:apply-templates select="uws:job | job" />
	</xsl:template>
	
<xsl:template match="uws:job | job">{
&quot;jobId&quot;: &quot;<xsl:value-of select="uws:jobId"/>&quot; ,
&quot;runId&quot;: &quot;<xsl:value-of select="uws:runId"/>&quot; ,
&quot;ownerId&quot;: &quot;<xsl:value-of select="uws:ownerId"/>&quot; ,
&quot;phase&quot;: &quot;<xsl:value-of select="uws:phase"/>&quot; ,
&quot;quote&quot;: &quot;<xsl:value-of select="uws:quote"/>&quot; ,
&quot;startTime&quot;: &quot;<xsl:value-of select="uws:startTime"/>&quot;, 
&quot;endTime&quot;: &quot;<xsl:value-of select="uws:endTime"/>&quot; ,
&quot;executionDuration&quot;: &quot;<xsl:value-of select="uws:executionDuration"/>&quot; ,
&quot;destruction&quot;: &quot;<xsl:value-of select="uws:destruction"/>&quot; ,
&quot;parameters&quot;: [ 
<xsl:for-each select="uws:parameters/uws:parameter">
    <xsl:if test="position() > 1">,</xsl:if>{&quot;<xsl:value-of select="@id" />&quot;: &quot;<xsl:value-of select="." />&quot;}
</xsl:for-each>
],
&quot;results&quot;: [ 
<xsl:for-each select="uws:results/uws:result">
    <xsl:if test="position() > 1">,</xsl:if>&quot;<xsl:value-of select="@xlink:href" />&quot;
</xsl:for-each>
]
}
</xsl:template>
</xsl:stylesheet>
