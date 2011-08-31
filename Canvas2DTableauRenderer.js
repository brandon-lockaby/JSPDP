/*
	Copyright 2011 Brandon Lockaby
	
	This file is part of JSPDP.
	https://github.com/brandon-lockaby/JSPDP

    JSPDP is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    JSPDP is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with JSPDP.  If not, see <http://www.gnu.org/licenses/>.

*/

JSPDP.Canvas2DTableauRenderer = function() {
};

var proto = (JSPDP.Canvas2DTableauRenderer.prototype = {});

proto.init = function(tableau, theme) {
	this.tableau = tableau;
	this.theme = theme;
	this.canvas = document.createElement("canvas");
	this.canvas.width = this.theme.panelDimensions.width * tableau.dimensions.width;
	this.canvas.height = this.theme.panelDimensions.height * tableau.dimensions.height;
	this.ctx = this.canvas.getContext('2d');
	this.ctx.font = "16px georgia";
	
	this.tableau.onSetPanel.subscribe(this.onSetPanel.bind(this));
	this.tableau.onSwap.subscribe(this.onSwap.bind(this));
	this.tableau.onLand.subscribe(this.onLand.bind(this));
	this.tableau.onCombo.subscribe(this.onCombo.bind(this));
	this.tableau.onPop.subscribe(this.onPop.bind(this));
	
	this.animatingPanels = [];
	this.swappingPanels = [];
	
	this.ctx.fillStyle = "rgb(255,255,255)";
	
	
	window.requestAnimationFrame = (function(){
		//Check for each browser
		//@paul_irish function
		//Globalises this function to work on any browser as each browser has a different namespace for this
		return  window.requestAnimationFrame   || //Chromium 
			window.webkitRequestAnimationFrame || //Webkit
			window.mozRequestAnimationFrame    || //Mozilla Geko
			window.oRequestAnimationFrame      || //Opera Presto
			window.msRequestAnimationFrame     || //IE Trident?
			function(callback, element){ //Fallback function
				window.setTimeout(callback, 1000 / 45);
			}
	})();
	if(console) console.log(window.requestAnimationFrame);
	
	this.redraw();
	
	var self = this;
	function animate() {
		self.runTick();
		requestAnimationFrame(animate);
	}
	requestAnimationFrame(animate);
	
	return this;
}

proto.tickCount = 0;

proto.renderPanel = function(panel) {
	var x = this.theme.panelDimensions.width * panel.col;
	var y = this.canvas.height - (this.theme.panelDimensions.height * panel.row) - this.theme.panelDimensions.height;
	if(!panel.isAir() && !panel.isPopped() && !panel.isSwapping()) {
		if(panel.isMatching() && (this.tickCount & 1) && (panel.timer > (this.tableau.durations.match * 0.25))) {
			// render white
			this.ctx.fillRect(x, y, this.theme.panelDimensions.width, this.theme.panelDimensions.height);
		} else if(panel.isPopping()) {
			// render gray
			this.ctx.fillStyle = "rgb(64,64,64)";
			this.ctx.fillRect(x, y, this.theme.panelDimensions.width, this.theme.panelDimensions.height);
			this.ctx.fillStyle = "rgb(255,255,255)";
		} else {
			// render normally
			this.ctx.drawImage(this.theme.panelImages[panel.color], x, y);
		}
	} else {
		this.ctx.clearRect(x, y, this.theme.panelDimensions.width, this.theme.panelDimensions.height);
	}
};

proto.renderSwappingPanel = function(panel) {
	if(!panel.isAir()) {
		var x = this.theme.panelDimensions.width * panel.col;
		var y = this.canvas.height - (this.theme.panelDimensions.height * panel.row) - this.theme.panelDimensions.height;
		var offs = this.theme.panelDimensions.width / 4;
		offs *= (4 - panel.timer);
		if(panel.flags & JSPDP.Panel.EFlags.FromLeft) {
			offs = -this.theme.panelDimensions.width + offs;
		} else {
			offs = this.theme.panelDimensions.width - offs;
		}
		this.ctx.drawImage(this.theme.panelImages[panel.color], x + offs, y);
	}
};

proto.redraw = function() {
	this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	var self = this;
	this.tableau.eachPanel(function(panel) {
		self.renderPanel(panel);
	});
};

proto.onSetPanel = function(panel) {
	this.renderPanel(panel);
};

proto.onLand = function(panel) {
	panel.renderFlags = JSPDP.Panel.EFlags.Landing;
	this.animatingPanels.push(panel);
};

proto.onCombo = function(combo) {
	for(var i = 0; i < combo.length; i++) {
		var panel = combo[i];
		panel.renderFlags = JSPDP.Panel.EFlags.Matching;
		this.animatingPanels.push(panel);
	}
};

proto.onPop = function(panel) {
	this.renderPanel(panel);
};

proto.onSwap = function(panels) {
	this.swappingPanels.push(panels[0]);
	this.swappingPanels.push(panels[1]);
};

proto.runTick = function() {
	for(var i = 0; i < this.animatingPanels.length; i++) {
		var panel = this.animatingPanels[i];
		this.renderPanel(panel);
		if(!panel.getFlags(panel.renderFlags)) {
			this.animatingPanels.splice(i--, 1);
		}
	}
	
	if(this.swappingPanels.length) {
		// clear them all first...
		for(var i = 0; i < this.swappingPanels.length; i++) {
			var panel = this.swappingPanels[i];
			this.renderPanel(panel);
			// also redraw stationary panels that may be obstructed by swapping ones
			var other_panel = this.tableau.getPanel(panel.row, panel.col + (panel.getFlags(JSPDP.Panel.EFlags.FromLeft) ? -1 : 1));
			if(other_panel && !other_panel.isSwapping()) {
				this.renderPanel(other_panel);
			}
		}
		// then, draw the swapping panels
		for(var i = this.swappingPanels.length - 1; i >= 0; i--) {
			var panel = this.swappingPanels[i];
			if(panel.isSwapping()) {
				this.renderSwappingPanel(panel);
			} else {
				this.renderPanel(panel);
				this.swappingPanels.splice(i, 1);
			}
		}
	}
	
	++this.tickCount;
	if((this.tickCount & 0xf) == 0) {
		var text = "A: " + this.animatingPanels.length;
		text += " S: " + this.swappingPanels.length;
		text += " C: " + this.tableau.chainLevel;
		this.ctx.save();
		this.ctx.strokeStyle = "rgb(64,64,64)";
		this.ctx.fillStyle = "rgb(255,255,255)";
		this.ctx.clearRect(0, 0, this.canvas.width, 28);
		this.ctx.strokeText(text, 2, 18);
		this.ctx.fillText(text, 2, 18);
		this.ctx.restore();
	}
};
