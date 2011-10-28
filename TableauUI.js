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

JSPDP.TableauUI = function() {
};

var proto = (JSPDP.TableauUI.prototype = {});

proto.init = function(settings) {
	this.tableau = settings.tableau;
	this.theme = settings.theme;
	this.element = settings.element;
	this.panelDimensions = settings.panelDimensions;
	
	return this;
};

proto.createCanvas = function() {
	var canvas = document.createElement("canvas");
	canvas.width = this.panelDimensions.width * this.tableau.dimensions.width;
	canvas.height = this.panelDimensions.height * this.tableau.dimensions.height;
	if(this.tableau instanceof JSPDP.RisingTableau) {
		canvas.height += this.panelDimensions.height;
	}
	return canvas;
};

proto.canvasPos = function(row, col) {
	var y = (this.panelDimensions.height * this.tableau.dimensions.height) - (this.panelDimensions.height * (row + 1));
	return {
		x: this.panelDimensions.width * col,
		y: y
	}
};

proto.tableauPos = function(x, y) {
	return {
		row: this.tableau.dimensions.height - 1 - Math.floor(y / this.panelDimensions.height),
		col: Math.floor(x / this.panelDimensions.width)
	};
};

proto.riseOffset = function() {
	return this.tableau instanceof JSPDP.RisingTableau ? -(this.panelDimensions.height * this.tableau.riseOffset) : 0;
};

proto.translate = function(x, y) {
	var offx = 0;
	var offy = 0;
	var ele = this.element;
	do {
		offx += ele.offsetLeft;
		offy += ele.offsetTop;
	} while(ele = ele.offsetParent);
	return {
		x: x - offx,
		y: y - offy
	};
};

proto.refresh = function() {
};

proto.update = function() {
	return false;
};

proto.draw = function(ctx) {
};
