<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:uws="http://www.ivoa.net/xml/UWS/v1.0" xmlns:vosi="http://www.ivoa.net/xml/Availability/v0.4" xmlns:fn="http://www.w3.org/2005/xpath-functions/#">
	<xsl:output method="html" media-type="text/html" encoding="UTF-8" version="4.0" />
	
	<xsl:template match="/">
		<!-- Determine the local name of the root node -->
		<xsl:variable name="rootNode">
			<xsl:value-of select="local-name(descendant-or-self::node()[3])" />
		</xsl:variable>
		<!-- Determine the root url -->
		<xsl:variable name="rootUrl">
			<xsl:choose>
				<xsl:when test="$rootNode = 'jobList' or $rootNode = 'availability'">..</xsl:when>
				<xsl:when test="$rootNode = 'job'">../..</xsl:when>
				<xsl:when test="$rootNode = 'parameter'">../../../..</xsl:when>
				<xsl:otherwise>../../..</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<!-- Build the current path of the page in the UWS service -->
		<xsl:variable name="tapPath">
			<xsl:choose>
				<xsl:when test="$rootNode = 'availability'"><a href="../tap">TAP service</a>-&gt;<b>Availability</b></xsl:when>
				<xsl:when test="$rootNode = 'jobList'"><a href="../tap">TAP service</a>-&gt;<b>Jobs list</b></xsl:when>
				<xsl:when test="$rootNode = 'job'"><a href="../../tap">TAP service</a>-&gt;<a href="../async">Jobs list</a>-&gt;<b>Job</b></xsl:when>
				<xsl:when test="$rootNode = 'parameter'"><a href="../../../../tap">TAP service</a>-&gt;<a href="../../../async">Jobs list</a>-&gt;<a href="..">Job</a>-&gt;<a href="../parameters">parameters</a>-&gt;<b><xsl:value-of select="uws:parameter/@id | parameter/@id" /></b></xsl:when>
				<xsl:otherwise><a href="../../../tap">TAP service</a>-&gt;<a href="../../async">Jobs list</a>-&gt;<a href=".">Job</a>-&gt;<b><xsl:value-of select="$rootNode" /></b></xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		
		<!-- Write the HTML content -->
		<html>
			<head>
				<xsl:element name="link">
					<xsl:attribute name="rel">stylesheet</xsl:attribute>
					<xsl:attribute name="type">text/css</xsl:attribute>
					<xsl:attribute name="href"><xsl:value-of select="$rootUrl" />/styles/generic.css</xsl:attribute>
				</xsl:element>
				<xsl:element name="link">
					<xsl:attribute name="rel">stylesheet</xsl:attribute>
					<xsl:attribute name="type">text/css</xsl:attribute>
					<xsl:attribute name="href"><xsl:value-of select="$rootUrl" />/styles/tap.css</xsl:attribute>
				</xsl:element>
				<title>Saada - TAP Asynchronous Service</title>
			</head>
			<body style="margin:3px;">			
				<div id="header">
					<xsl:element name="img">
						<xsl:attribute name="alt">SAADA image</xsl:attribute>
						<xsl:attribute name="src"><xsl:value-of select="$rootUrl" />/images/saadatransp-text.gif</xsl:attribute>
					</xsl:element>
					<h1>Saada - TAP Asynchronous Service</h1>
				</div>
				<hr style="clear:both;margin-top:1em;" />
				<div id="tapPath"><xsl:copy-of select="$tapPath" /></div>
				
				<xsl:apply-templates />
				
			</body>
		</html>
	</xsl:template>
	
	<xsl:template match="vosi:availability | availability">
		<xsl:choose>
			<xsl:when test="vosi:available = 'true' or available = 'true'">
				<h1 id="pageTopic" style="color:green;">TAP service available</h1>
			</xsl:when>
			<xsl:otherwise>
				<h1 id="pageTopic" style="color:red;">TAP service NOT available</h1>
			</xsl:otherwise>
		</xsl:choose>
		<div class="section">
			<h1>Details</h1> 
			<xsl:if test="vosi:upSince or upSince">
				<p><b>Available since: </b><xsl:value-of select="vosi:upSince | upSince" /></p>
			</xsl:if>
			<xsl:if test="vosi:downAt or downAt">
				<p><b>Unavailable at: </b><xsl:value-of select="vosi:downAt | downAt" /></p>
			</xsl:if>
			<xsl:if test="vosi:backAt or backAt">
				<p><b>Available again at: </b><xsl:value-of select="vosi:backAt | backAt" /></p>
			</xsl:if>
			<xsl:for-each select="vosi:note | note">
				<p><b>Note: </b><xsl:value-of select="." /></p>
			</xsl:for-each>
		</div>
	</xsl:template>
	
	<xsl:template match="uws:jobList | jobList">
		<h1 id="pageTopic">List of all asynchronous jobs</h1>
		<ul>
			<xsl:for-each select="uws:jobRef | jobRef">
				<li>
					<xsl:element name="a">
						<xsl:attribute name="class">tapResource</xsl:attribute>
						<xsl:attribute name="href">
							<xsl:value-of select="@xlink:href | @href" />
						</xsl:attribute>
						<xsl:value-of select="@id"/>
					</xsl:element>
					 (phase = <xsl:value-of select="uws:phase | phase" />)
				</li>	
			</xsl:for-each>
		</ul>
	</xsl:template>
	
	<xsl:template match="uws:job | job">
		<h1 id="pageTopic">
			Job N°<xsl:value-of select="uws:jobId | jobId" />
			<xsl:if test="string-length(uws:runId | runId) > 0">
				(alias <xsl:value-of select="uws:runId | runId" />)
			</xsl:if>
		</h1>
		<div class="section">
			<h1>General description</h1>
			<xsl:apply-templates select="uws:ownerId | ownerId" />
			<xsl:apply-templates select="uws:quote | quote" />
			<xsl:apply-templates select="uws:destruction | destruction" />
		</div>
		<div class="section">
			<h1>Execution</h1>
			<xsl:apply-templates select="uws:phase | phase"/>
			<xsl:apply-templates select="uws:startTime | startTime" />
			<xsl:apply-templates select="uws:endTime | endTime" />
			<xsl:apply-templates select="uws:executionDuration | executionDuration" />
			<xsl:apply-templates select="uws:results | results" />
			<xsl:apply-templates select="uws:errorSummary | errorSummary" />
		</div>
		<xsl:apply-templates select="uws:parameters | parameters" />
	</xsl:template>
	
	
	<xsl:template match="uws:jobId | jobId"> 
		<p><b>Job Identifier: </b><xsl:value-of select="." /></p>
	</xsl:template>
	
	<xsl:template match="uws:runId | runId">
		<p><b>Run identifier: </b><xsl:value-of select="." /></p>
	</xsl:template>
	
	<xsl:template match="uws:ownerId | ownerId">
		<xsl:choose>
			<xsl:when test="string-length() = 0">
				<p><b>Owner: </b>None</p>
			</xsl:when>
			<xsl:otherwise>
				<p><b>Owner: </b><xsl:value-of select="." /></p>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
	
	<xsl:template match="uws:phase | phase">
		<xsl:element name="form">
			<xsl:attribute name="style">margin-top:1em; margin-bottom:1em;</xsl:attribute>
			<xsl:attribute name="action"><xsl:value-of select="/job/jobId | /uws:job/uws:jobId" />/phase</xsl:attribute>
			<xsl:attribute name="method">post</xsl:attribute>
			<p><b>Phase: </b>
			<xsl:choose>
				<xsl:when test=". = 'PENDING'">
					<span class="currentPhase">Pending</span>-&gt;<span class="phase">Queued</span>-&gt;<span class="phase">Executing</span>-&gt;<span class="phase">Completed</span>
					<xsl:if test="(/job or /uws:job)">
						<input type="hidden" id="phase" name="PHASE" value="RUN" />
						<input type="submit" class="standard_button" value="Start" onClick="document.getElementById('phase').value='RUN'" />
						<input type="submit" class="standard_button" value="Abort" onClick="document.getElementById('phase').value='ABORT'" />	
					</xsl:if>
				</xsl:when>
				<xsl:when test=". = 'HELD'">
					<span class="phase">Pending</span>-&gt;<span class="currentPhase">Held</span>-&gt;<span class="phase">Queued</span>-&gt;<span class="phase">Executing</span>-&gt;<span class="phase">Completed</span>
					<xsl:if test="(/job or /uws:job)">
						<input type="hidden" id="phase" name="PHASE" value="RUN" />
						<input type="submit" class="standard_button" value="Start" onClick="document.getElementById('phase').value='RUN'" />
						<input type="submit" class="standard_button" value="Abort" onClick="document.getElementById('phase').value='ABORT'" />	
					</xsl:if>
				</xsl:when>
				<xsl:when test=". = 'QUEUED'">
					<span class="phase">Pending</span>-&gt;<span class="currentPhase">Queued</span>-&gt;<span class="phase">Executing</span>-&gt;<span class="phase">Completed</span>
					<xsl:if test="(/job or /uws:job)">
						<input type="hidden" id="phase" name="PHASE" value="ABORT" />
						<input type="button" class="standard_button" value="Refresh" onClick="window.location.reload();" />
						<input type="submit" class="standard_button" value="Abort" onClick="document.getElementById('phase').value='ABORT'" />	
					</xsl:if>
				</xsl:when>
				<xsl:when test=". = 'EXECUTING'">
					<span class="phase">Pending</span>-&gt;<span class="phase">Queued</span>-&gt;<span class="currentPhase">Executing</span>-&gt;<span class="phase">Completed</span>
					<xsl:if test="(/job or /uws:job)">
						<input type="hidden" id="phase" name="PHASE" value="ABORT" />
						<input type="button" class="standard_button" value="Refresh" onClick="window.location.reload();" />
						<input type="submit" class="standard_button" value="Abort" onClick="document.getElementById('phase').value='ABORT'" />	
					</xsl:if>
				</xsl:when>
				<xsl:when test=". = 'COMPLETED'">
					<span class="phase">Pending</span>-&gt;<span class="phase">Queued</span>-&gt;<span class="phase">Executing</span>-&gt;<span class="successPhase">Completed</span>
				</xsl:when>
				<xsl:when test=". = 'ERROR'">
					<span class="failPhase">Error</span>
				</xsl:when>
				<xsl:when test=". = 'ABORTED'">
					<span class="failPhase">Aborted</span>
				</xsl:when>
				<xsl:otherwise>
					<span class="currentPhase"><xsl:value-of select="." /></span>
				</xsl:otherwise>
			</xsl:choose></p>
		</xsl:element>
	</xsl:template>
	
	<xsl:template match="uws:quote | quote">
		<xsl:choose>
			<xsl:when test="string-length() = 0">
				<p><b>Quote: </b>None</p>
			</xsl:when>
			<xsl:otherwise>
				<p><b>Quote: </b><xsl:value-of select="." /></p>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
	
	<xsl:template match="uws:startTime | startTime">
		<xsl:choose>
			<xsl:when test="string-length() = 0">
				<p><b>Start: </b>Not yet started !</p>
			</xsl:when>
			<xsl:otherwise>
				<p><b>Start: </b><xsl:value-of select="." /></p>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
	
	<xsl:template match="uws:endTime | endTime">
		<xsl:choose>
			<xsl:when test="string-length() = 0">
				<p><b>End: </b>Not yet finished !</p>
			</xsl:when>
			<xsl:otherwise>
				<p><b>End: </b><xsl:value-of select="." /></p>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
	
	<xsl:template match="uws:executionDuration | executionDuration">
		<xsl:choose>
			<xsl:when test=". = 0">
				<p><b>Time out: </b>None</p>
			</xsl:when>
			<xsl:otherwise>
				<p>The execution has to finish in <b><xsl:value-of select="." /> seconds</b> since its beginning !</p>
			</xsl:otherwise>
		</xsl:choose>	
	</xsl:template>
	
	<xsl:template match="uws:destruction | destruction">
		<xsl:choose>
			<xsl:when test="string-length() = 0">
				<p><b>Destruction: </b>Never</p>
			</xsl:when>
			<xsl:otherwise>
				<p><b>Destruction: </b><xsl:value-of select="." /></p>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
	
	<xsl:template match="uws:parameters | parameters">
		<div class="section">
			<h1>Parameters</h1>
			<table border="1">
				<tr>
					<th>Name</th>
					<th>Value</th>
				</tr>
				<xsl:for-each select="uws:parameter | parameter">
					<xsl:element name="tr">
						<xsl:if test="position() mod 2 = 0">
							<xsl:attribute name="class">pair</xsl:attribute>
						</xsl:if>
						<td><xsl:value-of select="@id" /></td>
						<td><xsl:value-of select="." /></td>
					</xsl:element>
				</xsl:for-each>
			</table>
		</div>
	</xsl:template>
	
	<xsl:template match="uws:parameter | parameter">
		<p>The value of the parameter "<b><xsl:value-of select="@id" /></b>" is: "<b><xsl:value-of select="." /></b>"</p>
	</xsl:template>
	
	<xsl:template match="uws:results | results">
		<p style="font-weight: bold; margin-bottom:0;">Results</p>
		<ul style="margin-top:0;">
			<xsl:for-each select="uws:result | result">
				<li style="margin-left: 2em">
					<xsl:element name="a">
						<xsl:attribute name="href">
							<xsl:value-of select="@xlink:href | @href" />
						</xsl:attribute>
						<xsl:value-of select="@id"/>
					</xsl:element>				
				</li>
			</xsl:for-each>
		</ul>
	</xsl:template>
	
	<xsl:template match="uws:errorSummary | errorSummary">
		<xsl:choose>
			<xsl:when test="string-length() = 0">
				<p><b>UWS error summary: </b>No error !</p>
			</xsl:when>
			<xsl:otherwise>
				<p>
					<b>UWS error summary: </b><i>A <xsl:value-of select="@type" /> error has occurred:</i><br />
					<xsl:value-of select="uws:message | message" />
					<xsl:if test="@hasDetail = 'true'">
						<br />
						<xsl:element name="a">
							<xsl:attribute name="href"><xsl:value-of select="../uws:jobId | ../jobId" />/error</xsl:attribute>
							Click here to view more details
						</xsl:element>
					</xsl:if>
				</p>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
	
</xsl:stylesheet>