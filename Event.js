JSPDP.Event = function() {
	this.subscribers = new Array();
}
JSPDP.Event.prototype = {
	subscribe : function(func) {
		this.subscribers.push(func);
	},
	
	unsubscribe : function(func) {
		for(var i = 0; i < this.subscribers.length; i++) {
			if(this.subscribers[i] == func) {
				this.subscribers.splice(i, 1);
				return;
			}
		}
	},
	
	fire : function() {
		for(var i = 0; i < this.subscribers.length; i++) {
			this.subscribers[i].apply(this, arguments);
		}
	}
}