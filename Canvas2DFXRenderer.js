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

JSPDP.Canvas2DFXRenderer = function() {
};

var proto = (JSPDP.Canvas2DFXRenderer.prototype = {});

proto.init = function(tableau, theme) {
	this.tableau = tableau;
	this.theme = theme;
	this.canvas = document.createElement("canvas");
	this.canvas.className = "fx";
	this.canvas.width = this.theme.panelDimensions.width * tableau.dimensions.width;
	this.canvas.height = this.theme.panelDimensions.height * tableau.dimensions.height;
	this.ctx = this.canvas.getContext('2d');
	this.ctx.font = "16px georgia";
	
	this.tableau.onPop.subscribe(this.handlePop.bind(this));
	
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
	
	var self = this;
	function animate() {
		self.redraw();
		requestAnimationFrame(animate);
	}
	requestAnimationFrame(animate);
	
	////
	this.particles = [];
	////
	
	return this;
}

proto.handlePop = function(panel) {
	var x = this.theme.panelDimensions.width * panel.col;
	var y = this.canvas.height - (this.theme.panelDimensions.height * panel.row) - this.theme.panelDimensions.height;
	x += this.theme.panelDimensions.width / 2;
	y += this.theme.panelDimensions.height / 2;
	/* temp */ y -= this.theme.panelDimensions.height * this.tableau.liftOffset;
	for(var i = 0; i < 8; i++) {
		this.particles.push({
			b: this.tableau.tickCount,
			l: 60,
			t: this.tableau.tickCount,
			x: x,
			y: y,
			xv: Math.random() * 5 - 2.5,
			yv: Math.random() * 10 - 5,
			xf: 0,
			yf: 0.1,
			d: 0.99
		});
	}
};

proto.redraw = function() {
	this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	for(var i = 0; i < this.particles.length; i++) {
		var p = this.particles[i];
		for(var t = p.t; t < this.tableau.tickCount; t++) {
			p.x += p.xv;
			p.y += p.yv;
			p.xv = p.xv * p.d + p.xf;
			p.yv = p.yv * p.d + p.yf;
		}
		
		this.ctx.save();
		this.ctx.globalAlpha = 1 - ((p.t - p.b) / p.l);
	
		this.ctx.drawImage(this.theme.duck, p.x, p.y /* temp */ - (this.theme.panelDimensions.height * this.tableau.liftOffset));
		this.ctx.restore();
		
		p.t = this.tableau.tickCount;
		if(p.t - p.b > p.l) {
			this.particles.splice(i--, 1);
		}
	}
};
