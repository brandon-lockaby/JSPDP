JSPDP.TouchController = function(tableau, element, panel_width, panel_height) {
	this.tableau = tableau;
	this.element = element;
	this.panelWidth = panel_width;
	this.panelHeight = panel_height;
	
	this.tableau.onActionPhase.subscribe(this.onActionPhase.bind(this));
	addEventListener('mousedown', this.onMousedown.bind(this));
	addEventListener('mouseup', this.onMouseup.bind(this));
	addEventListener('mousemove', this.onMousemove.bind(this));
}
JSPDP.TouchController.prototype = {
	selection : null,
	position : null,
	
	translatedEvent : function(event) {
		var offx = 0;
		var offy = 0;
		var ele = this.element;
		do{
			offx += ele.offsetLeft;
			offy += ele.offsetTop;
		} while(ele = ele.offsetParent);
		return {x : event.pageX - offx, y : event.pageY - offy};
	},

	onMousedown : function(event) {
		var coords = this.translatedEvent(event);
		var x = Math.floor(coords.x / this.panelWidth);
		var y = Math.floor(this.tableau.dimensions.height - (coords.y / this.panelHeight));
		var panel = this.tableau.getPanel(y, x);
		if(panel) {
			this.selection = {
				panel : panel,
				x : x,
				y : y
			};
			this.position = {
				x : x,
				y : y
			};
		}
		else {
			this.selection = null;
		}
	},
	
	onMouseup : function(event) {
		this.selection = null;
	},
	
	onMousemove : function(event) {
		if(this.selection) {
			var coords = this.translatedEvent(event);
			var x = Math.floor(coords.x / this.panelWidth);
			var y = Math.floor(this.tableau.dimensions.height - (coords.y / this.panelHeight));
			this.position = {
				x : x,
				y : y
			};
		}
	},

	onActionPhase : function() {
		if(this.selection) {
			var panel = this.tableau.getPanel(this.selection.y, this.selection.x);
			if(panel != this.selection.panel) {
				this.selection = null;
				return;
			}
			if(this.position.x != this.selection.x) {
				var from_left = this.position.x > this.selection.x;
				var other_x = this.selection.x + (from_left ? 1 : -1);
				var other_panel = this.tableau.getPanel(this.selection.y, other_x);
				if(!panel.isSwapping() && (!other_panel || !other_panel.isSwapping())) {
					if(this.tableau.swap(this.selection.y, this.selection.x, from_left)) {
						this.selection = {
							panel : panel,
							x : other_x,
							y : this.selection.y
						};
					}
				}
			}
		}
	}
}
