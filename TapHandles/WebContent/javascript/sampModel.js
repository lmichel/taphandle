jQuery.extend({

	SampModel: function(){
		/**
		 * keep a reference to ourselves
		 */
		var that = this;
		/**
		 * who is listening to us?
		 */
		var listeners = new Array();
		/**
		 * add a listener to this view
		 */
		this.addListener = function(list){
			listeners.push(list);
		}


		this.sampInit = function(list){

			$("#sampconnector").click(function() {				
				WebSampConnector.configure({
					jAppletId: 'WebSampConnectorApplet',
					jAppletCodeBase: './applets/', 
					jAppletVersion: '1.5'
				});

				$(this).css("background", "url(images/connecting.gif)center left no-repeat");
				var connected = false;
				try {
					var connected = WebSampConnector.isConnected();
				}catch(err) {
				}
				if( connected == false ) {
					WebSampConnector.connect();
					setTimeout(that.checkConnection, 7000);
				}
				else {
					WebSampConnector.disconnect();
					$("#sampconnector").css("background", "url(images/disconnected.png)center left no-repeat");					
					$(".ivoa").css('visibility', 'hidden');
				}
			});
		}

		this.checkConnection = function() {
			try {
				if( WebSampConnector.isConnected() == false ) {				
					$("#sampconnector").css("background", "url(images/disconnected.png)center left no-repeat");
					$(".ivoa").css('visibility', 'hidden');
					loggedAlert('Connection failed: Make sure you have a SAMP hub running', 'Warning');
				}
				else {
					$("#sampconnector").css("background", "url(images/connected.png)center left no-repeat");	
					//$(".ivoa").css('visibility', 'visible');
					$(".ivoa").css('visibility', 'hidden');
				}
			} catch(err) {
				$("#sampconnector").css("background", "url(images/disconnected.png)center left no-repeat");
				$(".ivoa").css('visibility', 'hidden');
				loggedAlert('Connection failed: Make sure the applet WebSampConnector is authorized to run', 'Warning');				
			}

		}
	
	}	
});