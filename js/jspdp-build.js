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

function JSPDP() {};

if(!Function.prototype.bind) {
	Function.prototype.bind = function() {
		var fn = this, args = Array.prototype.slice.call(arguments), object = args.shift();
		return function() {
			return fn.apply(object, args.concat(Array.prototype.slice.call(arguments)));
		};
	};
}
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

// todo:
/*proto.abort = function() {
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
};*/

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

proto.init = function(path, handle_load) {

	// Events
	
	this.onload = new JSPDP.Event();
	this.onload.subscribe(handle_load);
	
	// Fields
	
	this.path = path;
	
	this.panelDimensions = {
		width: 64,
		height: 64
	};
	
	this.panelImages = [];
	
	
	// load images
	
	var image_paths = [
		this.path + "/panels.png",
		this.path + "/yellow-duck.png",
		this.path + "/cursor.png"
	];
	var self = this;
	new JSPDP.ImageLoader().init(image_paths, function(progress) {
		if(console) console.log("Images loaded: ", progress);
		
		// render individual panel images
		var panels_image = progress.image_map[self.path + "/panels.png"];
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
		
		// test test
		self.cursorImage = progress.image_map[self.path + "/cursor.png"];
		self.duck = progress.image_map[self.path + "/yellow-duck.png"];
		
		self.onload.fire();
		
	}, function(progress) {
		if(console) console.log("Loading images... ", progress);
	});
	
	return this;
};

/*
  I've wrapped Makoto Matsumoto and Takuji Nishimura's code in a namespace
  so it's better encapsulated. Now you can have multiple random number generators
  and they won't stomp all over eachother's state.
  
  If you want to use this as a substitute for Math.random(), use the random()
  method like so:
  
  var m = new MersenneTwister();
  var randomNumber = m.random();
  
  You can also call the other genrand_{foo}() methods on the instance.

  If you want to use a specific seed in order to get a repeatable random
  sequence, pass an integer into the constructor:

  var m = new MersenneTwister(123);

  and that will always produce the same random sequence.

  Sean McCullough (banksean@gmail.com)
*/

/* 
   A C-program for MT19937, with initialization improved 2002/1/26.
   Coded by Takuji Nishimura and Makoto Matsumoto.
 
   Before using, initialize the state by using init_genrand(seed)  
   or init_by_array(init_key, key_length).
 
   Copyright (C) 1997 - 2002, Makoto Matsumoto and Takuji Nishimura,
   All rights reserved.                          
 
   Redistribution and use in source and binary forms, with or without
   modification, are permitted provided that the following conditions
   are met:
 
     1. Redistributions of source code must retain the above copyright
        notice, this list of conditions and the following disclaimer.
 
     2. Redistributions in binary form must reproduce the above copyright
        notice, this list of conditions and the following disclaimer in the
        documentation and/or other materials provided with the distribution.
 
     3. The names of its contributors may not be used to endorse or promote 
        products derived from this software without specific prior written 
        permission.
 
   THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
   "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
   LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
   A PARTICULAR PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT OWNER OR
   CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
   EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
   PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
   PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
   LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
   NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
   SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 
 
   Any feedback is very welcome.
   http://www.math.sci.hiroshima-u.ac.jp/~m-mat/MT/emt.html
   email: m-mat @ math.sci.hiroshima-u.ac.jp (remove space)
*/

var MersenneTwister = function(seed) {
  if (seed == undefined) {
    seed = new Date().getTime();
  } 
  /* Period parameters */  
  this.N = 624;
  this.M = 397;
  this.MATRIX_A = 0x9908b0df;   /* constant vector a */
  this.UPPER_MASK = 0x80000000; /* most significant w-r bits */
  this.LOWER_MASK = 0x7fffffff; /* least significant r bits */
 
  this.mt = new Array(this.N); /* the array for the state vector */
  this.mti=this.N+1; /* mti==N+1 means mt[N] is not initialized */

  this.init_genrand(seed);
}  
 
/* initializes mt[N] with a seed */
MersenneTwister.prototype.init_genrand = function(s) {
  this.mt[0] = s >>> 0;
  for (this.mti=1; this.mti<this.N; this.mti++) {
      var s = this.mt[this.mti-1] ^ (this.mt[this.mti-1] >>> 30);
   this.mt[this.mti] = (((((s & 0xffff0000) >>> 16) * 1812433253) << 16) + (s & 0x0000ffff) * 1812433253)
  + this.mti;
      /* See Knuth TAOCP Vol2. 3rd Ed. P.106 for multiplier. */
      /* In the previous versions, MSBs of the seed affect   */
      /* only MSBs of the array mt[].                        */
      /* 2002/01/09 modified by Makoto Matsumoto             */
      this.mt[this.mti] >>>= 0;
      /* for >32 bit machines */
  }
}
 
/* initialize by an array with array-length */
/* init_key is the array for initializing keys */
/* key_length is its length */
/* slight change for C++, 2004/2/26 */
MersenneTwister.prototype.init_by_array = function(init_key, key_length) {
  var i, j, k;
  this.init_genrand(19650218);
  i=1; j=0;
  k = (this.N>key_length ? this.N : key_length);
  for (; k; k--) {
    var s = this.mt[i-1] ^ (this.mt[i-1] >>> 30)
    this.mt[i] = (this.mt[i] ^ (((((s & 0xffff0000) >>> 16) * 1664525) << 16) + ((s & 0x0000ffff) * 1664525)))
      + init_key[j] + j; /* non linear */
    this.mt[i] >>>= 0; /* for WORDSIZE > 32 machines */
    i++; j++;
    if (i>=this.N) { this.mt[0] = this.mt[this.N-1]; i=1; }
    if (j>=key_length) j=0;
  }
  for (k=this.N-1; k; k--) {
    var s = this.mt[i-1] ^ (this.mt[i-1] >>> 30);
    this.mt[i] = (this.mt[i] ^ (((((s & 0xffff0000) >>> 16) * 1566083941) << 16) + (s & 0x0000ffff) * 1566083941))
      - i; /* non linear */
    this.mt[i] >>>= 0; /* for WORDSIZE > 32 machines */
    i++;
    if (i>=this.N) { this.mt[0] = this.mt[this.N-1]; i=1; }
  }

  this.mt[0] = 0x80000000; /* MSB is 1; assuring non-zero initial array */ 
}
 
/* generates a random number on [0,0xffffffff]-interval */
MersenneTwister.prototype.genrand_int32 = function() {
  var y;
  var mag01 = new Array(0x0, this.MATRIX_A);
  /* mag01[x] = x * MATRIX_A  for x=0,1 */

  if (this.mti >= this.N) { /* generate N words at one time */
    var kk;

    if (this.mti == this.N+1)   /* if init_genrand() has not been called, */
      this.init_genrand(5489); /* a default initial seed is used */

    for (kk=0;kk<this.N-this.M;kk++) {
      y = (this.mt[kk]&this.UPPER_MASK)|(this.mt[kk+1]&this.LOWER_MASK);
      this.mt[kk] = this.mt[kk+this.M] ^ (y >>> 1) ^ mag01[y & 0x1];
    }
    for (;kk<this.N-1;kk++) {
      y = (this.mt[kk]&this.UPPER_MASK)|(this.mt[kk+1]&this.LOWER_MASK);
      this.mt[kk] = this.mt[kk+(this.M-this.N)] ^ (y >>> 1) ^ mag01[y & 0x1];
    }
    y = (this.mt[this.N-1]&this.UPPER_MASK)|(this.mt[0]&this.LOWER_MASK);
    this.mt[this.N-1] = this.mt[this.M-1] ^ (y >>> 1) ^ mag01[y & 0x1];

    this.mti = 0;
  }

  y = this.mt[this.mti++];

  /* Tempering */
  y ^= (y >>> 11);
  y ^= (y << 7) & 0x9d2c5680;
  y ^= (y << 15) & 0xefc60000;
  y ^= (y >>> 18);

  return y >>> 0;
}
 
