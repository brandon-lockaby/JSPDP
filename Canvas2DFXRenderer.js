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
	this.tableau.onCombo.subscribe(this.handleCombo.bind(this));
	
	this.particles = [];
	this.lastTick = -1;
	
	this.cards = [];
	
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

proto.handleCombo = function(combo) {
	var combo_size = combo[0].comboSize;
	var chain_size = combo[0].chainIndex;
	var offset = 0;
	if(combo_size > 3) {
		var text = combo_size;
		var canvas = document.createElement("canvas");
		var ctx = canvas.getContext("2d");
		canvas.height = this.theme.panelDimensions.height;
		var font = Math.floor(this.theme.panelDimensions.height * 0.8) + "px Arial";
		ctx.font = font;
		var width = ctx.measureText(text).width + (this.theme.panelDimensions.width * 0.2);
		offset += width;
		canvas.width = width;
		ctx.font = font;
		ctx.textBaseline = "top";
		ctx.lineWidth = this.theme.panelDimensions.width * 0.08;
		//if(canvas.width < this.theme.panelWidth) canvas.width = this.theme.panelWidth;
		ctx.fillStyle = "red";
		ctx.strokeStyle = "white";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.strokeRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = "white";
		ctx.fillText(text, this.theme.panelDimensions.width * 0.1, this.theme.panelDimensions.height * 0.1);
		
		var canvas_pos = this.canvasPos(combo[0].row, combo[0].col);
		var card = {
			canvas: canvas,
			canvas_pos: canvas_pos,
			born: this.tableau.tickCount
		};
		this.cards.push(card);
	}
	if(chain_size > 1) {
		var text = "x" + chain_size;
		var canvas = document.createElement("canvas");
		var ctx = canvas.getContext("2d");
		canvas.height = this.theme.panelDimensions.height;
		var font = Math.floor(this.theme.panelDimensions.height * 0.8) + "px Arial";
		ctx.font = font;
		var width = ctx.measureText(text).width + (this.theme.panelDimensions.width * 0.2);
		canvas.width = width;
		ctx.font = font;
		ctx.textBaseline = "top";
		ctx.lineWidth = this.theme.panelDimensions.width * 0.08;
		//if(canvas.width < this.theme.panelWidth) canvas.width = this.theme.panelWidth;
		ctx.fillStyle = "green";
		ctx.strokeStyle = "white";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.strokeRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = "white";
		ctx.fillText(text, this.theme.panelDimensions.width * 0.1, this.theme.panelDimensions.height * 0.1);
		
		var canvas_pos = this.canvasPos(combo[0].row, combo[0].col);
		canvas_pos.x += offset;
		var card = {
			canvas: canvas,
			canvas_pos: canvas_pos,
			born: this.tableau.tickCount
		};
		this.cards.push(card);
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
	
	this.ctx.save();
	this.ctx.globalAlpha = 0.75;
	var life = 60;
	for(var i = 0; i < this.cards.length; i++) {
		var card = this.cards[i];
		var ticks = this.tableau.tickCount - card.born;
		var offset = Math.sin((ticks / life) * (Math.PI / 2)) * (this.theme.panelDimensions.height * 0.75);
		this.ctx.drawImage(card.canvas, card.canvas_pos.x, card.canvas_pos.y - offset);
		if(this.tableau.tickCount > card.born + life) {
			this.cards.splice(i--, 1);
		}
	}
	this.ctx.restore();
	
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
