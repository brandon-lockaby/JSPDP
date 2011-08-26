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

JSPDP.Canvas2DTableauRenderer = function(tableau) {
	this.tableau = tableau;
	this.canvas = document.createElement("canvas");
	this.canvas.width = 56 * tableau.dimensions.width;
	this.canvas.height = 56 * tableau.dimensions.height;
	this.ctx = this.canvas.getContext('2d');
	this.ctx.font = "16px georgia";
	
	this.panelTex = new Image();
	this.panelTex.src = "themes/alpha/panels.png";
	
	this.tableau.onSetPanel.subscribe(this.onSetPanel.bind(this));
	this.tableau.onSwap.subscribe(this.onSwap.bind(this));
	this.tableau.onLand.subscribe(this.onLand.bind(this));
	this.tableau.onCombo.subscribe(this.onCombo.bind(this));
	this.tableau.onPop.subscribe(this.onPop.bind(this));
	
	this.animatingPanels = [];
	
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
}

JSPDP.Canvas2DTableauRenderer.prototype = {};

JSPDP.Canvas2DTableauRenderer.prototype.tickCount = 0;

JSPDP.Canvas2DTableauRenderer.prototype.renderPanel = function(panel) {
	if(!panel.isAir() && !panel.isPopped()) {
		var x = 56 * panel.col;
		var y = this.canvas.height - (56 * panel.row) - 56;
	
		if(panel.isMatching() && (this.tickCount & 1) && (panel.timer > (this.tableau.durations.match * 0.25))) {
			// render white
			this.ctx.fillRect(x, y, 56, 56);
		} else if(panel.isPopping()) {
			// render gray
			this.ctx.fillStyle = "rgb(64,64,64)";
			this.ctx.fillRect(x, y, 56, 56);
			this.ctx.fillStyle = "rgb(255,255,255)";
		}
		else if(panel.isSwapping()) {
			// render swapping
			var offs = 56 / 4;
			offs *= (4 - panel.timer);
			if(panel.flags & JSPDP.Panel.EFlags.FromLeft) {
				offs = -56 + offs;
			} else {
				offs = 56 - offs;
			}
			this.ctx.drawImage(this.panelTex, 56 * panel.color, 0, 56, 56, x + offs, y, 56, 56);
		} else {
			// render normally
			this.ctx.drawImage(this.panelTex, 56 * panel.color, 0, 56, 56, x, y, 56, 56);
		}
	} else {
		var x = 56 * panel.col;
		var y = this.canvas.height - (56 * panel.row) - 56;
	
		this.ctx.clearRect(x, y, 56, 56);
	}
};

JSPDP.Canvas2DTableauRenderer.prototype.redraw = function() {
	this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	var self = this;
	this.tableau.eachPanel(function(panel) {
		self.renderPanel(panel);
	});
};

JSPDP.Canvas2DTableauRenderer.prototype.onSetPanel = function(panel) {
	this.renderPanel(panel);
};

JSPDP.Canvas2DTableauRenderer.prototype.onSwap = function(duo) {
	duo[0].renderFlags = JSPDP.Panel.EFlags.Swapping;
	this.animatingPanels.push(duo[0]);
	duo[1].renderFlags = JSPDP.Panel.EFlags.Swapping;
	this.animatingPanels.push(duo[1]);
};

JSPDP.Canvas2DTableauRenderer.prototype.onLand = function(panel) {
	panel.renderFlags = JSPDP.Panel.EFlags.Landing;
	this.animatingPanels.push(panel);
};

JSPDP.Canvas2DTableauRenderer.prototype.onCombo = function(combo) {
	for(var i = 0; i < combo.length; i++) {
		var panel = combo[i];
		panel.renderFlags = JSPDP.Panel.EFlags.Matching;
		this.animatingPanels.push(panel);
	}
};

JSPDP.Canvas2DTableauRenderer.prototype.onPop = function(panel) {
	this.renderPanel(panel);
};

JSPDP.Canvas2DTableauRenderer.prototype.runTick = function() {
	for(var i = 0; i < this.animatingPanels.length; i++) {
		var panel = this.animatingPanels[i];
		this.renderPanel(panel);
		if(!panel.getFlags(panel.renderFlags)) {
			this.animatingPanels.splice(i--, 1);
		}
	}
	++this.tickCount;
	if(this.tickCount & 0x111 == 0) {
		this.ctx.clearRect(0, 0, this.canvas.width, 28);
		this.ctx.strokeText(this.animatingPanels.length, 2, 18);
		this.ctx.fillText(this.animatingPanels.length, 2, 18);
	}
};
