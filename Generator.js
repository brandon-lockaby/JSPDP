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

proto.generateField = function(radix, total, max_height, wrapped) {
	var columns = [];
	for(var i = 0; i < this.width; i++) {
		columns.push([]);
	}
	
	var sg = function(arr, i) {
		if(typeof arr != 'object') return undefined;
		if(typeof arr.length == 'undefined') return undefined;
		if(i < 0) i = arr.length + i;
		if(i < 0) return undefined;
		if(arr.length <= i) return undefined;
		return arr[i];
	};
	var sgp = sg;
	if(!wrapped) {
		sgp = function(arr, i) {
			if(i < 0) return undefined;
			return sg(arr, i);
		};
	}
	
	for(var i = 0; i < total; i++) {
		var col = Math.floor(Math.random() * this.width);
		var column = columns[col];
		if(column.length >= max_height) {
			--i;
			continue;
		}
		
		var row = -(column.length + 1);
		var a = sg(sgp(columns, col - 2), row);
		var b = sg(sgp(columns, col - 1), row);
		var c = sg(sgp(columns, col + 1), row);
		var d = sg(sgp(columns, col + 2), row);
		
		var color;
		do {
			color = Math.floor(Math.random() * radix);
		} while(
			(sg(column, 0) == color && sg(column, 1) == color)
			|| (a == b && b == color)
			|| (b == color && c == color)
			|| (c == color && d == color)
		);
		column.unshift(color);
	}
	
	var rows = [];
	for(var i = 0; i < max_height; i++) {
		var row = []
		for(var c = 0; c < this.width; c++) {
			row.push(sg(columns[c], -(i + 1)));
		}
		rows.push(row);
	}
	
	this.history[1] = rows[2];
	this.history[0] = rows[1];
	this.current = rows[0];
	
	return rows;
};

proto.generateFieldTA = function(radix) {
	return this.generateField(radix, 30, 6, false);
};

proto.generateFieldPDPDS = function(radix) {
	return this.generateField(radix, 24, 5, false);
};
