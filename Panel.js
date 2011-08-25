/*
	Copyright 2011 Brandon Lockaby
	
	This file is part of JSPDP.

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
JSPDP.Panel.prototype = {

	type : 0,
	color : 0,
	
	flags : 0,
	timer : 0,
	comboIndex : 0,
	comboSize : 0,
	chainIndex : 0,

	decrementTimer : function() {
		if(this.timer > 0) {
			--this.timer;
		}
	},
	
	removeFlags : function(flags) {
		this.flags &= ~flags;
	},
	
	getFlags : function(flags) {
		return (this.flags & flags);
	},
	
	addFlags : function(flags) {
		this.flags |= flags;
	},
	
	setTimer : function(flags, timer) {
		this.flags |= flags;
		this.timer = timer;
	},
	
	isAir : function() {
		return (this.type == 0);
	},
	
	isActive : function() {
		return (this.flags != 0);
	},
	
	isFalling : function() {
		return (this.flags & JSPDP.Panel.EFlags.Falling);
	},
	
	isSwapping : function() {
		return (this.flags & JSPDP.Panel.EFlags.Swapping);
	},
	
	isHovering : function() {
		return (this.flags & JSPDP.Panel.EFlags.Hovering);
	},
	
	isChaining : function() {
		return (this.flags & JSPDP.Panel.EFlags.Chaining);
	},
	
	isMatching : function() {
		return (this.flags & JSPDP.Panel.EFlags.Matching);
	},
	
	isPopping : function() {
		return (this.flags & JSPDP.Panel.EFlags.Popping);
	},
	
	isPopped : function() {
		return (this.flags & JSPDP.Panel.EFlags.Popped);
	},
	
	isLanding : function() {
		return (this.flags & JSPDP.Panel.EFlags.Landing);
	},
	
	canHover : function() {
		return !this.isAir() &&
			!(this.flags & (
			JSPDP.Panel.EFlags.Matching |
			JSPDP.Panel.EFlags.Popping |
			JSPDP.Panel.EFlags.Popped |
			
			JSPDP.Panel.EFlags.Hovering |
			JSPDP.Panel.EFlags.Falling |
			JSPDP.Panel.EFlags.Swapping // thx: sharpobject@gmail.com
		));
	},
	
	canMatch : function() {
		return !this.isAir() &&
			!(this.flags & (
			JSPDP.Panel.EFlags.Matching |
			JSPDP.Panel.EFlags.Popping |
			JSPDP.Panel.EFlags.Popped |
			
			JSPDP.Panel.EFlags.Hovering |
			JSPDP.Panel.EFlags.Falling |
			JSPDP.Panel.EFlags.Swapping
		));
	},
	
	canSwap : function() {
		return !(this.flags & (
			JSPDP.Panel.EFlags.Matching |
			JSPDP.Panel.EFlags.Popping |
			JSPDP.Panel.EFlags.Popped |
			
			JSPDP.Panel.EFlags.Hovering |
			JSPDP.Panel.EFlags.DontSwap
		));
	}
	
}
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