/* generates a random number on [0,0x7fffffff]-interval */
MersenneTwister.prototype.genrand_int31 = function() {
  return (this.genrand_int32()>>>1);
}
 
/* generates a random number on [0,1]-real-interval */
MersenneTwister.prototype.genrand_real1 = function() {
  return this.genrand_int32()*(1.0/4294967295.0); 
  /* divided by 2^32-1 */ 
}

/* generates a random number on [0,1)-real-interval */
MersenneTwister.prototype.random = function() {
  return this.genrand_int32()*(1.0/4294967296.0); 
  /* divided by 2^32 */
}
 
/* generates a random number on (0,1)-real-interval */
MersenneTwister.prototype.genrand_real3 = function() {
  return (this.genrand_int32() + 0.5)*(1.0/4294967296.0); 
  /* divided by 2^32 */
}
 
/* generates a random number on [0,1) with 53-bit resolution*/
MersenneTwister.prototype.genrand_res53 = function() { 
  var a=this.genrand_int32()>>>5, b=this.genrand_int32()>>>6; 
  return(a*67108864.0+b)*(1.0/9007199254740992.0); 
} 

/* These real versions are due to Isaku Wada, 2002/01/09 added */
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
	this.rng = new MersenneTwister(1999);
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
			color = Math.floor(this.rng.random() * radix);
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
		var col = Math.floor(this.rng.random() * this.width);
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
			color = Math.floor(this.rng.random() * radix);
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

/*
	The playing field.
	No behavior shall be defined in this class that should be specific to
	any individual gameplay mode, or graphics or audio theme.
*/

JSPDP.Tableau = function() {
}

var proto = (JSPDP.Tableau.prototype = {});

proto.init = function(width, height) {
	// default durations from EASY difficulty
	this.durations = {
		hover : 12,
		match : 61,
		pop : 9
	};

	// Events
	this.onActionPhase = new JSPDP.Event();

	this.onActive = new JSPDP.Event();
	this.onInactive = new JSPDP.Event();
	
	this.onSetPanel = new JSPDP.Event();
	this.onSwap = new JSPDP.Event();
	this.onLand = new JSPDP.Event();
	this.onCombo = new JSPDP.Event();
	this.onPop = new JSPDP.Event();
	
	this.dimensions = {width: width, height: height};
	this.panels = new Array(this.dimensions.height);
	for(var i = 0; i < this.dimensions.height; i++) {
		this.panels[i] = new Array(this.dimensions.width);
		for(var j = 0; j < this.dimensions.width; j++) {
			//this.panels[i][j] = new JSPDP.Panel();
			this.setPanel(i, j, new JSPDP.Panel());
		}
	}
	
	return this;
}

// Scalars

proto.needsCheckMatches = false;
proto.chainLevel = 0;
proto.active = true;
proto.tickCount = 0;

// Operations

proto.bounds = function(row, col) {
	return (row >= 0) && (row < this.dimensions.height) && (col >= 0) && (col < this.dimensions.width);
};

proto.getPanel = function(row, col) {
	if(!this.bounds(row, col)) {
		//if(console) console.log("getPanel out of bounds", row, col);
		return null;
	}
	return this.panels[row][col];
};

proto.setPanel = function(row, col, panel) {
	if(this.bounds(row, col)) {
		panel.row = row;
		panel.col = col;
		this.panels[row][col] = panel;
		this.onSetPanel.fire(panel);
	} else if(console) console.log("setPanel out of bounds ", row, col);
};

proto.eachPanel = function(callback) {
	for(var row = 0; row < this.dimensions.height; row++) {
		for(var col = 0; col < this.dimensions.width; col++) {
			callback(this.getPanel(row, col));
		}
	}
};

proto.swap = function(row, col, from_left) {
	var other_col = col + (from_left ? 1 : -1);
	var panel = this.getPanel(row, col);
	other_panel = this.getPanel(row, other_col);
	var above = this.getPanel(row + 1, col);
	var other_above = this.getPanel(row + 1, other_col);
	if(panel && panel.canSwap() && other_panel && other_panel.canSwap() // both must be swappable
		&& !(panel.isAir() && other_panel.isAir()) // they can't both be air
		&& (!above || (above && !above.isHovering())) // if there's a panel here, it can't be hovering
		&& (!other_above || (other_above && !other_above.isHovering())) // same on the other side
	) {
		
		var remove_flags = JSPDP.Panel.EFlags.Landing | JSPDP.Panel.EFlags.Falling | JSPDP.Panel.EFlags.FromLeft;
		panel.removeFlags(remove_flags);
		other_panel.removeFlags(remove_flags);
		panel.setTimer(JSPDP.Panel.EFlags.Swapping, 3);
		other_panel.setTimer(JSPDP.Panel.EFlags.Swapping, 3);
		(from_left ? panel : other_panel).addFlags(JSPDP.Panel.EFlags.FromLeft);
		
		this.setPanel(row, other_col, panel);
		this.setPanel(row, col, other_panel);
		
		// bug removal re: sharpobject@gmail.com
		if(panel.isAir()) {
			if(other_above && !other_above.isAir()) {
				other_above.addFlags(JSPDP.Panel.EFlags.DontSwap);
				other_panel.addFlags(JSPDP.Panel.EFlags.DontSwap);
			}
		} else if(other_panel.isAir()) {
			if(above && !above.isAir()) {
				above.addFlags(JSPDP.Panel.EFlags.DontSwap);
				panel.addFlags(JSPDP.Panel.EFlags.DontSwap);
			}
		}
		var below = this.getPanel(row - 1, col);
		var other_below = this.getPanel(row - 1, other_col);
		if(!panel.isAir()) {
			if(other_below && other_below.isAir()) other_below.addFlags(JSPDP.Panel.EFlags.DontSwap);
		}
		if(!other_panel.isAir()) {
			if(below && below.isAir()) below.addFlags(JSPDP.Panel.EFlags.DontSwap);
		}
		
		if(row > 0) {
			var panel_below = this.getPanel(row - 1, col);
			if(panel_below && (panel_below.isAir() || panel_below.isFalling())) {
				other_panel.addFlags(JSPDP.Panel.EFlags.DontSwap);
			}
			panel_below = this.getPanel(row - 1, other_col);
			if(panel_below && (panel_below.isAir() || panel_below.isFalling())) {
				panel.addFlags(JSPDP.Panel.EFlags.DontSwap);
			}
		}
		
		this.onSwap.fire([panel, other_panel]);
		
		return true;
	}
	return false;
};

