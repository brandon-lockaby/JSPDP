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

JSPDP.Panel = function() {
}

var proto = (JSPDP.Panel.prototype = {});

proto.type = 0;
proto.color = 0;
	
proto.row = 0;
proto.col = 0;
	
proto.flags = 0;
proto.timer = 0;
proto.comboIndex = 0;
proto.comboSize = 0;
proto.chainIndex = 0;

proto.decrementTimer = function() {
	if(this.timer > 0) {
		--this.timer;
	}
};

proto.resetFlags = function(flags) {
	this.flags = flags;
};
	
proto.removeFlags = function(flags) {
	this.flags &= ~flags;
};
	
proto.getFlags = function(flags) {
	return (this.flags & flags);
};
	
proto.addFlags = function(flags) {
	this.flags |= flags;
};
	
proto.setTimer = function(flags, timer) {
	this.flags |= flags;
	this.timer = timer;
};
	
proto.isAir = function() {
	return (this.type == 0);
};
	
proto.isActive = function() {
	return (this.flags != 0);
};
	
proto.isFalling = function() {
	return (this.flags & JSPDP.Panel.EFlags.Falling);
};
	
proto.isSwapping = function() {
	return (this.flags & JSPDP.Panel.EFlags.Swapping);
};
	
proto.isHovering = function() {
	return (this.flags & JSPDP.Panel.EFlags.Hovering);
};
	
proto.isChaining = function() {
	return (this.flags & JSPDP.Panel.EFlags.Chaining);
};
	
proto.isMatching = function() {
	return (this.flags & JSPDP.Panel.EFlags.Matching);
};
	
proto.isPopping = function() {
	return (this.flags & JSPDP.Panel.EFlags.Popping);
};
	
proto.isPopped = function() {
	return (this.flags & JSPDP.Panel.EFlags.Popped);
};
	
proto.isLanding = function() {
	return (this.flags & JSPDP.Panel.EFlags.Landing);
};
	
proto.canHover = function() {
	return !this.isAir() &&
		!(this.flags & (
		JSPDP.Panel.EFlags.Matching |
		JSPDP.Panel.EFlags.Popping |
		JSPDP.Panel.EFlags.Popped |
		
		JSPDP.Panel.EFlags.Hovering |
		JSPDP.Panel.EFlags.Falling |
		JSPDP.Panel.EFlags.Swapping // thx: sharpobject@gmail.com
	));
};
	
proto.canMatch = function() {
	return !this.isAir() &&
		!(this.flags & (
		JSPDP.Panel.EFlags.Matching |
		JSPDP.Panel.EFlags.Popping |
		JSPDP.Panel.EFlags.Popped |
		
		JSPDP.Panel.EFlags.Hovering |
		JSPDP.Panel.EFlags.Falling |
		JSPDP.Panel.EFlags.Swapping
	));
};
	
proto.canSwap = function() {
	return !(this.flags & (
		JSPDP.Panel.EFlags.Matching |
		JSPDP.Panel.EFlags.Popping |
		JSPDP.Panel.EFlags.Popped |
		
		JSPDP.Panel.EFlags.Hovering |
		JSPDP.Panel.EFlags.DontSwap
	));
};
	
JSPDP.Panel.EFlags = {
	Swapping : 1,
	FromLeft : 1 << 1,
	DontSwap : 1 << 2,
	Matching : 1 << 3,
	Popping  : 1 << 4,
	Popped   : 1 << 5,
	Hovering : 1 << 6,
	Falling  : 1 << 7,
	Chaining : 1 << 8,
	Landing  : 1 << 9
}
