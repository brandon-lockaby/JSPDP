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

var proto = (JSPDP.RenderManager.prototype = {});

proto.init = function(renderers) {
	this.renderers = [];
	if(typeof(layers) != 'undefined')
		this.renderers = renderers;
		
	this.run = JSPDP.RenderManager.prototype.run.bind(this);
	
	return this;
};

proto.start = function() {
	this.running = true;
	this.redraw();
	this.run();
};

proto.stop = function() {
	this.running = false;
};

proto.redraw = function() {
	this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	for(var i = 0; i < this.renderers.length; i++) {
		var renderer = this.renderers[i];
		renderer.redraw.call(renderer, this.ctx);
	}
};

proto.draw = function() {
	for(var i = 0; i < this.renderers.length; i++) {
		var renderer = this.renderers[i];
		renderer.draw.call(renderer, this.ctx);
	}
};

proto.requestAnimationFrame = (function(){
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

proto.run = function() {
	this.draw();
	if(this.running) this.requestAnimationFrame(this.run);
};