proto.setHoverers = function(row, col, ticks, flags) {
	while(true) {
		var panel = this.getPanel(row, col);
		if(!panel || !panel.canHover()) {
			break;
		}
		if(panel.isSwapping()) {
			ticks += panel.timer;
		}
		// note: hovering removes other flags such as DontSwap
		panel.resetFlags(flags | panel.getFlags(JSPDP.Panel.EFlags.Chaining));
		panel.setTimer(JSPDP.Panel.EFlags.Hovering, ticks);
		++row;
	}
};

proto.runTick = function() {
	// OTODO: set bounce (outside of this class)
	// OTODO: set danger music (outside of this class)
	
	this.runFlagsPhase();
	this.onActionPhase.fire();
	this.runLandingPhase();
	this.runMatchPhase();
	this.runWrapUpPhase();
	
	++this.tickCount;
};

// Phases for runTick

proto.runFlagsPhase = function() {
	var self = this;
	this.eachPanel(function(panel) {
		// falling
		if(panel.isFalling()) {
			var other_panel = self.getPanel(panel.row - 1, panel.col);
			if(!other_panel.isAir()) {
				panel.removeFlags(JSPDP.Panel.EFlags.Falling | JSPDP.Panel.EFlags.DontSwap);
				panel.setTimer(JSPDP.Panel.EFlags.Landing, 12);
				self.needsCheckMatches = true;
				self.onLand.fire(panel);
			} else { // ok it's air
				self.setPanel(panel.row, panel.col, other_panel); 
				self.setPanel(panel.row - 1, panel.col, panel);
			}
		}
		// timers decrementing
		else if(panel.timer > 0) {
			panel.decrementTimer();
			if(!panel.timer) {
				if(panel.isSwapping()) {
					self.expireSwapping(panel);
				}
				else if(panel.isHovering()) {
					self.expireHovering(panel);
				}
				else if(panel.isLanding()) {
					self.expireLanding(panel);
				}
				else if(panel.isMatching()) {
					self.expireMatching(panel);
				}
				else if(panel.isPopping()) {
					self.expirePopping(panel);
				}
				else if(panel.isPopped()) {
					self.expirePopped(panel);
				}
				else {
					if(console) console.log("wat", panel);
				}
			}
		}
	});
};

proto.runLandingPhase = function() {
	var result = false;
	var self = this;
	this.eachPanel(function(panel) {
		if(panel.isFalling()) {
			if(panel.row == 0) {
				panel.removeFlags(JSPDP.Panel.EFlags.Falling | JSPDP.Panel.EFlags.DontSwap);
				panel.setTimer(JSPDP.Panel.EFlags.Landing, 12);
				self.needsCheckMatches = true;
				self.onLand.fire(panel);
			}
			else {
				var panel_below = self.getPanel(panel.row - 1, panel.col);
				if(!panel_below.isAir()) {
					if(!panel_below.isFalling()) {
						panel.removeFlags(JSPDP.Panel.EFlags.Falling | JSPDP.Panel.EFlags.DontSwap);
						if(panel_below.isHovering()) {
							// hover and inherit the hover time of the panel it's landing on
							self.setHoverers(panel.row, panel.col, panel_below.timer, 0);
						}
						else {
							panel.setTimer(JSPDP.Panel.EFlags.Landing, 12);
							self.needsCheckMatches = true;
							self.onLand.fire(panel);
						}
					}
				}
			}
		}
	});
};

proto.runMatchPhase = function() {
	if(this.needsCheckMatches) {
		this.needsCheckMatches = false;

		this.eachPanel(function(panel) {
			panel._checkMatches_matched = 0;
		});
		
		var panel;
		var last_panel;
		var count;
		var combo_size = 0;
		var is_chain = 0;
		
		// check for vertical matches
		for(var col = 0; col < this.dimensions.width; col++) {
			last_panel = null;
			count = 0;
			for(var row = 0; row < this.dimensions.height; row++) {
				panel = this.getPanel(row, col);
				if(!panel.isAir() && panel.canMatch()) {
					if(!count) {
						count = 1;
					}
					else if(panel.color == last_panel.color) {
						if(++count >= 3) {
							// dey be matchin
							if(!panel._checkMatches_matched) {
								panel._checkMatches_matched = 1;
								++combo_size;
								if(panel.isChaining()) {
									is_chain = 1;
								}
							}
							if(count == 3) {
								// go back and match the last two
								combo_size += 2;
								var matched_panel;
								matched_panel = this.getPanel(row - 1, col);
								matched_panel._checkMatches_matched = 1;
								if(matched_panel.isChaining()) {
									is_chain = 1;
								}
								matched_panel = this.getPanel(row - 2, col);
								matched_panel._checkMatches_matched = 1;
								if(matched_panel.isChaining()) {
									is_chain = 1;
								}
							}
						}
					}
					else {
						count = 1;
					}
				}
				else {
					// air or non-matchable panel
					count = 0;
				}
				last_panel = panel;
			}
		}
		
		// check for horizontal matches
		for(var row = 0; row < this.dimensions.height; row++) {
			last_panel = null;
			count = 0;
			for(var col = 0; col < this.dimensions.width; col++) {
				panel = this.getPanel(row, col);
				if(!panel.isAir() && panel.canMatch()) {
					if(!count) {
						count = 1;
					}
					else if(panel.color == last_panel.color) {
						if(++count >= 3) {
							// dey be matchin
							if(!panel._checkMatches_matched) {
								panel._checkMatches_matched = 1;
								++combo_size;
								if(panel.isChaining()) {
									is_chain = 1;
								}
							}
							if(count == 3) {
								// go back and match the last two
								var matched_panel;
								matched_panel = this.getPanel(row, col - 1);
								if(!matched_panel._checkMatches_matched) {
									matched_panel._checkMatches_matched = 1;
									++combo_size;
									if(matched_panel.isChaining()) {
										is_chain = 1;
									}
								}
								matched_panel = this.getPanel(row, col - 2);
								if(!matched_panel._checkMatches_matched) {
									matched_panel._checkMatches_matched = 1;
									++combo_size;
									if(matched_panel.isChaining()) {
										is_chain = 1;
									}
								}
							}
						}
					}
					else {
						count = 1;
					}
				}
				else {
					// air or non-matchable panel
					count = 0;
				}
				last_panel = panel;
			}
		}
		
		// update the tableau's chain counter
		if(is_chain) {
			this.chainLevel = this.chainLevel ? this.chainLevel + 1 : 2;
		}
		
		// re-flagging for matching and chaining
		var combo_index = 1;
		var combo = [];
		for(var row = this.dimensions.height - 1; row >= 0; row--) {
			for(var col = 0; col < this.dimensions.width; col++) {
				panel = this.getPanel(row, col);
				if(panel._checkMatches_matched) {
					// set newly matched panels as matched
					panel.setTimer(JSPDP.Panel.EFlags.Matching, this.durations.match);
					if(is_chain && !panel.isChaining()) {
						panel.addFlags(JSPDP.Panel.EFlags.Chaining);
					}
					panel.removeFlags(JSPDP.Panel.EFlags.Landing);
					panel.comboSize = combo_size;
					panel.comboIndex = combo_index;
					panel.chainIndex = is_chain ? this.chainLevel : 0;
					combo.push(panel);
					++combo_index;
				}
				else {
					// if a panel wasn't matched but was eligible,
					// we might have to remove its chain flag...!
					if(panel.isChaining() && panel.canMatch()) {
						if(row > 0) {
							if(!this.getPanel(row - 1, col).isSwapping()) {
								panel.removeFlags(JSPDP.Panel.EFlags.Chaining);
							}
						}
						else {
							panel.removeFlags(JSPDP.Panel.EFlags.Chaining);
						}
					}
				}
			}
		}
		if(combo_size) {
			this.onCombo.fire(combo);
		}
		
		// OTODO: score
		// OTODO: combo card, confetti, chain card
		// OTODO: stop time
		// OTODO: disallow manual raise?
	}
};

