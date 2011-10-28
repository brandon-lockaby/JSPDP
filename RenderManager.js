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

JSPDP.RenderManager = function() {
};

var proto = (JSPDP.RenderManager.prototype = new JSPDP.TableauUI());

proto.init = function(settings, renderer_classes) {
	JSPDP.TableauUI.prototype.init.call(this, settings);
	
	this.canvas = this.createCanvas();
	if(this.tableau instanceof JSPDP.RisingTableau) {
		this.canvas.height -= this.panelDimensions.height;
	}
	this.ctx = this.canvas.getContext('2d');
	
	settings.element = this.canvas;
	
	this.renderers = [];
	if(typeof(renderer_classes) != 'undefined') {
		for(var i = 0; i < renderer_classes.length; i++) {
			this.renderers.push(new renderer_classes[i]().init(settings));
		}
	}
	
	this.lastTick = this.tableau.tickCount;
	
	return this;
};

proto.get = function(t) {
	for(var i in this.renderers) {
		if(this.renderers[i] instanceof t) {
			return this.renderers[i];
		}
	}
};

proto.start = function() {
	this.running = true;
	this.refresh();
	
	var requestAnimationFrame = (function(){
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
	var self = this;
	var run = function() {
		self.draw();
		if(self.running) requestAnimationFrame(run);
	};
	requestAnimationFrame(run);
};

proto.stop = function() {
	this.running = false;
};

proto.refresh = function() {
	this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	for(var i = 0; i < this.renderers.length; i++) {
		var renderer = this.renderers[i];
		renderer.refresh();
		renderer.draw(this.ctx);
	}
};

proto.draw = function() {
	if(this.tableau.tickCount != this.lastTick) {
		this.lastTick = this.tableau.tickCount;
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		for(var i = 0; i < this.renderers.length; i++) {
			var renderer = this.renderers[i];
			renderer.update()
			renderer.draw(this.ctx);
		}
	}
};
