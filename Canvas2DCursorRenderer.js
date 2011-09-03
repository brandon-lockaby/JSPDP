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

JSPDP.Canvas2DCursorRenderer = function() {
};

var proto = (JSPDP.Canvas2DCursorRenderer.prototype = {});

proto.init = function(tableau, keyboard_controller, theme) {
	this.tableau = tableau;
	this.keyboardController = keyboard_controller;
	this.theme = theme;
	this.canvas = document.createElement("canvas");
	this.canvas.className = "cursor";
	this.canvas.width = this.theme.panelDimensions.width * tableau.dimensions.width;
	this.canvas.height = this.theme.panelDimensions.height * tableau.dimensions.height;
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
	
	return this;
}

proto.redraw = function() {
	this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	var x = this.theme.panelDimensions.width * this.keyboardController.position.col;
	var y = this.canvas.height - (this.theme.panelDimensions.height * this.keyboardController.position.row) - this.theme.panelDimensions.height;
	this.ctx.drawImage(this.theme.cursorImage, x, y);
};
