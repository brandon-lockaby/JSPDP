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

JSPDP.GraphicsTheme = function() {
};

var proto = (JSPDP.GraphicsTheme.prototype = {});

proto.init = function() {
	// events
	this.onload = new JSPDP.Event();
	
	// default panel images
	this.panelDimensions = {
		width: 56,
		height: 56
	};
	this.panelImages = [];
	var panelTex = new Image();
	panelTex.src = "themes/alpha/panels.png";
	
	var render_panels = function() {
		for(var i = 0; i < 5; i++) {
			var c = document.createElement("canvas");
			c.width = this.panelDimensions.width;
			c.height = this.panelDimensions.height;
			c.getContext("2d").drawImage(panelTex,
				this.panelDimensions.width * i, 0,
				this.panelDimensions.width, this.panelDimensions.height,
				0, 0,
				this.panelDimensions.width, this.panelDimensions.height);
			this.panelImages[i] = c;
		}
		this.onload.fire();
	};
	if(panelTex.complete) {
		render_panels();
	} else {
		panelTex.onload = render_panels.bind(this);
	}
	return this;
};
