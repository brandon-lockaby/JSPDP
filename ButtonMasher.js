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

proto.init = function(tableau, cursor) {
	this.tableau = tableau;
	this.cursor = cursor;
	
	return this;
};

proto.runTick = function() {
	var highest = -1;
	this.tableau.eachPanel(function(panel) {
		if(!panel.isAir() && panel.row > highest) highest = panel.row;
	});
	
	if(!this.tableau.active && highest < 10) {
		this.cursor.startAction(JSPDP.Cursor.EAction.Lift);
	} else {
		var behavior = 1;
		if(behavior == 0) {
			var row = Math.floor(Math.random() * (this.tableau.dimensions.height - 1));
			var col = Math.floor(Math.random() * (this.tableau.dimensions.width - 1));
			this.cursor.moveTo(row, col);
			this.cursor.startAction(JSPDP.Cursor.EAction.Swap1);
		} else if(behavior == 1) {
			var action = Math.ceil(Math.random() * JSPDP.Cursor.EAction.LENGTH);
			this.cursor.startAction(action);
		}
	}
};
