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
	
	this.onSelect = new JSPDP.Event();
	
	this.tableau.onActionPhase.subscribe(this.onActionPhase.bind(this));
	if(this.tableau instanceof JSPDP.RisingTableau) {
		this.tableau.onRow.subscribe(this.handleRow.bind(this));
	}
	addEventListener('mousedown', this.onMousedown.bind(this), false);
	addEventListener('touchstart', this.onMousedown.bind(this), false);
	addEventListener('mouseup', this.onMouseup.bind(this), false);
	addEventListener('touchend', this.onMouseup.bind(this), false);
	addEventListener('mousemove', this.onMousemove.bind(this), false);
	addEventListener('touchmove', this.onMousemove.bind(this), false);
	addEventListener('mousewheel', this.onMousewheel.bind(this), false);
	addEventListener('DOMMouseScroll', this.onMousewheel.bind(this), false);
	
	return this;
};

proto.onMousedown = function(event) {
	var x = event.changedTouches ? event.changedTouches[0].pageX : event.pageX;
	var y = event.changedTouches ? event.changedTouches[0].pageY : event.pageY;
	var canvas_pos = this.translate(x, y);
	canvas_pos.y -= this.riseOffset();
	var tableau_pos = this.tableauPos(canvas_pos.x, canvas_pos.y);
	var panel = this.tableau.getPanel(tableau_pos.row, tableau_pos.col);
	if(panel) {
		this.selection = {
			panel : panel,
			tableau_pos: tableau_pos
		};
		this.tableau_pos = tableau_pos;
		this.onSelect.fire(this.selection);
	}
	else {
		this.selection = null;
	}
	event.preventDefault();
};
	
proto.onMouseup = function(event) {
	this.selection = null;
};
	
proto.onMousemove = function(event) {
	if(this.selection) {
		var x = event.changedTouches ? event.changedTouches[0].pageX : event.pageX;
		var y = event.changedTouches ? event.changedTouches[0].pageY : event.pageY;
		var canvas_pos = this.translate(x, y);
		canvas_pos.y -= this.riseOffset();
		this.tableau_pos = this.tableauPos(canvas_pos.x, canvas_pos.y);
	}
	event.preventDefault();
};

proto.onMousewheel = function(event) {
	var delta = event.wheelDelta ? event.wheelDelta * ((!!window.opera) ? -1 : 1) : event.detail * -1;
	if(delta !== 0) {
		if(this.tableau instanceof JSPDP.RisingTableau) {
			this.tableau.lift();
			event.preventDefault();
		}
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