proto.runWrapUpPhase = function() {
	var active_count = 0;
	var chaining_count = 0;
	this.eachPanel(function(panel) {
		if(panel.isActive()) ++active_count;
		if(panel.isChaining()) ++chaining_count;
	});
	var is_active = (active_count > 0);
	if(this.active != is_active) {
		(this.active = is_active) ? this.onActive.fire() : this.onInactive.fire();
	}
	if(chaining_count == 0) {
		this.chainLevel = 0;
	}
};

// Timer expiration behaviors

proto.expireSwapping = function(panel) {
	panel.removeFlags(JSPDP.Panel.EFlags.Swapping | JSPDP.Panel.EFlags.DontSwap);
	var panel_above = this.getPanel(panel.row + 1, panel.col);
	if(panel_above) panel_above.removeFlags(JSPDP.Panel.EFlags.DontSwap); // todo: this is a sloppy fix
	var from_left = panel.getFlags(JSPDP.Panel.EFlags.FromLeft);
	if(from_left) {
		panel.removeFlags(JSPDP.Panel.EFlags.FromLeft);
	}
	// Now there are a few cases where some hovering must be done.
	if(!panel.isAir() && panel.row != 0) {
		var panel_below = this.getPanel(panel.row - 1, panel.col);
		if(panel_below.isAir()) {
			panel.setTimer(JSPDP.Panel.EFlags.Hovering, this.durations.hover);
			this.setHoverers(panel.row + 1, panel.col, this.durations.hover + 1, 0);
			// CRAZY BUG EMULATION:
			// the space it was swapping from hovers too
			var other_col = panel.col + (from_left ? -1 : 1);
			var other_panel = this.getPanel(panel.row, other_col);
			if(other_panel.isFalling()) {
				if(from_left) {
					other_panel.setTimer(JSPDP.Panel.EFlags.Hovering, this.durations.hover);
					this.setHoverers(panel.row + 1, other_col, this.durations.hover + 1, 0);
				}
				else {
					this.setHoverers(panel.row, other_col, this.durations.hover, 0);
				}
			}
		}
		else if(panel_below.isHovering()) {
			panel.setTimer(JSPDP.Panel.EFlags.Hovering, this.durations.hover);
			this.setHoverers(panel.row + 1, panel.col, this.durations.hover + 1, 0);
		}
	}
	else if(panel.isAir()) {
		// an empty space finished swapping; panels above it hover
		this.setHoverers(panel.row + 1, panel.col, this.durations.hover + 1, 0);
	}
	this.needsCheckMatches = true;
};

proto.expireHovering = function(panel) {
	panel.removeFlags(JSPDP.Panel.EFlags.Hovering | JSPDP.Panel.EFlags.DontSwap);
	panel.addFlags(JSPDP.Panel.EFlags.Falling);
	var other_panel = this.getPanel(panel.row - 1, panel.col); // air
	other_panel.resetFlags(0);
	this.setPanel(panel.row, panel.col, other_panel);
	this.setPanel(panel.row - 1, panel.col, panel);
};

proto.expireLanding = function(panel) {
	panel.removeFlags(JSPDP.Panel.EFlags.Landing);
};

proto.expireMatching = function(panel) {
	panel.removeFlags(JSPDP.Panel.EFlags.Matching);
	panel.setTimer(JSPDP.Panel.EFlags.Popping, panel.comboIndex * this.durations.pop);
};

proto.expirePopping = function(panel) {
	// if it's the last panel to pop, it should be removed immediately
	if(panel.comboIndex == panel.comboSize) {
		// but set the popped flag
		panel.removeFlags(JSPDP.Panel.EFlags.Popping);
		panel.addFlags(JSPDP.Panel.EFlags.Popped);
		this.setPanel(panel.row, panel.col, new JSPDP.Panel());
		this.setHoverers(panel.row + 1, panel.col, this.durations.hover + 1, JSPDP.Panel.EFlags.Chaining);
	}
	else {
		panel.removeFlags(JSPDP.Panel.EFlags.Popping);
		panel.setTimer(JSPDP.Panel.EFlags.Popped, (panel.comboSize - panel.comboIndex) * this.durations.pop);
	}
	this.onPop.fire(panel);
};

proto.expirePopped = function(panel) {
	// note: leave the popped flag alone
	this.setPanel(panel.row, panel.col, new JSPDP.Panel());
	this.setHoverers(panel.row + 1, panel.col, this.durations.hover + 1, JSPDP.Panel.EFlags.Chaining);
};
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

JSPDP.RisingTableau = function() {
}

var proto = (JSPDP.RisingTableau.prototype = new JSPDP.Tableau());

proto.toppedOut = false;

proto.init = function(width, height) {
	JSPDP.Tableau.prototype.init.call(this, width, height);
	
	this.onRise = new JSPDP.Event();
	this.onRow = new JSPDP.Event();
	this.onTopout = new JSPDP.Event();
	
	this.onCombo.subscribe(this.handleCombo.bind(this));
	
	this.generator = new JSPDP.Generator().init(width);
	var rows = this.generator.generateFieldTA(5); // todo
	for(var row = 0; row < rows.length; row++) {
		for(var col = 0; col < this.dimensions.width; col++) {
			if(rows[row][col] != undefined) {
				var panel = new JSPDP.Panel();
				panel.color = rows[row][col];
				panel.type = 1;
				this.setPanel(row, col, panel);
			}
		}
	}
	this.generator.generateRow(5); // todo: radix
	
	return this;
}

proto.stopTicks = 0;

proto.riseSpeed = (1 / 60) / 10; // todo
proto.riseOffset = 0;

proto.liftSpeed = 1 / 16; // todo
proto.liftJuice = 0; // todo

proto.runTick = function() {
	if(this.active) {
		this.liftJuice = 0; // todo: this will be optional
	}
	
	if(this.liftJuice > 0) {
		this.stopTicks = 0;
	}
	
	if(this.stopTicks > 0) {
		--this.stopTicks;
	} else if(!this.active && !this.toppedOut) {
	
		if(this.liftJuice > 0) {
			this.riseOffset += this.liftSpeed;
			this.liftJuice -= 1 / 16;
			if(this.liftJuice < 0) this.liftJuice = 0;
		} else {
			this.riseOffset += this.riseSpeed;
		}
		
		while(this.riseOffset >= 1) {
			this.riseOffset -= 1;
			
			// shift everything up a row
			for(var row = this.dimensions.height - 1; row > 0; row--) {
				for(var col = 0; col < this.dimensions.width; col++) {
					var panel = this.getPanel(row, col);
					this.setPanel(row, col, this.getPanel(row - 1, col)); 
					this.setPanel(row - 1, col, panel);
				}
			}
			
			// add panels from generated row
			for(var i = 0; i < this.dimensions.width; i++) {
				var panel = new JSPDP.Panel();
				panel.type = 1;
				panel.color = this.generator.current[i];
				this.setPanel(0, i, panel);
			}
			this.needsCheckMatches = true;
			this.generator.generateRow(5); // todo: radix
			
			this.liftJuice = 0;
			
			var top_row = this.panels[this.panels.length - 1];
			for(var i = 0; i < top_row.length; i++) {
				if(!top_row[i].isAir()) {
					this.toppedOut = true;
					this.riseOffset = 0;
					break;
				}
			}
			
			this.onRow.fire();
		}
		this.onRise.fire();
	}
	
	JSPDP.Tableau.prototype.runTick.call(this);
	
	if(this.toppedOut) {
		this.toppedOut = false;
		var top_row = this.panels[this.panels.length - 1];
		for(var i = 0; i < top_row.length; i++) {
			if(!top_row[i].isAir()) {
				this.toppedOut = true;
				break;
			}
		}
	}
	
	if(this.toppedOut && !this.stopTicks && !this.active) {
		this.onTopout.fire();
		console.log("topout");
	}
};

