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

JSPDP.Cursor = function() {
};

JSPDP.Cursor.EAction = {
	Up: 0,
	Down: 1,
	Left: 2,
	Right: 3,
	Swap1: 4,
	Swap2: 5,
	Lift: 6,
	LENGTH: 7
};

var proto = (JSPDP.Cursor.prototype = new JSPDP.TableauUI());

proto.init = function(settings) {
	JSPDP.TableauUI.prototype.init.call(this, settings);
	
	this.position = {
		row: 0,
		col: 0
	};
	
	this.actions = new Array(JSPDP.Cursor.EAction.LENGTH);
	for(var i = 0; i < JSPDP.Cursor.EAction.LENGTH; i++)
		this.actions[i] = 0;
	
	// events
	this.onStartAction = new JSPDP.Event();
	this.onStopAction = new JSPDP.Event();
	
	// subscribe to events
	this.tableau.onActionPhase.subscribe(this.handleActionPhase.bind(this));
	if(this.tableau.onRise) {
		this.tableau.onRise.subscribe(this.handleRise.bind(this));
	}
	if(this.tableau.onRow) {
		this.tableau.onRow.subscribe(this.handleRow.bind(this));
	}
	
	// set up for rendering
	var c = document.createElement("canvas");
	c.width = this.panelDimensions.width * 2;
	c.height = this.panelDimensions.height;
	c.getContext("2d").drawImage(this.theme.cursorImage,
		0, 0,
		c.width, c.height);
	this.cursorImage = c;

	this.canvas = this.createCanvas();
	this.ctx = this.canvas.getContext('2d');
	
	return this;
};

proto.moveTo = function(row, col) {
	if(!this.tableau.bounds(row, col)) return false;
	this.position.row = row;
	this.position.col = col;
	this.moved = true;
	this.stopMovement();
	return true;
};

proto.startAction = function(action) {
	if(!this.actions[action]) {
		var ea = JSPDP.Cursor.EAction;
		if(action == ea.Up || action == ea.Down
			|| action == ea.Left || action == ea.Right) {
			this.stopMovement();
		}
		this.actions[action] = 1;
		this.onStartAction.fire(action);
	}
};

proto.stopAction = function(action) {
	if(this.actions[action]) {
		this.actions[action] = 0;
		this.onStopAction.fire(action);
	}
};

proto.stopMovement = function() {
	var ea = JSPDP.Cursor.EAction;
	this.stopAction(ea.Up);
	this.stopAction(ea.Down);
	this.stopAction(ea.Left);
	this.stopAction(ea.Right);
};

// event handlers

proto.handleActionPhase = function() {
	// perform actions
	for(var action = 0; action < JSPDP.Cursor.EAction.LENGTH; action++) {
		if(!this.actions[action]) continue;

		var rep = this.actions[action]++;
		
		// everything but Lift given a delay
		if(action != JSPDP.Cursor.EAction.Lift) {
			if(rep != 1 && rep < 16) {
				continue;
			}
		}

		var old_pos = {
			row: this.position.row,
			col: this.position.col
		};

		var ea = JSPDP.Cursor.EAction;
		switch(action) {
			case ea.Up:
				this.position.row++;
				break;
			case ea.Down:
				this.position.row--;
				break;
			case ea.Left:
				this.position.col--;
				break;
			case ea.Right:
				this.position.col++;
				break;
			case ea.Swap1:
			case ea.Swap2:
				this.tableau.swap(this.position.row, this.position.col, true);
				this.stopAction(JSPDP.Cursor.EAction.Swap1);
				this.stopAction(JSPDP.Cursor.EAction.Swap2);
				break;
			case ea.Lift:
				if(this.tableau instanceof JSPDP.RisingTableau) {
					this.tableau.lift();
				}
				break;
		}
		
		// constrain position
		
		var top_row = this.tableau.dimensions.height - 1 - Math.ceil(this.tableau.riseOffset);
		
		if(this.position.row < 0)
			this.position.row = 0;
		else if(this.position.row > top_row) {
			this.position.row = top_row;
		}
		
		if(this.position.col < 0)
			this.position.col = 0;
		else if(this.position.col >= this.tableau.dimensions.width - 1)
			this.position.col = this.tableau.dimensions.width - 2;
			
		// flag this as having moved
		
		if(this.position.row != old_pos.row || this.position.col != old_pos.col) {
			this.moved = true;
		}
	}
};

proto.handleRise = function() {
	var top_row = this.tableau.dimensions.height - 1 - Math.ceil(this.tableau.riseOffset);
	if(this.position.row > top_row) {
		this.position.row = top_row;
		this.moved = true;
	}
};

proto.handleRow = function() {
	this.position.row++;
	var top_row = this.tableau.dimensions.height - 1 - Math.ceil(this.tableau.riseOffset);
	if(this.position.row > top_row)
		this.position.row = top_row;
	this.moved = true;
};

// rendering

proto.moved = false;

proto.refresh = function() {
	this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	var canvas_pos = this.canvasPos(this.position.row, this.position.col);
	this.ctx.drawImage(this.cursorImage, canvas_pos.x, canvas_pos.y);
};

proto.update = function() {
	if(this.moved) {
		this.refresh(); // todo: clear a smaller area?
		this.moved = false;
		return true;
	}
	return false;
};

proto.draw = function(ctx) {
	ctx.drawImage(this.canvas, 0, this.riseOffset());
};
