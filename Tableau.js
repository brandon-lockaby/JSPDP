/*
	The playing field.
	No behavior shall be defined in this class that should be specific to
	any individual gameplay mode, or graphics or audio theme.
*/
JSPDP.Tableau = function(width, height) {

	this.dimensions = {width: width, height: height};
	this.panels = new Array(this.dimensions.height);
	for(var i = 0; i < this.dimensions.height; i++) {
		this.panels[i] = new Array(this.dimensions.width);
		for(var j = 0; j < this.dimensions.width; j++) {
			this.panels[i][j] = new JSPDP.Panel();
		}
	}
	
	// defaults durations from EASY difficulty
	this.durations = {
		hover : 12,
		match : 61,
		pop : 9
	};

	// Events
	this.onActive = new JSPDP.Event();
	this.onInactive = new JSPDP.Event();
	this.onSwap = new JSPDP.Event();
	this.onMatch = new JSPDP.Event();
	this.onPop = new JSPDP.Event();
	this.onLand = new JSPDP.Event();
	this.onActionPhase = new JSPDP.Event();
}

JSPDP.Tableau.prototype = {};

// Scalars

JSPDP.Tableau.prototype.needsCheckMatches = false;
JSPDP.Tableau.prototype.chainLevel = 0;
JSPDP.Tableau.prototype.active = false;

// Operations

JSPDP.Tableau.prototype.resize = function(width, height) {
	
};

JSPDP.Tableau.prototype.bounds = function(row, col) {
	return (row >= 0) && (row < this.dimensions.height) && (col >= 0) && (col < this.dimensions.width);
};

JSPDP.Tableau.prototype.getPanel = function(row, col) {
	if(!this.bounds(row, col)) {
		if(console) console.log("getPanel out of bounds", row, col);
		return null;
	}
	return this.panels[row][col];
};

JSPDP.Tableau.prototype.setPanel = function(row, col, panel) {
	if(this.bounds(row, col)) {
		this.panels[row][col] = panel;
	} else if(console) console.log("setPanel out of bounds ", row, col);
};

JSPDP.Tableau.prototype.eachPanel : function(callback) {
	for(var row = 0; row < this.dimensions.height; row++) {
		for(var col = 0; col < this.dimensions.width; col++) {
			callback(this.getPanel(row, col), row, col);
		}
	}
};

JSPDP.Tableau.prototype.swap = function(row, col, from_left) {
	var other_col = col + (from_left ? 1 : -1);
	var panel = this.getPanel(row, col);
	other_panel = this.getPanel(row, other_col);
	var above = this.getPanel(row + 1, col);
	var other_above = this.getPanel(row + 1, other_col);
	if(panel && panel.canSwap() && other_panel && other_panel.canSwap()
		&& !(panel.isAir() && other_panel.isAir())
		&& (!above || (above && !above.isHovering()))
		&& (!other_above || (other_above && !other_above.isHovering()))
	) {
		
		this.setPanel(row, other_col, panel);
		this.setPanel(row, col, other_panel);
		
		panel.removeFlags(JSPDP.Panel.EFlags.Landing | JSPDP.Panel.EFlags.Falling);
		other_panel.removeFlags(JSPDP.Panel.EFlags.Landing | JSPDP.Panel.EFlags.Falling);
		panel.setTimer(JSPDP.Panel.EFlags.Swapping, 3);
		other_panel.setTimer(JSPDP.Panel.EFlags.Swapping, 3);
		(from_left ? panel : other_panel).addFlags(JSPDP.Panel.EFlags.FromLeft);
		
		// bug removal re: sharpobject@gmail.com
		if(panel.isAir()) {
			if(!other_above.isAir()) other_above.addFlags(JSPDP.Panel.EFlags.DontSwap);
		} else if(other_panel.isAir()) {
			if(!above.isAir()) above.addFlags(JSPDP.Panel.EFlags.DontSwap);
		}
		var below = this.getPanel(row - 1, col);
		var other_below = this.getPanel(row - 1, other_col);
		if(!panel.isAir()) {
			if(other_below && other_below.isAir()) other_below.addFlags(JSPDP.Panel.EFlags.DontSwap);
		}
		if(!other_panel.isAir()) {
			if(below && below.isAir()) below.addFlags(JSPDP.Panel.EFlags.DontSwap);
		}
		
		this.onSwap.fire();
		
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
		
		return true;
	}
	return false;
};

