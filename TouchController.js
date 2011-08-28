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

var proto = (JSPDP.TouchController.prototype = {});

proto.selection = null;
proto.position = null;
proto.lastSwapTick = -9001;

proto.init = function(tableau, element, panel_width, panel_height) {
	this.tableau = tableau;
	this.element = element;
	this.panelWidth = panel_width;
	this.panelHeight = panel_height;
	
	this.tableau.onActionPhase.subscribe(this.onActionPhase.bind(this));
	addEventListener('mousedown', this.onMousedown.bind(this));
	addEventListener('mouseup', this.onMouseup.bind(this));
	addEventListener('mousemove', this.onMousemove.bind(this));
	
	return this;
};

proto.translatedEvent = function(event) {
	var offx = 0;
	var offy = 0;
	var ele = this.element;
	do{
		offx += ele.offsetLeft;
		offy += ele.offsetTop;
	} while(ele = ele.offsetParent);
	return {x : event.pageX - offx, y : event.pageY - offy};
};

proto.onMousedown = function(event) {
	var coords = this.translatedEvent(event);
	var x = Math.floor(coords.x / this.panelWidth);
	var y = Math.floor(this.tableau.dimensions.height - (coords.y / this.panelHeight));
	var panel = this.tableau.getPanel(y, x);
	if(panel) {
		this.selection = {
			panel : panel,
			x : x,
			y : y
		};
		this.position = {
			x : x,
			y : y
		};
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
		var coords = this.translatedEvent(event);
		var x = Math.floor(coords.x / this.panelWidth);
		var y = Math.floor(this.tableau.dimensions.height - (coords.y / this.panelHeight));
		this.position = {
			x : x,
			y : y
		};
	}
};

proto.onActionPhase = function() {
	if(this.selection) {
		var panel = this.tableau.getPanel(this.selection.y, this.selection.x);
		if(panel != this.selection.panel) {
			this.selection = null;
			return;
		}
		
		if(this.lastSwapTick + 3 >= this.tableau.tickCount) {
			return;
		}
		
		if(this.position.x != this.selection.x) {
			var from_left = this.position.x > this.selection.x;
			var other_x = this.selection.x + (from_left ? 1 : -1);
			var other_panel = this.tableau.getPanel(this.selection.y, other_x);
			
			if(panel && other_panel) {
				if(!panel.isFalling() && !other_panel.isFalling()) {
					if(this.tableau.swap(this.selection.y, this.selection.x, from_left)) {
						this.lastSwapTick = this.tableau.tickCount;
						this.selection = {
							panel : panel,
							x : other_x,
							y : this.selection.y
						};
					}
				}
			}
		}
	}
};
