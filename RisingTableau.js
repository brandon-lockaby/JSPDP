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

proto.init = function(width, height) {
	JSPDP.Tableau.prototype.init.call(this, width, height);
	
	this.onRise = new JSPDP.Event();
	this.onRow = new JSPDP.Event();
	this.onTopout = new JSPDP.Event();
	
	this.onCombo.subscribe(this.handleCombo.bind(this));
	
	this.generator = new JSPDP.Generator().init(width);
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
	} else if(!this.active) {
	
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
			
			this.onRow.fire();
		}
		this.onRise.fire();
	}
	
	JSPDP.Tableau.prototype.runTick.call(this);
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