proto.handleCombo = function(combo) {
	// add stoptime
	var panel = combo[0];
	if(panel.comboSize > 3 || panel.chainIndex > 1) {
		this.stopTicks += 60 * (this.stopTicks ? 1 : 5); // todo: more correct stop time
		if(this.stopTicks > (60 * 99)) {
			this.stopTicks = 60 * 99;
		}
	}
};

proto.lift = function() {
	if(!this.liftJuice) {
		this.liftJuice = 1;
	}
};
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

JSPDP.TableauUI = function() {
};

var proto = (JSPDP.TableauUI.prototype = {});

proto.init = function(settings) {
	this.tableau = settings.tableau;
	this.theme = settings.theme;
	this.element = settings.element;
	this.panelDimensions = settings.panelDimensions;
	
	return this;
};

proto.createCanvas = function() {
	var canvas = document.createElement("canvas");
	canvas.width = this.panelDimensions.width * this.tableau.dimensions.width;
	canvas.height = this.panelDimensions.height * this.tableau.dimensions.height;
	if(this.tableau instanceof JSPDP.RisingTableau) {
		canvas.height += this.panelDimensions.height;
	}
	return canvas;
};

proto.canvasPos = function(row, col) {
	var y = (this.panelDimensions.height * this.tableau.dimensions.height) - (this.panelDimensions.height * (row + 1));
	return {
		x: this.panelDimensions.width * col,
		y: y
	}
};

proto.tableauPos = function(x, y) {
	return {
		row: this.tableau.dimensions.height - 1 - Math.floor(y / this.panelDimensions.height),
		col: Math.floor(x / this.panelDimensions.width)
	};
};

proto.riseOffset = function() {
	return this.tableau instanceof JSPDP.RisingTableau ? -(this.panelDimensions.height * this.tableau.riseOffset) : 0;
};

proto.translate = function(x, y) {
	var offx = 0;
	var offy = 0;
	var ele = this.element;
	do {
		offx += ele.offsetLeft;
		offy += ele.offsetTop;
	} while(ele = ele.offsetParent);
	return {
		x: x - offx,
		y: y - offy
	};
};

proto.refresh = function() {
};

proto.update = function() {
	return false;
};

proto.draw = function(ctx) {
};
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

JSPDP.Canvas2DFXRenderer = function() {
};

var proto = (JSPDP.Canvas2DFXRenderer.prototype = new JSPDP.TableauUI());

proto.init = function(settings) {
	JSPDP.TableauUI.prototype.init.call(this, settings);
	
	this.canvas = this.createCanvas();
	this.ctx = this.canvas.getContext('2d');
	
	this.tableau.onPop.subscribe(this.handlePop.bind(this));
	this.tableau.onCombo.subscribe(this.handleCombo.bind(this));
	
	this.particles = [];
	this.lastTick = -1;
	
	this.cards = [];
	
	return this;
}

proto.handlePop = function(panel) {
	var canvas_pos = this.canvasPos(panel.row, panel.col);
	canvas_pos.x += this.panelDimensions.width / 2;
	canvas_pos.y += this.panelDimensions.height / 2;
	for(var i = 0; i < 8; i++) {
		this.particles.push({
			b: this.tableau.tickCount,
			l: 60,
			t: this.tableau.tickCount,
			x: canvas_pos.x,
			y: canvas_pos.y,
			xv: Math.random() * 5 - 2.5,
			yv: Math.random() * 10 - 5,
			xf: 0,
			yf: 0.1,
			d: 0.99
		});
	}
};

proto.handleCombo = function(combo) {
	var combo_size = combo[0].comboSize;
	var chain_size = combo[0].chainIndex;
	var offset = 0;
	if(chain_size > 1) {
		var text = "x" + chain_size;
		var canvas = document.createElement("canvas");
		var ctx = canvas.getContext("2d");
		canvas.height = this.panelDimensions.height;
		var font = Math.floor(this.panelDimensions.height * 0.8) + "px Arial";
		ctx.font = font;
		var width = ctx.measureText(text).width + (this.panelDimensions.width * 0.6);
		offset += width;
		canvas.width = width;
		ctx.font = font;
		ctx.textBaseline = "top";
		ctx.lineWidth = this.panelDimensions.width * 0.08;
		//if(canvas.width < this.panelWidth) canvas.width = this.panelWidth;
		ctx.fillStyle = "green";
		ctx.strokeStyle = "white";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.strokeRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = "white";
		ctx.fillText(text, this.panelDimensions.width * 0.3, this.panelDimensions.height * 0.08);
		
		var canvas_pos = this.canvasPos(combo[0].row, combo[0].col);
		var card = {
			canvas: canvas,
			canvas_pos: canvas_pos,
			born: this.tableau.tickCount
		};
		this.cards.push(card);
	}
	if(combo_size > 3) {
		var text = combo_size;
		var canvas = document.createElement("canvas");
		var ctx = canvas.getContext("2d");
		canvas.height = this.panelDimensions.height;
		var font = Math.floor(this.panelDimensions.height * 0.8) + "px Arial";
		ctx.font = font;
		var width = ctx.measureText(text).width + (this.panelDimensions.width * 0.6);
		canvas.width = width;
		ctx.font = font;
		ctx.textBaseline = "top";
		ctx.lineWidth = this.panelDimensions.width * 0.08;
		//if(canvas.width < this.panelWidth) canvas.width = this.panelWidth;
		ctx.fillStyle = "red";
		ctx.strokeStyle = "white";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.strokeRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = "white";
		ctx.fillText(text, this.panelDimensions.width * 0.3, this.panelDimensions.height * 0.08);
		
		var canvas_pos = this.canvasPos(combo[0].row, combo[0].col);
		canvas_pos.x += offset;
		var card = {
			canvas: canvas,
			canvas_pos: canvas_pos,
			born: this.tableau.tickCount
		};
		this.cards.push(card);
	}
};

