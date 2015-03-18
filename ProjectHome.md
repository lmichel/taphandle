# A project for VO users #
This project aims at providing astoromers interested in using TAP services with  an universal web portal.

# The Basics #
  * A JEE application acts as proxy between TAP services and the end-point client
  * A Rich Internet Application allow to easily setup complex queries.
  * Data view is dynamically setup to make relevant connection between data and viewer or analysis tools.

# Release 1.3.beta: Last News (02/2013) #
  * Tooltips showing the node/schema/column descriptions
  * The graphical query editor supports simple joins based on keys taken from the TAP\_SHEMA.
  * A table filter allows to work with a subset of the tables published by one service. That is indispensable for huge TAP nodes such as Vizier.
  * Support of real table names and column names for Vizier.
  * Support of synchronous queries. Note that asynchronous. queries are always used when this capability is working.
  * Support of the Web Profile SAMP connector.
  * Plain text search in the registry to discover TAP resources. This feature uses the TAP registry of GAVO. All declared resources can be seen, not just those working...
  * TAP\_SCHEMA is highlighted in red in the data tree.
  * Ivoa schema is highlighted in green in the data tree.
  * DataLink implementation prototype (only available withe the XCatDB node)
    * Connect your own TAP node directly on TapHandle with a link built as:
```
http://saada.unistra.fr/taphandle?url=[Your encoded tap node]```
      * Example: Let's suppose that your TAP root url is
```
http://YourServer/YourNode```
Put the following anchor on your page
```
<a href='http://saada.unistra.fr/taphandle?url=http%3A%2F%2FYourServer%2FYourNode'><img src='http://saada.unistra.fr/taphandle/images/tap64.png'>

Unknown end tag for &lt;/a&gt;

```
