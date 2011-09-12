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
			this.ctx.fillRect(canvas_pos.x, canvas_pos.y, this.theme.panelDimensions.width, this.theme.panelDimensions.height);
		} else if(panel.isPopping()) {
			// render gray
			this.ctx.fillStyle = "rgb(64,64,64)";
			this.ctx.fillRect(canvas_pos.x, canvas_pos.y, this.theme.panelDimensions.width, this.theme.panelDimensions.height);
			this.ctx.fillStyle = "rgb(255,255,255)";
		} else {
			// render normally
			this.ctx.drawImage(this.theme.panelImages[panel.color], canvas_pos.x, canvas_pos.y);
		}
	} else {
		this.ctx.clearRect(canvas_pos.x, canvas_pos.y, this.theme.panelDimensions.width, this.theme.panelDimensions.height);
	}
};

proto.renderSwappingPanel = function(panel) {
	if(!panel.isAir()) {
		var canvas_pos = this.canvasPos(panel.row, panel.col);
		var offs = this.theme.panelDimensions.width / 4;
		offs *= (4 - panel.timer);
		if(panel.flags & JSPDP.Panel.EFlags.FromLeft) {
			offs = -this.theme.panelDimensions.width + offs;
		} else {
			offs = this.theme.panelDimensions.width - offs;
		}
		this.ctx.drawImage(this.theme.panelImages[panel.color], canvas_pos.x + offs, canvas_pos.y);
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
		this.ctx.drawImage(this.theme.panelImages[this.tableau.generator.current[i]], this.theme.panelDimensions.width * i, canvas_pos.y);
	}
	this.ctx.save();
	this.ctx.fillStyle = "rgb(0,0,0)";
	this.ctx.globalAlpha = 0.6;
	this.ctx.fillRect(0, canvas_pos.y, this.theme.panelDimensions.width * this.tableau.dimensions.width, this.theme.panelDimensions.width);
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
