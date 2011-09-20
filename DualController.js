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

JSPDP.DualController = function() {
}

var proto = (JSPDP.DualController.prototype = new JSPDP.TableauUI());

proto.init = function(settings) {
	JSPDP.TableauUI.prototype.init.call(this, settings);
	
	this.keyboardController = new JSPDP.KeyboardController().init(settings);
	this.touchController = new JSPDP.TouchController().init(settings);
	
	this.touchController.onSelect.subscribe(this.handleSelect.bind(this));
	this.tableau.onSwap.subscribe(this.handleSwap.bind(this));
	
	return this;
};

proto.handleSelect = function(selection) {
	var row = selection.tableau_pos.row;
	var col = selection.tableau_pos.col;
	
	if(col > 0 && col > this.keyboardController.position.col) {
		--col;
	}
	
	if(!this.tableau.bounds(row, col + 1)) --col;
	if(!this.tableau.bounds(row, col)) return;
	
	this.keyboardController.moveTo(row, col);
};

proto.handleSwap = function(panels) {
	var row = panels[0].row;
	var col = panels[0].col;
	if(panels[1].col < col) col = panels[1].col;
	this.keyboardController.moveTo(row, col);
};

proto.refresh = function() {
	this.keyboardController.refresh();
};

proto.update = function() {
	return this.keyboardController.update();
};

proto.draw = function(ctx) {
	this.keyboardController.draw(ctx);
};
