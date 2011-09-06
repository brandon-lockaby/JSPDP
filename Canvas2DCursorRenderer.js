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

var proto = (JSPDP.Canvas2DCursorRenderer.prototype = new JSPDP.TableauUI());

proto.init = function(settings) {
	JSPDP.TableauUI.init.call(this, settings);
	this.cursor = settings.cursor;
	
	this.canvas = this.createCanvas();
	this.ctx = this.canvas.getContext('2d');
	
	return this;
}

// TODO: THESE

proto.redraw = function() {
	this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	var x = this.theme.panelDimensions.width * this.cursor.position.col;
	var y = this.canvas.height - (this.theme.panelDimensions.height * this.cursor.position.row) - this.theme.panelDimensions.height;
	/* temp */ y -= this.theme.panelDimensions.height * this.tableau.riseOffset;
	this.ctx.drawImage(this.theme.cursorImage, x, y);
};

proto.draw = function() {
	this.redraw(); // todo: be smart
	
	ctx.drawImage(this.canvas, 0, this.riseOffset());
};
