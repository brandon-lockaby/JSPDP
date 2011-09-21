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

JSPDP.ButtonMasher = function() {
}

var proto = (JSPDP.ButtonMasher.prototype = {});

proto.init = function(tableau, keyboard_controller) {
	this.tableau = tableau;
	this.keyboardController = keyboard_controller;
	
	return this;
};

proto.runTick = function() {
	var highest = -1;
	this.tableau.eachPanel(function(panel) {
		if(!panel.isAir() && panel.row > highest) highest = panel.row;
	});
	if(highest < 10) {
		this.keyboardController.perform(JSPDP.KeyboardController.EActions.Lift);
	} else {
		var row = Math.floor(Math.random() * (this.tableau.dimensions.height - 1));
		var col = Math.floor(Math.random() * (this.tableau.dimensions.width - 1));
		this.keyboardController.moveTo(row, col);
		this.keyboardController.perform(JSPDP.KeyboardController.EActions.Swap1);
	}
};