proto.refresh = function() {
	this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	for(var i = 0; i < this.particles.length; i++) {
		var p = this.particles[i];
		for(var t = p.t; t < this.tableau.tickCount; t++) {
			p.x += p.xv;
			p.y += p.yv;
			p.xv = p.xv * p.d + p.xf;
			p.yv = p.yv * p.d + p.yf;
		}
		
		this.ctx.save();
		this.ctx.globalAlpha = 1 - ((p.t - p.b) / p.l);
	
		this.ctx.drawImage(this.theme.duck, p.x, p.y);
		this.ctx.restore();
		
		p.t = this.tableau.tickCount;
		if(p.t - p.b > p.l) {
			this.particles.splice(i--, 1);
		}
	}
	
	this.ctx.save();
	this.ctx.globalAlpha = 0.5;
	var life = 60;
	for(var i = 0; i < this.cards.length; i++) {
		var card = this.cards[i];
		var ticks = this.tableau.tickCount - card.born;
		var offset = -1 - Math.sin((ticks / life) * (Math.PI / 2)) * (this.panelDimensions.height * 0.75);
		this.ctx.drawImage(card.canvas, card.canvas_pos.x, card.canvas_pos.y + offset);
		if(this.tableau.tickCount > card.born + life) {
			this.cards.splice(i--, 1);
		}
	}
	this.ctx.restore();
	
};

proto.update = function() {
	if(this.tableau.tickCount != this.lastTick) {
		this.lastTick = this.tableau.tickCount;
		this.refresh();
		return true;
	}
	return false;
};

proto.draw = function(ctx) {
	ctx.drawImage(this.canvas, 0, this.riseOffset());
};
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

JSPDP.Canvas2DTableauRenderer = function() {
};

var proto = (JSPDP.Canvas2DTableauRenderer.prototype = new JSPDP.TableauUI());

proto.init = function(settings) {
	JSPDP.TableauUI.prototype.init.call(this, settings);
	
	this.panelImages = [];
	for(var i = 0; i < this.theme.panelImages.length; i++) {
		var c = document.createElement("canvas");
		c.width = this.panelDimensions.width;
		c.height = this.panelDimensions.height;
		c.getContext("2d").drawImage(this.theme.panelImages[i],
			0, 0,
			this.theme.panelDimensions.width, this.theme.panelDimensions.height,
			0, 0,
			this.panelDimensions.width, this.panelDimensions.height);
		console.log("ok");
		this.panelImages[i] = c;
	}
	
	this.canvas = this.createCanvas();
	this.ctx = this.canvas.getContext('2d');
	this.ctx.fillStyle = "rgb(255,255,255)";
	
	this.tableau.onSetPanel.subscribe(this.handleSetPanel.bind(this));
	this.tableau.onSwap.subscribe(this.handleSwap.bind(this));
	this.tableau.onLand.subscribe(this.handleLand.bind(this));
	this.tableau.onCombo.subscribe(this.handleCombo.bind(this));
	this.tableau.onPop.subscribe(this.handlePop.bind(this));
	if(this.tableau instanceof JSPDP.RisingTableau) {
		this.tableau.onRow.subscribe(this.handleRow.bind(this));
	}
	
	this.animatingPanels = [];
	this.swappingPanels = [];
	this.needsGeneratorRender = false;
	
	return this;
}

proto.renderPanel = function(panel) {
	var canvas_pos = this.canvasPos(panel.row, panel.col);
	if(!panel.isAir() && !panel.isPopped() && !panel.isSwapping()) {
		if(panel.isMatching() && (this.tableau.tickCount & 1) && (panel.timer > (this.tableau.durations.match * 0.25))) {
			// render white
			this.ctx.fillRect(canvas_pos.x, canvas_pos.y, this.panelDimensions.width, this.panelDimensions.height);
		} else if(panel.isPopping()) {
			// render gray
			this.ctx.fillStyle = "rgb(64,64,64)";
			this.ctx.fillRect(canvas_pos.x, canvas_pos.y, this.panelDimensions.width, this.panelDimensions.height);
			this.ctx.fillStyle = "rgb(255,255,255)";
		} else {
			// render normally
			this.ctx.drawImage(this.panelImages[panel.color], canvas_pos.x, canvas_pos.y);
		}
	} else {
		this.ctx.clearRect(canvas_pos.x, canvas_pos.y, this.panelDimensions.width, this.panelDimensions.height);
	}
};

proto.renderSwappingPanel = function(panel) {
	if(!panel.isAir()) {
		var canvas_pos = this.canvasPos(panel.row, panel.col);
		var offs = this.panelDimensions.width / 4;
		offs *= (4 - panel.timer);
		if(panel.flags & JSPDP.Panel.EFlags.FromLeft) {
			offs = -this.panelDimensions.width + offs;
		} else {
			offs = this.panelDimensions.width - offs;
		}
		this.ctx.drawImage(this.panelImages[panel.color], canvas_pos.x + offs, canvas_pos.y);
	}
};

proto.renderAnimatingPanels = function() {
	if(this.animatingPanels.length) {
		for(var i = 0; i < this.animatingPanels.length; i++) {
			var panel = this.animatingPanels[i];
			this.renderPanel(panel);
			if(!panel.getFlags(panel.renderFlags)) {
				this.animatingPanels.splice(i--, 1);
			}
		}
		return true;
	}
	return false;
};

proto.renderSwappingPanels = function() {
	if(this.swappingPanels.length) {
		// clear them all first...
		for(var i = 0; i < this.swappingPanels.length; i++) {
			var panel = this.swappingPanels[i];
			this.renderPanel(panel);
			// also redraw stationary panels that may be obstructed by swapping ones
			var other_panel = this.tableau.getPanel(panel.row, panel.col + (panel.getFlags(JSPDP.Panel.EFlags.FromLeft) ? -1 : 1));
			if(other_panel && !other_panel.isSwapping()) {
				this.renderPanel(other_panel);
			}
		}
		// then, draw the swapping panels
		for(var i = this.swappingPanels.length - 1; i >= 0; i--) {
			var panel = this.swappingPanels[i];
			if(panel.isSwapping()) {
				this.renderSwappingPanel(panel);
			} else {
				this.renderPanel(panel);
				this.swappingPanels.splice(i, 1);
			}
		}
		return true;
	}
	return false;
};

proto.renderGenerator = function() {
	var canvas_pos = this.canvasPos(-1, 0);
	for(var i = 0; i < this.tableau.dimensions.width; i++) {
		this.ctx.drawImage(this.panelImages[this.tableau.generator.current[i]], this.panelDimensions.width * i, canvas_pos.y);
	}
	this.ctx.save();
	this.ctx.fillStyle = "rgb(0,0,0)";
	this.ctx.globalAlpha = 0.6;
	this.ctx.fillRect(0, canvas_pos.y, this.panelDimensions.width * this.tableau.dimensions.width, this.panelDimensions.width);
	this.ctx.restore();
	this.needsGeneratorRender = false;
};

proto.handleSetPanel = function(panel) {
	this.renderPanel(panel);
};

proto.handleLand = function(panel) {
	panel.renderFlags = JSPDP.Panel.EFlags.Landing;
	this.animatingPanels.push(panel);
};

proto.handleCombo = function(combo) {
	for(var i = 0; i < combo.length; i++) {
		var panel = combo[i];
		panel.renderFlags = JSPDP.Panel.EFlags.Matching;
		this.animatingPanels.push(panel);
	}
};

proto.handlePop = function(panel) {
	this.renderPanel(panel);
};

proto.handleSwap = function(panels) {
	this.swappingPanels.push(panels[0]);
	this.swappingPanels.push(panels[1]);
};

proto.handleRow = function() {
	this.needsGeneratorRender = true;
};

// TODO: THESE

proto.refresh = function() {
	this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	var self = this;
	this.tableau.eachPanel(function(panel) {
		self.renderPanel(panel);
	});
	this.renderSwappingPanels();
	if(this.tableau instanceof JSPDP.RisingTableau) {
		this.renderGenerator();
	}
};

