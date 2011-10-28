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

JSPDP.KeyboardCursor = function() {
}

JSPDP.KeyboardCursor.Button = function(key, action) {
	this.key = key;
	this.action = action;
};

var proto = (JSPDP.KeyboardCursor.prototype = new JSPDP.Cursor());

proto.init = function(settings) {
	JSPDP.Cursor.prototype.init.call(this, settings);
	
	this.buttons = [];
	
	var ea = JSPDP.Cursor.EAction;
	var button = JSPDP.KeyboardCursor.Button;
	this.buttons.push(new button(38, ea.Up));
	this.buttons.push(new button(40, ea.Down));
	this.buttons.push(new button(37, ea.Left));
	this.buttons.push(new button(39, ea.Right));
	this.buttons.push(new button(90, ea.Swap1));
	this.buttons.push(new button(88, ea.Swap2));
	this.buttons.push(new button(32, ea.Lift));
	
	addEventListener('keydown', this.onKeydown.bind(this), false);
	addEventListener('keyup', this.onKeyup.bind(this), false);
	document.onmousedown = function() { return false; }; // workaround for keyup misbehavior
	
	return this;
};

proto.onKeydown = function(event) {
	for(var i = 0; i < this.buttons.length; i++) {
		if(event.keyCode == this.buttons[i].key) {
			this.startAction(this.buttons[i].action);
			event.preventDefault();
			break;
		}
	}
};

proto.onKeyup = function(event) {
	for(var i = 0; i < this.buttons.length; i++) {
		if(event.keyCode == this.buttons[i].key) {
			this.stopAction(this.buttons[i].action);
			event.preventDefault();
			break;
		}
	}
};

