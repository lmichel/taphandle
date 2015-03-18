# Using a Web Browser #

TAP clients have 2 challenging features:

  1. **Editing ADQL queries**: All GUI designers have to face the impossible compromise between the simplicity (HTML forms which can be used by anybody) and the flexibility (using a language which requires a good expertise). This question has certainly been discussed by Egyptian writer when the issue was to move from hieroglyphs to phonetic writing. The experience shows that, above a certain complexity level, graphical forms, although being more limited, becomes more difficult to understand than a query language. A solution proposed by the SAADA query editor  (and by a lot of user-end DB clients) is to use a graphical form not as a query builder but as a smart query text editor. Users can then access at any time to the query text and modify it whether they are not happy with what is proposed by the GUI.

  1. **Dealing with heterogeneous responses.** As explained in the above use case, one of the main interests of TAP (and especially [ObsTap](http://www.ivoa.net/cgi-bin/twiki/bin/view/IVOA/ObsTap)) is the ability to return heterogeneous data set. That is a real advantage only if the client is able to take the best from these data files:
    1. Using SAMP to display structured data.
    1. Using standard web tools to display previews helping to estimate some object properties.
    1. Using standard Web protocols to recognize data types (mime).
    1. Using smart interface to expands DataLinks.



Point 1) acts in favour of using a Web browser which are now enable to support very complex user interactions.

Point 2) is also the prerogative of Web browsers which usage led over last 20 years to a universal way to handle various file formats coming from anywhere. I believe that a Web browser (with [SAMP](http://www.ivoa.net/Documents/latest/SAMP.html)) is definitely an excellent platform to access TAP services.

We propose here to adapt the [Saada](http://saada.u-strasbg.fr) Web interface toward a universal TAP browser. The main adjustments are:

  1. Add a TAP service selector.
  1. Replace the Saada data tree with a list of available services.
  1. Remove SaadaQL and S\*AP forms.
  1. Add to the data area anchors directing data to the right tool.
  1. Create a shopping cart containing data to be downloaded.