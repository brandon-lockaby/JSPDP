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

	// Events
	
	this.onload = new JSPDP.Event();
	
	// Fields
	
	this.panelDimensions = {
		width: 56,
		height: 56
	};
	
	this.panelImages = [];
	
	
	// load default images
	
	var image_paths = [
		"themes/alpha/panels.png"
	];
	var self = this;
	new JSPDP.ImageLoader().init(image_paths, function(progress) {
		if(console) console.log("Images loaded: ", progress);
		
		// render individual panel images
		var panels_image = progress.image_map["themes/alpha/panels.png"];
		for(var i = 0; i < 5; i++) {
			var c = document.createElement("canvas");
			c.width = self.panelDimensions.width;
			c.height = self.panelDimensions.height;
			c.getContext("2d").drawImage(panels_image,
				self.panelDimensions.width * i, 0,
				self.panelDimensions.width, self.panelDimensions.height,
				0, 0,
				self.panelDimensions.width, self.panelDimensions.height);
			self.panelImages[i] = c;
		}
		
		self.onload.fire();
		
	}, function(progress) {
		if(console) console.log("Loading images... ", progress);
	});
	
	return this;
};
