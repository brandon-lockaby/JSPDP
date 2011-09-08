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

var proto = (JSPDP.Canvas2DFXRenderer.prototype = new JSPDP.TableauUI());

proto.init = function(settings) {
	JSPDP.TableauUI.prototype.init.call(this, settings);
	
	this.canvas = this.createCanvas();
	this.ctx = this.canvas.getContext('2d');
	
	this.tableau.onPop.subscribe(this.handlePop.bind(this));
	
	this.particles = [];
	this.lastTick = -1;
	
	return this;
}

proto.handlePop = function(panel) {
	var canvas_pos = this.canvasPos(panel.row, panel.col);
	canvas_pos.x += this.theme.panelDimensions.width / 2;
	canvas_pos.y += this.theme.panelDimensions.height / 2;
	for(var i = 0; i < 8; i++) {
		this.particles.push({
			b: this.tableau.tickCount,
			l: 60,
			t: this.tableau.tickCount,
			x: canvas_pos.x,
			y: canvas_pos.y,
			xv: Math.random() * 5 - 2.5,
			yv: Math.random() * 10 - 5,
			xf: 0,
			yf: 0.1,
			d: 0.99
		});
	}
};

proto.refresh = function() {
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
	
		this.ctx.drawImage(this.theme.duck, p.x, p.y);
		this.ctx.restore();
		
		p.t = this.tableau.tickCount;
		if(p.t - p.b > p.l) {
			this.particles.splice(i--, 1);
		}
	}
};

proto.update = function() {
	if(this.tableau.tickCount != this.lastTick) {
		this.lastTick = this.tableau.tickCount;
		this.refresh();
		return true;
	}
	return false;
};

proto.draw = function(ctx) {
	ctx.drawImage(this.canvas, 0, this.riseOffset());
};
