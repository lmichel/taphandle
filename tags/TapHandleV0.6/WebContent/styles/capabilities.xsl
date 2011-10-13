<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:vosi="http://www.ivoa.net/xml/VOSICapabilities/v1.0" xmlns:fn="http://www.w3.org/2005/xpath-functions/#">
	<xsl:strip-space  elements="*"/>
	<xsl:output method="text" media-type="text/json" encoding="UTF-8"  />
	
	<xsl:template match="/">
				<xsl:apply-templates select="vosi:capabilities | capabilities" />
	</xsl:template>

	<xsl:template match="vosi:capabilities | capabilities">
		[
		<xsl:for-each select="vosi:capability | capability">
			<xsl:if test="position() > 1">,</xsl:if>
			{"standardID" :
			&quot;<xsl:value-of select="@standardID" />&quot;,
			<xsl:for-each select="vosi:interface | interface">
				&quot;accessURL":
				<xsl:for-each select="vosi:accessURL | accessURL">
					<xsl:choose>
						<xsl:when test="@use != 'full'">
							<xsl:value-of select="." />
							(use:
							<xsl:value-of select="@use" />
							)
						</xsl:when>
						<xsl:otherwise>
				        &quot;<xsl:value-of select="." />&quot;
						</xsl:otherwise>
					</xsl:choose>
				</xsl:for-each>
			</xsl:for-each>
			}
		</xsl:for-each>
		]
	</xsl:template>
</xsl:stylesheet>