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

JSPDP.Generator = function() {
}

var proto = (JSPDP.Generator.prototype = {});

proto.init = function(width) {
	this.width = width;
	this.history = [];
	for(var i = 0; i < 2; i++) {
		var row = new Array(width);
		for(var b = 0; b < 2; b++) {
			row[b] = -1;
		}
		this.history.push(row);
	}
	this.current = new Array(width);
	for(var i = 0; i < width; i++) {
		this.current[i] = -1;
	}
	return this;
};

proto.generateRow = function(radix) {
	this.history[1] = this.history[0];
	this.history[0] = this.current;
	for(var i = 0; i < this.width; i++) {
		var color;
		do {
			color = Math.floor(Math.random() * radix);
		} while(
			(this.history[0][i] == color && this.history[0][i] == this.history[1][i])
			|| (i >= 2 && this.current[i - 1] == color && this.current[i - 2] == this.current[i - 1])
		);
		this.current[i] = color;
	}
};
