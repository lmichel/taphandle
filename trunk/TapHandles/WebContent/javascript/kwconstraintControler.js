jQuery.extend({

	KWConstraintControler: function(model, view){
		/**
		 * listen to the view
		 */
		var vlist = {
			controlEnterEvent : function(andor, operator, operand){
				model.processEnterEvent(andor, operator, operand);
			},
			controlRemoveConstRef : function(operator, operand){
				model.processRemoveConstRef(operator, operand);
			},
			controlRemoveFirstAndOr: function(key){
				model.processRemoveFirstAndOr(key);
			}
		}
		view.addListener(vlist);

		var mlist = {
			isInit : function(attributehandler, operators, andors, default_value){
				view.initForm(attributehandler, operators, andors, default_value);
			},
			printTypomsg: function(fault, msg){
				view.printTypomsg(fault,  msg);
			}
		}
		model.addListener(mlist);
		
		this.controlRemoveAndOr= function() {
			model.removeAndOr();
			view.removeAndOr();
		}
		this.getADQL = function(attQuoted) {
			return model.getADQL(attQuoted);
		}
	}
});
