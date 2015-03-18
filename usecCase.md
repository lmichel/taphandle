# Context #
This project is dedicated to astronomers using [Virtual Observatory services](http://www.ivoa.net/).
The most flexible data discovery protocol, namely [Table Access Protocol](http://www.ivoa.net/Documents/TAP/), can return any kind of data selected with a query language (ADQL at least).
Taking the best of this flexibility requires specific end-point clients enable to connect selected data with relevant tools or viewers.
The present project aims at proposing a solution based on both a RIA and  a proxy server.

# HE Use Case #
Data covering interesting regions can be downloaded from a well known resource (e.g. a mission archive) not necessarily VO compliant. Similarly, the analysis software is probably not a VO tool but a proprietary software. Downloaded datasets can be complex, including calibration files and other instrumental data.
The process of data selection consists in collecting as much data as possible about the region thanks to the VO  (e.g. using Aladin or another VO portal).

VO tools like Aladin, VOSPec, Topcat, etc. can easily handle collected data in FITS or VOtable, like images or spectra. Such tools also allow to compare and bring together data coming from other VO services especially the Simple protocols (SIAP, SSAP, SLAP, etc.)

Explanatory information in shape of acquisition parameters is mostly delivered in flat files like JPEG image of the field of view, PDF graph of the spectral response, text files with observing conditions, etc...
As an example let’s take an X-ray spectra, usually delivered uncalibrated because the calibration always refers to one model. Users are however interested in source hardness or power law (e.g.) easily identified in a quick view of the spectrum profile.

Therefore plots, readme files are of great help to select data sets in terms of quality , relevance , etc.
Web browsers are obviously very good candidates for providing access to such explanatory data in regular formats but also capable to hook VO tools using the Web SAMP protocol developped in the VO.