JSPDP.Tableau.prototype.setHoverers = function(row, col, ticks, flags) {
	while(true) {
		var panel = this.getPanel(row, col);
		if(!panel || !panel.canHover()) {
			break;
		}
		if(panel.isSwapping()) {
			ticks += panel.timer;
		}
		// note: hovering removes other flags such as DontSwap
		panel.flags = flags | panel.getFlags(JSPDP.Panel.EFlags.Chaining);
		panel.setTimer(JSPDP.Panel.EFlags.Hovering, ticks);
		++row;
	}
};

JSPDP.Tableau.prototype.runTick = function() {
	// OTODO: decrement stop time (outside of this class)
	// OTODO: set bounce (outside of this class)
	// OTODO: set danger music (outside of this class)
	// OTODO: generate another row if needed (outside of this class)
	// OTODO: death (outside of this class)
	// OTODO: natural rise (outisde of this class)
	
	this.runFlagsPhase();
	this.onActionPhase.fire();
	this.runLandingPhase();
	this.runMatchPhase();
	this.runWrapUpPhase();
};

// Phases for runTick

JSPDP.Tableau.prototype.runFlagsPhase = function() {
	var self = this;
	this.eachPanel(function(panel, row, col) {
		// falling
		if(panel.isFalling()) {
			// should always be only displacing air
			var other_panel = self.getPanel(row - 1, col);
			other_panel.flags = 0;
			self.setPanel(row, col, other_panel); 
			self.setPanel(row - 1, col, panel);
		}
		// timers decrementing
		else if(panel.timer > 0) {
			panel.decrementTimer();
			if(!panel.timer) {
				if(panel.isSwapping()) {
					self.expireSwapping(panel, row, col);
				}
				else if(panel.isHovering()) {
					self.expireHovering(panel, row, col);
				}
				else if(panel.isLanding()) {
					self.expireLanding(panel, row, col);
				}
				else if(panel.isMatching()) {
					self.expireMatching(panel, row, col);
				}
				else if(panel.isPopping()) {
					self.expirePopping(panel, row, col);
				}
				else if(panel.isPopped()) {
					self.expirePopped(panel, row, col);
				}
				else {
					if(console) console.log("wat", row, col, panel);
				}
			}
		}
	});
};

JSPDP.Tableau.prototype.runLandingPhase = function() {
	var result = false;
	var self = this;
	this.eachPanel(function(panel, row, col) {
		if(panel.isFalling()) {
			if(row == 0) {
				panel.removeFlags(JSPDP.Panel.EFlags.Falling);
				panel.setTimer(JSPDP.Panel.EFlags.Landing, 12);
				self.needsCheckMatches = true;
				result = true;
			}
			else {
				var panel_below = self.getPanel(row - 1, col);
				if(!panel_below.isAir()) {
					if(!panel_below.isFalling()) {
						panel.removeFlags(JSPDP.Panel.EFlags.Falling);
						if(panel_below.isHovering()) {
							// hover and inherit the hover time of the panel it's landing on
							self.setHoverers(row, col, panel_below.timer, 0);
						}
						else {
							panel.setTimer(JSPDP.Panel.EFlags.Landing, 12);
							result = true;
							self.needsCheckMatches = true;
						}
					}
				}
			}
		}
	});
	if(result) {
		this.onLand.fire();
	}
};

