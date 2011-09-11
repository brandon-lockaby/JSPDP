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

JSPDP.ImageLoader = function() {
};

var proto = (JSPDP.ImageLoader.prototype = {});

proto.init = function(image_paths, complete_callback, progress_callback) {
	var self = this;
	this.complete_callback = complete_callback;
	this.progress_callback = progress_callback;
	
	this.image_map = [];
	this.total = image_paths.length;
	this.complete = 0;
	
	this.progressed();
	
	for(var i = 0; i < image_paths.length; i++) {
		var path = image_paths[i];
		var image = new Image();
		image.src = path;
		if(image.complete) {
			this.onImage(path, image);
		} else {
			image.onload = this.onImage.bind(this, path, image);
			image.onerror = this.onImage.bind(this, path, false);
			image.onabort = image.onerror;
		}
		this.image_map[path] = image;
	}
};

proto.abort = function() {
	var ef = function() {};
	this.complete_callback = ef;
	this.progress_callback = ef;
	for(var i = 0; i < image_map.length; i++) {
		var image = image_map[i];
		if(image.onload) {
			image.onload = ef;
			image.onabort = ef;
			image.onerror = ef;
		}
	}
};

proto.getProgress = function() {
	return {
		total: this.total,
		complete: this.complete,
		percent: (this.complete / this.total) * 100,
		image_map: this.image_map
	};
};

proto.onImage = function(path, image) {
	this.image_map[path] = image;
	this.complete++;
	this.progressed();
};

proto.progressed = function() {
	var progress = this.getProgress();
	if(this.progress_callback) {
		this.progress_callback(progress);
	}
	if(progress.complete == progress.total) {
		if(this.complete_callback) {
			this.complete_callback(progress);
		}
	}
};
