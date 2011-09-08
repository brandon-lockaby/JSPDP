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

JSPDP.TouchController = function() {
}

var proto = (JSPDP.TouchController.prototype = new JSPDP.TableauUI());

proto.selection = null;
proto.position = null;
proto.lastSwapTick = -9001;

proto.init = function(settings) {
	JSPDP.TableauUI.prototype.init.call(this, settings);
	console.log(settings);
	console.log(this.tableau);
	
	this.tableau.onActionPhase.subscribe(this.onActionPhase.bind(this));
	if(this.tableau instanceof JSPDP.RisingTableau) {
		this.tableau.onRow.subscribe(this.handleRow.bind(this));
	}
	addEventListener('mousedown', this.onMousedown.bind(this));
	addEventListener('mouseup', this.onMouseup.bind(this));
	addEventListener('mousemove', this.onMousemove.bind(this));
	
	return this;
};

proto.onMousedown = function(event) {
	var canvas_pos = this.translate(event.pageX, event.pageY);
	canvas_pos.y -= this.riseOffset();
	var tableau_pos = this.tableauPos(canvas_pos.x, canvas_pos.y);
	var panel = this.tableau.getPanel(tableau_pos.row, tableau_pos.col);
	if(panel) {
		this.selection = {
			panel : panel,
			tableau_pos: tableau_pos
		};
		this.tableau_pos = tableau_pos;
	}
	else {
		this.selection = null;
	}
};
	
proto.onMouseup = function(event) {
	this.selection = null;
};
	
proto.onMousemove = function(event) {
	if(this.selection) {
		var canvas_pos = this.translate(event.pageX, event.pageY);
		canvas_pos.y -= this.riseOffset();
		this.tableau_pos = this.tableauPos(canvas_pos.x, canvas_pos.y);
	}
};

proto.onActionPhase = function() {
	if(!this.selection) return;
	
	var panel = this.tableau.getPanel(this.selection.tableau_pos.row, this.selection.tableau_pos.col);
	if(panel != this.selection.panel) {
		this.selection = null;
		return;
	}
	
	if(this.lastSwapTick + 3 >= this.tableau.tickCount) return;
	if(this.tableau_pos.col == this.selection.tableau_pos.col) return;
	
	var from_left = this.tableau_pos.col > this.selection.tableau_pos.col;
	var other_x = this.selection.tableau_pos.col + (from_left ? 1 : -1);
	var other_panel = this.tableau.getPanel(this.selection.tableau_pos.row, other_x);
	
	if(!panel || !other_panel) return;
	if(panel.isFalling() || other_panel.isFalling()) return;
		
	if(this.tableau.swap(this.selection.tableau_pos.row, this.selection.tableau_pos.col, from_left)) {
		this.lastSwapTick = this.tableau.tickCount;
		this.selection = {
			panel : panel,
			tableau_pos: {
				col : other_x,
				row : this.selection.tableau_pos.row
			}
		};
	}
};

proto.handleRow = function() {
	if(this.tableau_pos) {
		this.tableau_pos.row++;
	}
	if(this.selection) {
		this.selection.tableau_pos.row++;
	}
};

proto.refresh = function() {
};

proto.update = function() {
	return false;
};

proto.draw = function(ctx) {
};
