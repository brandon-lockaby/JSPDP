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

JSPDP.Event = function() {
	this.subscribers = new Array();
}
JSPDP.Event.prototype = {
	subscribe : function(func) {
		this.subscribers.push(func);
	},
	
	unsubscribe : function(func) {
		for(var i = 0; i < this.subscribers.length; i++) {
			if(this.subscribers[i] == func) {
				this.subscribers.splice(i, 1);
				return;
			}
		}
	},
	
	fire : function() {
		for(var i = 0; i < this.subscribers.length; i++) {
			this.subscribers[i].apply(this, arguments);
		}
	}
}
