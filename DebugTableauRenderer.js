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

JSPDP.DebugTableauRenderer = function(tableau) {
	this.tableau = tableau;
	this.canvas = document.createElement("canvas");
	this.canvas.width = 56 * tableau.dimensions.width;
	this.canvas.height = 56 * tableau.dimensions.height;
	this.ctx = this.canvas.getContext('2d');
	this.ctx.font = "16px georgia";
	
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
				window.setTimeout(callback, 1000/60);                
			}
	})();
	
	var self = this;
	function animate() {
		self.redraw();
		requestAnimationFrame(animate);
	}
	requestAnimationFrame(animate);
	
	this.panelTex = new Image();
	this.panelTex.src = "themes/alpha/panels.png";
	
	//this.tableau.onActive.subscribe(function() { console.log("onActive"); });
	//this.tableau.onInactive.subscribe(function() { console.log("onInactive"); });
	//this.tableau.onSwap.subscribe(function() { console.log("onSwap"); });
	//this.tableau.onMatch.subscribe(function() { console.log("onMatch"); });
	//this.tableau.onPop.subscribe(function() { console.log("onPop"); });
	//this.tableau.onLand.subscribe(function() { console.log("onLand"); });
}
JSPDP.DebugTableauRenderer.prototype = {
	tickCount : 0,

	fillStyles : {
		0 : "rgb(255,0,0)",
		1 : "rgb(0,255,0)",
		2 : "rgb(0,0,255)",
		3 : "rgb(200,0,255)",
		4 : "rgb(128,200,255)"
	},
	
	redraw : function() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.lineWidth = 1;
		this.ctx.fillStyle = "rgb(255,255,255)";
		this.ctx.strokeStyle = "rgb(0,0,0)";
		this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
		var x, y;
		var self = this;
		this.tableau.eachPanel(function(panel, row, col) {
			x = 56 * col;
			y = self.canvas.height - (56 * row) - 56;
			
			if(!panel.isAir() && !panel.isPopped()) {
				if(panel.isMatching() && (self.tickCount & 1) && (panel.timer > (self.tableau.durations.match * 0.25))) {
					//self.ctx.drawImage(self.panelTex, 56 * panel.color, 0, 56, 56, x, y, 56, 56);
					self.ctx.fillStyle = "rgb(255,255,255)";
					self.ctx.fillRect(x, y, 56, 56);
				} else if(panel.isSwapping()) {
					var offs = 56 / 4;
					offs *= (4 - panel.timer);
					if(panel.flags & JSPDP.Panel.EFlags.FromLeft) {
						offs = -56 + offs;
					} else {
						offs = 56 - offs;
					}
					self.ctx.drawImage(self.panelTex, 56 * panel.color, 0, 56, 56, x + offs, y, 56, 56);
				} else {
					self.ctx.drawImage(self.panelTex, 56 * panel.color, 0, 56, 56, x, y, 56, 56);
				}
			}
			
			var f = "";
			if(panel.isSwapping()) f += "s";
			if(panel.isMatching()) f += "m";
			if(panel.isPopping()) f += "p";
			if(panel.isPopped()) f += ".";
			if(panel.isHovering()) f += "h";
			if(panel.isFalling()) f += "f";
			if(panel.isChaining()) f += "c";
			if(panel.isLanding()) f += "l";
			if(panel.getFlags(JSPDP.Panel.EFlags.DontSwap)) f += "d";
			self.ctx.strokeText(f, x + 16, y + 16);
			self.ctx.fillText(f, x + 16, y + 16);
			if(panel.timer) {
				self.ctx.strokeText(panel.timer, x + 16, y + 32);
				self.ctx.fillText(panel.timer, x + 16, y + 32);
			}
		});
		self.ctx.strokeText(this.tableau.chainLevel, 2, 18);
		self.ctx.fillText(this.tableau.chainLevel, 2, 18);
		++this.tickCount;
	}
};
