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

JSPDP.KeyboardController = function() {
}

var proto = (JSPDP.KeyboardController.prototype = {});

proto.init = function(tableau) {
	this.tableau = tableau;
	
	this.buttons = [];
	
	var kc = JSPDP.KeyboardController;
	this.buttons.push(new kc.Button(kc.EActions.Up, 38));
	this.buttons.push(new kc.Button(kc.EActions.Down, 40));
	this.buttons.push(new kc.Button(kc.EActions.Left, 37));
	this.buttons.push(new kc.Button(kc.EActions.Right, 39));
	this.buttons.push(new kc.Button(kc.EActions.Swap1, 90));
	this.buttons.push(new kc.Button(kc.EActions.Swap2, 88));
	this.buttons.push(new kc.Button(kc.EActions.Lift, 32));
	
	this.position = {
		row: 0,
		col: 0
	};
	
	this.tableau.onActionPhase.subscribe(this.onActionPhase.bind(this));
	
	addEventListener('keydown', this.onKeydown.bind(this));
	addEventListener('keyup', this.onKeyup.bind(this));
	
	return this;
};

proto.onKeydown = function(event) {
	for(var i = 0; i < this.buttons.length; i++) {
		if(event.keyCode == this.buttons[i].key) {
			var button = this.buttons[i];
			if(!button.pressed) {
				button.pressed = true;
				button.lastHandled = false;
			}
			break;
		}
	}
};

proto.onKeyup = function(event) {
	for(var i = 0; i < this.buttons.length; i++) {
		if(event.keyCode == this.buttons[i].key) {
			this.buttons[i].pressed = false;
			break;
		}
	}
};

proto.onActionPhase = function() {
	// check if new keys were pressed, first
	var done = false;
	for(var i = 0; i < this.buttons.length; i++) {
		var button = this.buttons[i];
		if(button.pressed && !button.lastHandled) {
			button.lastHandled = this.tableau.tickCount;
			this.perform(button.action);
			// test: unpress all other buttons
			/*for(var b = 0; b = this.buttons.length; b++) {
				if(this.buttons[b] != button) {
					this.buttons[b].pressed = false;
					this.buttons[b].lastHandled = 0;
				}
			}*/
			done = true;
			break;
		}
	}
	
	// otherwise, possibly repeat action
	if(!done) {
		for(var i = 0; i < this.buttons.length; i++) {
			var button = this.buttons[i];
			if(button.pressed && button.lastHandled) {
				var action = button.action;
				var ea = JSPDP.KeyboardController.EActions;
				if(action == ea.Up || action == ea.Down || action == ea.Left || action == ea.Right) {
					if(this.tableau.tickCount - button.lastHandled >= 25) {
						this.perform(action);
					}
				}
				break;
			}
		}
	}
};

proto.perform = function(action) {
	
	var old_pos = {
		row: this.position.row,
		col: this.position.col
	};

	var ea = JSPDP.KeyboardController.EActions;
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
			break;
		case ea.Lift:
			break;
	}
	
	if(this.position.row < 0)
		this.position.row = 0;
	else if(this.position.row >= this.tableau.dimensions.height)
		this.position.row = this.tableau.dimensions.height - 1;
	
	if(this.position.col < 0)
		this.position.col = 0;
	else if(this.position.col >= this.tableau.dimensions.width - 1)
		this.position.col = this.tableau.dimensions.width - 2;
	
	if(this.position.row != old_pos.row || this.position.col != old_pos.col) {
		// todo: on move...
	}
};

////

JSPDP.KeyboardController.EActions = {
	Up: 1,
	Down: 2,
	Left: 3,
	Right: 4,
	Swap1: 5,
	Swap2: 6,
	Lift: 7
};

JSPDP.KeyboardController.Button = function(action, key) {
	this.action = action;
	this.key = key;
	
	this.pressed = false;
	this.lastHandled = false;
};