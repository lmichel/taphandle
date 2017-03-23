# TAPHandle

1. **What is it**

TAPHandle is a WEB application allowing users to browse any VO TAP service from a navigator.

TAPHandle can mix different TAP services in a single view. 

An advanced quety form allow to easily write VOQL queries by using the meta-data of the current table.

A TAP service is a VO interface placed on the top of a relational database. It is self-described through standardized capabilities.


2. **How does it work**

The actual TAP client is not TAPHandle, by a porxy running on our server. All user requests are relayed by that poxy to the server.

The main cache functionnalities are:
  * Cache for the service meta-data
  * Cache for the registry records
  * User data storage
  * XML => JSON conversion. The TAP protocol is bases on XML message whereas the communication between the browser and the porxy server are mostly based on JSON messages.

2. **Connect TapHandle**

[http://saada.unistra.fr/taphandle]