JSPDP.Tableau.prototype.runMatchPhase = function() {
	if(this.needsCheckMatches) {
		this.needsCheckMatches = false;

		this.eachPanel(function(panel, row, col) {
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
					panel.chainIndex = this.chainLevel;
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
			this.onMatch.fire();
		}
		
		// OTODO: score
		// OTODO: combo card, confetti, chain card
		// OTODO: stop time
		// OTODO: disallow manual raise?
	}
};

JSPDP.Tableau.prototype.runWrapUpPhase = function() {
	var active_count = 0;
	var chaining_count = 0;
	this.eachPanel(function(panel, row, col) {
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

JSPDP.Tableau.prototype.expireSwapping = function(panel, row, col) {
	panel.removeFlags(JSPDP.Panel.EFlags.Swapping | JSPDP.Panel.EFlags.DontSwap);
	var from_left = panel.getFlags(JSPDP.Panel.EFlags.FromLeft);
	if(from_left) {
		panel.removeFlags(JSPDP.Panel.EFlags.FromLeft);
	}
	// Now there are a few cases where some hovering must be done.
	if(!panel.isAir() && row != 0) {
		var panel_below = this.getPanel(row - 1, col);
		if(panel_below.isAir()) {
			panel.setTimer(JSPDP.Panel.EFlags.Hovering, this.durations.hover);
			this.setHoverers(row + 1, col, this.durations.hover + 1, 0);
			// CRAZY BUG EMULATION:
			// the space it was swapping from hovers too
			var other_col = col + (from_left ? -1 : 1);
			var other_panel = this.getPanel(row, other_col);
			if(other_panel.isFalling()) {
				if(from_left) {
					other_panel.setTimer(JSPDP.Panel.EFlags.Hovering, this.durations.hover);
					this.setHoverers(row + 1, other_col, this.durations.hover + 1, 0);
				}
				else {
					this.setHoverers(row, other_col, this.durations.hover, 0);
				}
			}
		}
		else if(panel_below.isHovering()) {
			panel.setTimer(JSPDP.Panel.EFlags.Hovering, this.durations.hover);
			this.setHoverers(row + 1, col, this.durations.hover + 1, 0);
		}
	}
	else if(panel.isAir()) {
		// an empty space finished swapping; panels above it hover
		this.setHoverers(row + 1, col, this.durations.hover + 1, 0);
	}
	this.needsCheckMatches = true;
};

JSPDP.Tableau.prototype.expireHovering = function(panel, row, col) {
	panel.removeFlags(JSPDP.Panel.EFlags.Hovering);
	panel.addFlags(JSPDP.Panel.EFlags.Falling);
	var other_panel = this.getPanel(row - 1, col); // air
	other_panel.flags = 0;
	this.setPanel(row, col, other_panel);
	this.setPanel(row - 1, col, panel);
};

JSPDP.Tableau.prototype.expireLanding = function(panel, row, col) {
	panel.removeFlags(JSPDP.Panel.EFlags.Landing);
};

JSPDP.Tableau.prototype.expireMatching = function(panel, row, col) {
	panel.removeFlags(JSPDP.Panel.EFlags.Matching);
	panel.setTimer(JSPDP.Panel.EFlags.Popping, panel.comboIndex * this.durations.pop);
};

JSPDP.Tableau.prototype.expirePopping = function(panel, row, col) {
	// if it's the last panel to pop, it should be removed immediately
	if(panel.comboIndex == panel.comboSize) {
		this.setPanel(row, col, new JSPDP.Panel());
		this.setHoverers(row + 1, col, this.durations.hover + 1, JSPDP.Panel.EFlags.Chaining);
	}
	else {
		panel.removeFlags(JSPDP.Panel.EFlags.Popping);
		panel.setTimer(JSPDP.Panel.EFlags.Popped, (panel.comboSize - panel.comboIndex) * this.durations.pop);
	}
	this.onPop.fire();
};

JSPDP.Tableau.prototype.expirePopped = function(panel, row, col) {
	this.setPanel(row, col, new JSPDP.Panel());
	this.setHoverers(row + 1, col, this.durations.hover + 1, JSPDP.Panel.EFlags.Chaining);
};