proto.update = function() {
	var updated = this.renderAnimatingPanels();
	updated |= this.renderSwappingPanels();
	if(this.needsGeneratorRender) {
		updated = true;
		this.renderGenerator();
	}
	return updated;
};

proto.draw = function(ctx) {
	ctx.drawImage(this.canvas, 0, this.riseOffset());
};
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

JSPDP.RenderManager = function() {
};

var proto = (JSPDP.RenderManager.prototype = new JSPDP.TableauUI());

proto.init = function(settings, renderer_classes) {
	JSPDP.TableauUI.prototype.init.call(this, settings);
	
	this.canvas = this.createCanvas();
	if(this.tableau instanceof JSPDP.RisingTableau) {
		this.canvas.height -= this.panelDimensions.height;
	}
	this.ctx = this.canvas.getContext('2d');
	
	settings.element = this.canvas;
	
	this.renderers = [];
	if(typeof(renderer_classes) != 'undefined') {
		for(var i = 0; i < renderer_classes.length; i++) {
			this.renderers.push(new renderer_classes[i]().init(settings));
		}
	}
	
	this.lastTick = this.tableau.tickCount;
	
	return this;
};

proto.get = function(t) {
	for(var i in this.renderers) {
		if(this.renderers[i] instanceof t) {
			return this.renderers[i];
		}
	}
};

proto.start = function() {
	this.running = true;
	this.refresh();
	
	var requestAnimationFrame = (function(){
		//Check for each browser
		//@paul_irish function
		//Globalises this function to work on any browser as each browser has a different namespace for this
		return  window.requestAnimationFrame   || //Chromium 
			window.webkitRequestAnimationFrame || //Webkit
			window.mozRequestAnimationFrame    || //Mozilla Geko
			window.oRequestAnimationFrame      || //Opera Presto
			window.msRequestAnimationFrame     || //IE Trident?
			function(callback, element){ //Fallback function
				window.setTimeout(callback, 1000 / 45);
			}
	})();
	var self = this;
	var run = function() {
		self.draw();
		if(self.running) requestAnimationFrame(run);
	};
	requestAnimationFrame(run);
};

proto.stop = function() {
	this.running = false;
};

proto.refresh = function() {
	this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	for(var i = 0; i < this.renderers.length; i++) {
		var renderer = this.renderers[i];
		renderer.refresh();
		renderer.draw(this.ctx);
	}
};

proto.draw = function() {
	if(this.tableau.tickCount != this.lastTick) {
		this.lastTick = this.tableau.tickCount;
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		for(var i = 0; i < this.renderers.length; i++) {
			var renderer = this.renderers[i];
			renderer.update()
			renderer.draw(this.ctx);
		}
	}
};
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

JSPDP.Cursor = function() {
};

JSPDP.Cursor.EAction = {
	Up: 0,
	Down: 1,
	Left: 2,
	Right: 3,
	Swap1: 4,
	Swap2: 5,
	Lift: 6,
	LENGTH: 7
};

var proto = (JSPDP.Cursor.prototype = new JSPDP.TableauUI());

proto.init = function(settings) {
	JSPDP.TableauUI.prototype.init.call(this, settings);
	
	this.position = {
		row: 0,
		col: 0
	};
	
	this.actions = new Array(JSPDP.Cursor.EAction.LENGTH);
	for(var i = 0; i < JSPDP.Cursor.EAction.LENGTH; i++)
		this.actions[i] = 0;
	
	// events
	this.onStartAction = new JSPDP.Event();
	this.onStopAction = new JSPDP.Event();
	
	// subscribe to events
	this.tableau.onActionPhase.subscribe(this.handleActionPhase.bind(this));
	if(this.tableau.onRise) {
		this.tableau.onRise.subscribe(this.handleRise.bind(this));
	}
	if(this.tableau.onRow) {
		this.tableau.onRow.subscribe(this.handleRow.bind(this));
	}
	
	// set up for rendering
	this.canvas = this.createCanvas();
	this.ctx = this.canvas.getContext('2d');
	
	return this;
};

proto.moveTo = function(row, col) {
	if(!this.tableau.bounds(row, col)) return false;
	this.position.row = row;
	this.position.col = col;
	this.moved = true;
	this.stopMovement();
	return true;
};

proto.startAction = function(action) {
	if(!this.actions[action]) {
		var ea = JSPDP.Cursor.EAction;
		if(action == ea.Up || action == ea.Down
			|| action == ea.Left || action == ea.Right) {
			this.stopMovement();
		}
		this.actions[action] = 1;
		this.onStartAction.fire(action);
	}
};

proto.stopAction = function(action) {
	if(this.actions[action]) {
		this.actions[action] = 0;
		this.onStopAction.fire(action);
	}
};

proto.stopMovement = function() {
	var ea = JSPDP.Cursor.EAction;
	this.stopAction(ea.Up);
	this.stopAction(ea.Down);
	this.stopAction(ea.Left);
	this.stopAction(ea.Right);
};

// event handlers

proto.handleActionPhase = function() {
	// perform actions
	for(var action = 0; action < JSPDP.Cursor.EAction.LENGTH; action++) {
		if(!this.actions[action]) continue;

		var rep = this.actions[action]++;
		
		// everything but Lift given a delay
		if(action != JSPDP.Cursor.EAction.Lift) {
			if(rep != 1 && rep < 16) {
				continue;
			}
		}

		var old_pos = {
			row: this.position.row,
			col: this.position.col
		};

		var ea = JSPDP.Cursor.EAction;
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
				this.stopAction(JSPDP.Cursor.EAction.Swap1);
				this.stopAction(JSPDP.Cursor.EAction.Swap2);
				break;
			case ea.Lift:
				if(this.tableau instanceof JSPDP.RisingTableau) {
					this.tableau.lift();
				}
				break;
		}
		
		// constrain position
		
		var top_row = this.tableau.dimensions.height - 1 - Math.ceil(this.tableau.riseOffset);
		
		if(this.position.row < 0)
			this.position.row = 0;
		else if(this.position.row > top_row) {
			this.position.row = top_row;
		}
		
		if(this.position.col < 0)
			this.position.col = 0;
		else if(this.position.col >= this.tableau.dimensions.width - 1)
			this.position.col = this.tableau.dimensions.width - 2;
			
		// flag this as having moved
		
		if(this.position.row != old_pos.row || this.position.col != old_pos.col) {
			this.moved = true;
		}
	}
};

proto.handleRise = function() {
	var top_row = this.tableau.dimensions.height - 1 - Math.ceil(this.tableau.riseOffset);
	if(this.position.row > top_row) {
		this.position.row = top_row;
		this.moved = true;
	}
};

proto.handleRow = function() {
	this.position.row++;
	var top_row = this.tableau.dimensions.height - 1 - Math.ceil(this.tableau.riseOffset);
	if(this.position.row > top_row)
		this.position.row = top_row;
	this.moved = true;
};

// rendering

proto.moved = false;

proto.refresh = function() {
	this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	var canvas_pos = this.canvasPos(this.position.row, this.position.col);
	this.ctx.drawImage(this.theme.cursorImage, canvas_pos.x, canvas_pos.y);
};

proto.update = function() {
	if(this.moved) {
		this.refresh(); // todo: clear a smaller area?
		this.moved = false;
		return true;
	}
	return false;
};

