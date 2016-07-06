<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet version="1.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	xmlns:vot="http://www.ivoa.net/xml/VOTable/v1.1">
	<xsl:output method="html" media-type="text/html" encoding="UTF-8"
		version="4.0" />
	<xsl:template match="/">
		<html>
			<head>
				<title>Saada - TAP query result</title>
			</head>
			<body style="margin:3px;">
				<div id="header">
					<xsl:element name="img">
						<xsl:attribute name="id">saadaImg</xsl:attribute>
						<xsl:attribute name="alt">SAADA image</xsl:attribute>
						<xsl:attribute name="src"></xsl:attribute>
					</xsl:element>
					<h1>
						Saada - TAP query result
						<i>(VOTable)</i>
					</h1>
				</div>
				<hr style="clear:both;margin-top:1em;" />
				<div id="tapPath">
					<xsl:element name="a">
						<xsl:attribute name="id">tapLink</xsl:attribute>
						<xsl:attribute name="class">tapResource</xsl:attribute>
						<xsl:attribute name="href"></xsl:attribute>
						Go back to the TAP service
					</xsl:element>
				</div>

				<script type="text/javascript">
					// Get the base url:
					var rootUrl =
					String(window.location);
					rootUrl = rootUrl.substring(0,
					rootUrl.indexOf('tap'));

					// Link the page with the Saada CSS:
					var
					fileref=document.createElement("link");
					fileref.setAttribute("rel",
					"stylesheet");
					fileref.setAttribute("type", "text/css");
					fileref.setAttribute("href", rootUrl+"styles/generic.css");
					document.getElementsByTagName('head')[0].appendChild(fileref);
					fileref=document.createElement("link");
					fileref.setAttribute("rel",
					"stylesheet");
					fileref.setAttribute("type", "text/css");
					fileref.setAttribute("href", rootUrl+"styles/tap.css");
					document.getElementsByTagName('head')[0].appendChild(fileref);

					// Get the Saada image url:
					document.getElementById('saadaImg').src =
					rootUrl+"images/saadatransp-text.gif";

					// Get the TAP service url:
					document.getElementById('tapLink').href =
					rootUrl+"tap";
				</script>

				<h1 id="pageTopic">Query result</h1>
				<div class="section">
					<h1>Query status</h1>
					<xsl:for-each select="/vot:VOTABLE/vot:RESOURCE/vot:INFO[@name = 'QUERY_STATUS']">
						<xsl:choose>
							<xsl:when test="@value = 'OVERFLOW'">
								<p style="color:orange;">
									<b>OVERFLOW : </b>
									<xsl:value-of select="." />
								</p>
							</xsl:when>
							<xsl:when test="@value = 'ERROR'">
								<p style="color:red;">
									<b>ERROR : </b>
									<xsl:value-of select="." />
								</p>
							</xsl:when>
							<xsl:when test="@value = 'OK'">
								<p style="color:green;">
									<b>OK ! </b>
									<i>
										<xsl:value-of select="(.)" />
									</i>
								</p>
							</xsl:when>
							<xsl:otherwise>
								<p>
									<b>
										<xsl:value-of select="@value" />
										:
									</b>
									<xsl:value-of select="." />
								</p>
							</xsl:otherwise>
						</xsl:choose>
					</xsl:for-each>
				</div>
				<div class="section">
					<h1>
						Executed query (
						<xsl:value-of select="/vot:VOTABLE/vot:RESOURCE/vot:INFO[@name='LANGUAGE']" />
						)
					</h1>
					<p>
						<xsl:value-of select="/vot:VOTABLE/vot:RESOURCE/vot:INFO[@name='QUERY']" />
					</p>
				</div>
				<xsl:if test="/vot:VOTABLE/vot:RESOURCE/vot:TABLE">
					<xsl:variable name="instanceUrl">
						<xsl:value-of
							select="substring-before(/vot:VOTABLE/vot:RESOURCE/vot:TABLE/vot:FIELD/vot:LINK/@href, '$')" />
					</xsl:variable>
					<xsl:variable name="productUrl">
						<xsl:value-of
							select="concat(substring-before($instanceUrl, 'getinstance'), 'getproduct', substring-after($instanceUrl, 'getinstance'))" />
					</xsl:variable>
					<div class="section">
						<h1>
							Result:
							<xsl:value-of
								select="count(/vot:VOTABLE/vot:RESOURCE/vot:TABLE/vot:DATA/vot:TABLEDATA/child::vot:TR)" />
							lines match
						</h1>
						<p align="center">
							<table border="1">
								<tr>
									<xsl:for-each
										select="/vot:VOTABLE/vot:RESOURCE/vot:TABLE/vot:FIELD[position() &lt; last()-1]"><!-- /VOTABLE/RESOURCE/TABLE/FIELD[not(@type)]"> -->
										<th>
											<xsl:value-of select="@name" />
										</th>
									</xsl:for-each>
								</tr>
								<xsl:for-each select="/vot:VOTABLE/vot:RESOURCE/vot:TABLE/vot:DATA/vot:TABLEDATA/vot:TR">
									<xsl:element name="tr">
										<xsl:if test="position() mod 2 = 0">
											<xsl:attribute name="class">pair</xsl:attribute>
										</xsl:if>
										<xsl:for-each select="vot:TD">
											<!--											<xsl:if test="position() &lt; last()-1">-->
											<td>
												<xsl:choose>
													<xsl:when test="position() = 1">
														<xsl:value-of select="." />
<!--														<xsl:element name="a">-->
<!--															<xsl:attribute name="href">-->
<!--																	<xsl:value-of select="concat($instanceUrl, .)">-->
<!--																	<xsl:value-of select="." />-->
<!--																</xsl:attribute>-->
<!--															<xsl:value-of select="." />-->
<!--														</xsl:element>-->
<!--														<xsl:element name="a">-->
<!--															<xsl:attribute name="href">-->
<!--																	<xsl:value-of select="concat($productUrl, .)" />-->
<!--																</xsl:attribute>-->
<!--															<xsl:attribute name="title">Download <xsl:value-of select="following-sibling::*[last()]" /> </xsl:attribute>-->
<!--															<xsl:attribute name="class">download</xsl:attribute>-->
<!--														</xsl:element>-->
													</xsl:when>
													<xsl:when test="starts-with(., 'http://')">
														<xsl:element name="a">
															<xsl:attribute name="href"><xsl:value-of
																select="." /></xsl:attribute>
															<xsl:attribute name="title"><xsl:value-of
																select="." /></xsl:attribute>
															HTTP link
														</xsl:element>
													</xsl:when>
													<xsl:otherwise>
														<xsl:value-of select="." />
													</xsl:otherwise>
												</xsl:choose>
											</td>
											<!--											</xsl:if>-->
										</xsl:for-each>
									</xsl:element>
								</xsl:for-each>
							</table>
						</p>
					</div>
				</xsl:if>
			</body>
		</html>
	</xsl:template>
</xsl:stylesheet>
