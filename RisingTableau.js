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
	
	return this;
}

proto.stopTicks = 0;

proto.liftSpeed = (1 / 60) / 10;
proto.liftOffset = 0;
proto.liftJuice = 0;

proto.runTick = function() {
	if(this.stopTicks > 0) {
		--this.stopTicks;
	} else if(!this.active) {
		this.liftOffset += this.liftSpeed;
		while(this.liftOffset >= 1) {
			this.liftOffset -= 1;
			
			// shift everything up a row
			for(var row = this.dimensions.height - 1; row > 0; row--) {
				for(var col = 0; col < this.dimensions.width; col++) {
					var panel = this.getPanel(row, col);
					this.setPanel(row, col, this.getPanel(row - 1, col)); 
					this.setPanel(row - 1, col, panel);
				}
			}
			
			// add panels from generated row
			// todo: this
			for(var i = 0; i < this.dimensions.width; i++) {
				var panel = new JSPDP.Panel();
				panel.type = 1;
				panel.color = Math.floor(Math.random() * 5);
				this.setPanel(0, i, panel);
			}
			this.needsCheckMatches = true;
			
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