proto.draw = function(ctx) {
	ctx.drawImage(this.canvas, 0, this.riseOffset());
};
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
	this.pressed = false;
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
			event.preventDefault();
			if(!this.buttons[i].pressed) {
				this.buttons[i].pressed = true;
				this.startAction(this.buttons[i].action);
				break;
			}
		}
	}
};

proto.onKeyup = function(event) {
	for(var i = 0; i < this.buttons.length; i++) {
		if(event.keyCode == this.buttons[i].key) {
			event.preventDefault();
			if(this.buttons[i].pressed) {
				this.buttons[i].pressed = false;
				this.stopAction(this.buttons[i].action);
				break;
			}
		}
	}
};

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

JSPDP.TouchController = function() {
}

var proto = (JSPDP.TouchController.prototype = new JSPDP.TableauUI());

proto.selection = null;
proto.position = null;
proto.lastSwapTick = -9001;

proto.init = function(settings) {
	JSPDP.TableauUI.prototype.init.call(this, settings);
	
	this.onSelect = new JSPDP.Event();
	
	this.tableau.onActionPhase.subscribe(this.onActionPhase.bind(this));
	if(this.tableau instanceof JSPDP.RisingTableau) {
		this.tableau.onRow.subscribe(this.handleRow.bind(this));
	}
	addEventListener('mousedown', this.onMousedown.bind(this), false);
	addEventListener('touchstart', this.onMousedown.bind(this), false);
	addEventListener('mouseup', this.onMouseup.bind(this), false);
	addEventListener('touchend', this.onMouseup.bind(this), false);
	addEventListener('mousemove', this.onMousemove.bind(this), false);
	addEventListener('touchmove', this.onMousemove.bind(this), false);
	addEventListener('mousewheel', this.onMousewheel.bind(this), false);
	addEventListener('DOMMouseScroll', this.onMousewheel.bind(this), false);
	
	return this;
};

proto.onMousedown = function(event) {
	var x = event.changedTouches ? event.changedTouches[0].pageX : event.pageX;
	var y = event.changedTouches ? event.changedTouches[0].pageY : event.pageY;
	var canvas_pos = this.translate(x, y);
	canvas_pos.y -= this.riseOffset();
	var tableau_pos = this.tableauPos(canvas_pos.x, canvas_pos.y);
	var panel = this.tableau.getPanel(tableau_pos.row, tableau_pos.col);
	if(panel) {
		this.selection = {
			panel : panel,
			tableau_pos: tableau_pos
		};
		this.tableau_pos = tableau_pos;
		this.onSelect.fire(this.selection);
	}
	else {
		this.selection = null;
	}
	event.preventDefault();
};
	
proto.onMouseup = function(event) {
	this.selection = null;
};
	
proto.onMousemove = function(event) {
	if(this.selection) {
		var x = event.changedTouches ? event.changedTouches[0].pageX : event.pageX;
		var y = event.changedTouches ? event.changedTouches[0].pageY : event.pageY;
		var canvas_pos = this.translate(x, y);
		canvas_pos.y -= this.riseOffset();
		this.tableau_pos = this.tableauPos(canvas_pos.x, canvas_pos.y);
	}
	event.preventDefault();
};

proto.onMousewheel = function(event) {
	var delta = event.wheelDelta ? event.wheelDelta * ((!!window.opera) ? -1 : 1) : event.detail * -1;
	if(delta !== 0) {
		if(this.tableau instanceof JSPDP.RisingTableau) {
			this.tableau.lift();
			event.preventDefault();
		}
	}
};

proto.onActionPhase = function() {
	if(!this.selection) return;
	
	var panel = this.tableau.getPanel(this.selection.tableau_pos.row, this.selection.tableau_pos.col);
	if(panel != this.selection.panel) {
		this.selection = null;
		return;
	}
	
	if(this.lastSwapTick + 3 >= this.tableau.tickCount) return;
	if(this.tableau_pos.col == this.selection.tableau_pos.col) return;
	
	var from_left = this.tableau_pos.col > this.selection.tableau_pos.col;
	var other_x = this.selection.tableau_pos.col + (from_left ? 1 : -1);
	var other_panel = this.tableau.getPanel(this.selection.tableau_pos.row, other_x);
	
	if(!panel || !other_panel) return;
	if(panel.isFalling() || other_panel.isFalling()) return;
		
	if(this.tableau.swap(this.selection.tableau_pos.row, this.selection.tableau_pos.col, from_left)) {
		this.lastSwapTick = this.tableau.tickCount;
		this.selection = {
			panel : panel,
			tableau_pos: {
				col : other_x,
				row : this.selection.tableau_pos.row
			}
		};
	}
};

proto.handleRow = function() {
	if(this.tableau_pos) {
		this.tableau_pos.row++;
	}
	if(this.selection) {
		this.selection.tableau_pos.row++;
	}
};
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

JSPDP.DualController = function() {
}

var proto = (JSPDP.DualController.prototype = new JSPDP.TableauUI());

proto.init = function(settings) {
	JSPDP.TableauUI.prototype.init.call(this, settings);
	
	this.keyboardCursor = new JSPDP.KeyboardCursor().init(settings);
	this.touchController = new JSPDP.TouchController().init(settings);
	
	this.touchController.onSelect.subscribe(this.handleSelect.bind(this));
	this.tableau.onSwap.subscribe(this.handleSwap.bind(this));
	
	return this;
};

proto.handleSelect = function(selection) {
	var row = selection.tableau_pos.row;
	var col = selection.tableau_pos.col;
	
	if(col > 0 && col > this.keyboardCursor.position.col) {
		--col;
	}
	
	if(!this.tableau.bounds(row, col + 1)) --col;
	if(!this.tableau.bounds(row, col)) return;
	
	this.keyboardCursor.moveTo(row, col);
};

proto.handleSwap = function(panels) {
	var row = panels[0].row;
	var col = panels[0].col;
	if(panels[1].col < col) col = panels[1].col;
	this.keyboardCursor.moveTo(row, col);
};

proto.refresh = function() {
	this.keyboardCursor.refresh();
};

proto.update = function() {
	return this.keyboardCursor.update();
};

proto.draw = function(ctx) {
	this.keyboardCursor.draw(ctx);
};
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

JSPDP.ButtonMasher = function() {
}

var proto = (JSPDP.ButtonMasher.prototype = {});

proto.init = function(tableau, cursor) {
	this.tableau = tableau;
	this.cursor = cursor;
	
	return this;
};

proto.runTick = function() {
	var highest = -1;
	this.tableau.eachPanel(function(panel) {
		if(!panel.isAir() && panel.row > highest) highest = panel.row;
	});
	
	if(!this.tableau.active && highest < 10) {
		this.cursor.startAction(JSPDP.Cursor.EAction.Lift);
	} else {
		var behavior = 1;
		if(behavior == 0) {
			var row = Math.floor(Math.random() * (this.tableau.dimensions.height - 1));
			var col = Math.floor(Math.random() * (this.tableau.dimensions.width - 1));
			this.cursor.moveTo(row, col);
			this.cursor.startAction(JSPDP.Cursor.EAction.Swap1);
		} else if(behavior == 1) {
			var action = Math.ceil(Math.random() * JSPDP.Cursor.EAction.LENGTH);
			this.cursor.startAction(action);
		}
	}
};
