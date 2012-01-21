function JSPDP() {
}
if(!Function.prototype.bind) {
  Function.prototype.bind = function() {
    var a = this, b = Array.prototype.slice.call(arguments), c = b.shift();
    return function() {
      return a.apply(c, b.concat(Array.prototype.slice.call(arguments)))
    }
  }
}
;var MersenneTwister = function(a) {
  a == void 0 && (a = (new Date).getTime());
  this.N = 624;
  this.M = 397;
  this.MATRIX_A = 2567483615;
  this.UPPER_MASK = 2147483648;
  this.LOWER_MASK = 2147483647;
  this.mt = Array(this.N);
  this.mti = this.N + 1;
  this.init_genrand(a)
};
MersenneTwister.prototype.init_genrand = function(a) {
  this.mt[0] = a >>> 0;
  for(this.mti = 1;this.mti < this.N;this.mti++) {
    a = this.mt[this.mti - 1] ^ this.mt[this.mti - 1] >>> 30, this.mt[this.mti] = (((a & 4294901760) >>> 16) * 1812433253 << 16) + (a & 65535) * 1812433253 + this.mti, this.mt[this.mti] >>>= 0
  }
};
MersenneTwister.prototype.init_by_array = function(a, b) {
  var c, d, f;
  this.init_genrand(19650218);
  c = 1;
  d = 0;
  for(f = this.N > b ? this.N : b;f;f--) {
    var e = this.mt[c - 1] ^ this.mt[c - 1] >>> 30;
    this.mt[c] = (this.mt[c] ^ (((e & 4294901760) >>> 16) * 1664525 << 16) + (e & 65535) * 1664525) + a[d] + d;
    this.mt[c] >>>= 0;
    c++;
    d++;
    c >= this.N && (this.mt[0] = this.mt[this.N - 1], c = 1);
    d >= b && (d = 0)
  }
  for(f = this.N - 1;f;f--) {
    e = this.mt[c - 1] ^ this.mt[c - 1] >>> 30, this.mt[c] = (this.mt[c] ^ (((e & 4294901760) >>> 16) * 1566083941 << 16) + (e & 65535) * 1566083941) - c, this.mt[c] >>>= 0, c++, c >= this.N && (this.mt[0] = this.mt[this.N - 1], c = 1)
  }
  this.mt[0] = 2147483648
};
MersenneTwister.prototype.genrand_int32 = function() {
  var a, b = [0, this.MATRIX_A];
  if(this.mti >= this.N) {
    var c;
    this.mti == this.N + 1 && this.init_genrand(5489);
    for(c = 0;c < this.N - this.M;c++) {
      a = this.mt[c] & this.UPPER_MASK | this.mt[c + 1] & this.LOWER_MASK, this.mt[c] = this.mt[c + this.M] ^ a >>> 1 ^ b[a & 1]
    }
    for(;c < this.N - 1;c++) {
      a = this.mt[c] & this.UPPER_MASK | this.mt[c + 1] & this.LOWER_MASK, this.mt[c] = this.mt[c + (this.M - this.N)] ^ a >>> 1 ^ b[a & 1]
    }
    a = this.mt[this.N - 1] & this.UPPER_MASK | this.mt[0] & this.LOWER_MASK;
    this.mt[this.N - 1] = this.mt[this.M - 1] ^ a >>> 1 ^ b[a & 1];
    this.mti = 0
  }
  a = this.mt[this.mti++];
  a ^= a >>> 11;
  a ^= a << 7 & 2636928640;
  a ^= a << 15 & 4022730752;
  a ^= a >>> 18;
  return a >>> 0
};
MersenneTwister.prototype.genrand_int31 = function() {
  return this.genrand_int32() >>> 1
};
MersenneTwister.prototype.genrand_real1 = function() {
  return this.genrand_int32() * (1 / 4294967295)
};
MersenneTwister.prototype.random = function() {
  return this.genrand_int32() * (1 / 4294967296)
};
MersenneTwister.prototype.genrand_real3 = function() {
  return(this.genrand_int32() + 0.5) * (1 / 4294967296)
};
MersenneTwister.prototype.genrand_res53 = function() {
  var a = this.genrand_int32() >>> 5, b = this.genrand_int32() >>> 6;
  return(a * 67108864 + b) * 1.1102230246251565E-16
};
JSPDP.Event = function() {
  this.subscribers = []
};
JSPDP.Event.prototype = {subscribe:function(a) {
  this.subscribers.push(a)
}, unsubscribe:function(a) {
  for(var b = 0;b < this.subscribers.length;b++) {
    if(this.subscribers[b] == a) {
      this.subscribers.splice(b, 1);
      break
    }
  }
}, fire:function() {
  for(var a = 0;a < this.subscribers.length;a++) {
    this.subscribers[a].apply(this, arguments)
  }
}};
JSPDP.ImageLoader = function() {
};
var proto = JSPDP.ImageLoader.prototype = {};
proto.init = function(a, b, c) {
  this.complete_callback = b;
  this.progress_callback = c;
  this.image_map = [];
  this.total = a.length;
  this.complete = 0;
  this.progressed();
  for(b = 0;b < a.length;b++) {
    var c = a[b], d = new Image;
    d.src = c;
    if(d.complete) {
      this.onImage(c, d)
    }else {
      d.onload = this.onImage.bind(this, c, d), d.onerror = this.onImage.bind(this, c, !1), d.onabort = d.onerror
    }
    this.image_map[c] = d
  }
};
proto.getProgress = function() {
  return{total:this.total, complete:this.complete, percent:this.complete / this.total * 100, image_map:this.image_map}
};
proto.onImage = function(a, b) {
  this.image_map[a] = b;
  this.complete++;
  this.progressed()
};
proto.progressed = function() {
  var a = this.getProgress();
  this.progress_callback && this.progress_callback(a);
  a.complete == a.total && this.complete_callback && this.complete_callback(a)
};
JSPDP.Panel = function() {
};
proto = JSPDP.Panel.prototype = {};
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
  this.timer > 0 && --this.timer
};
proto.resetFlags = function(a) {
  this.flags = a
};
proto.removeFlags = function(a) {
  this.flags &= ~a
};
proto.getFlags = function(a) {
  return this.flags & a
};
proto.addFlags = function(a) {
  this.flags |= a
};
proto.setTimer = function(a, b) {
  this.flags |= a;
  this.timer = b
};
proto.isAir = function() {
  return this.type == 0
};
proto.isActive = function() {
  return this.flags != 0
};
proto.isFalling = function() {
  return this.flags & JSPDP.Panel.EFlags.Falling
};
proto.isSwapping = function() {
  return this.flags & JSPDP.Panel.EFlags.Swapping
};
proto.isHovering = function() {
  return this.flags & JSPDP.Panel.EFlags.Hovering
};
proto.isChaining = function() {
  return this.flags & JSPDP.Panel.EFlags.Chaining
};
proto.isMatching = function() {
  return this.flags & JSPDP.Panel.EFlags.Matching
};
proto.isPopping = function() {
  return this.flags & JSPDP.Panel.EFlags.Popping
};
proto.isPopped = function() {
  return this.flags & JSPDP.Panel.EFlags.Popped
};
proto.isLanding = function() {
  return this.flags & JSPDP.Panel.EFlags.Landing
};
proto.canHover = function() {
  return!this.isAir() && !(this.flags & (JSPDP.Panel.EFlags.Matching | JSPDP.Panel.EFlags.Popping | JSPDP.Panel.EFlags.Popped | JSPDP.Panel.EFlags.Hovering | JSPDP.Panel.EFlags.Falling | JSPDP.Panel.EFlags.Swapping))
};
proto.canMatch = function() {
  return!this.isAir() && !(this.flags & (JSPDP.Panel.EFlags.Matching | JSPDP.Panel.EFlags.Popping | JSPDP.Panel.EFlags.Popped | JSPDP.Panel.EFlags.Hovering | JSPDP.Panel.EFlags.Falling | JSPDP.Panel.EFlags.Swapping))
};
proto.canSwap = function() {
  return!(this.flags & (JSPDP.Panel.EFlags.Matching | JSPDP.Panel.EFlags.Popping | JSPDP.Panel.EFlags.Popped | JSPDP.Panel.EFlags.Hovering | JSPDP.Panel.EFlags.DontSwap))
};
JSPDP.Panel.EFlags = {Swapping:1, FromLeft:2, DontSwap:4, Matching:8, Popping:16, Popped:32, Hovering:64, Falling:128, Chaining:256, Landing:512};
JSPDP.Generator = function() {
};
proto = JSPDP.Generator.prototype = {};
proto.init = function(a) {
  this.rng = new MersenneTwister(1999);
  this.width = a;
  this.history = [];
  for(var b = 0;b < 2;b++) {
    for(var c = Array(a), d = 0;d < 2;d++) {
      c[d] = -1
    }
    this.history.push(c)
  }
  this.current = Array(a);
  for(b = 0;b < a;b++) {
    this.current[b] = -1
  }
  return this
};
proto.generateRow = function(a) {
  this.history[1] = this.history[0];
  this.history[0] = this.current;
  for(var b = 0;b < this.width;b++) {
    var c;
    do {
      c = Math.floor(this.rng.random() * a)
    }while(this.history[0][b] == c && this.history[0][b] == this.history[1][b] || b >= 2 && this.current[b - 1] == c && this.current[b - 2] == this.current[b - 1]);
    this.current[b] = c
  }
};
proto.generateField = function(a, b, c, d) {
  for(var f = [], e = 0;e < this.width;e++) {
    f.push([])
  }
  var g = function(a, b) {
    if(typeof a == "object" && typeof a.length != "undefined" && (b < 0 && (b = a.length + b), !(b < 0))) {
      return a.length <= b ? void 0 : a[b]
    }
  }, h = g;
  d || (h = function(a, b) {
    return b < 0 ? void 0 : g(a, b)
  });
  for(e = 0;e < b;e++) {
    var i = Math.floor(this.rng.random() * this.width), k = f[i];
    if(k.length >= c) {
      --e
    }else {
      var j = -(k.length + 1), m = g(h(f, i - 2), j), l = g(h(f, i - 1), j), d = g(h(f, i + 1), j), j = g(h(f, i + 2), j);
      do {
        i = Math.floor(this.rng.random() * a)
      }while(g(k, 0) == i && g(k, 1) == i || m == l && l == i || l == i && d == i || d == i && j == i);
      k.unshift(i)
    }
  }
  a = [];
  for(e = 0;e < c;e++) {
    j = [];
    for(d = 0;d < this.width;d++) {
      j.push(g(f[d], -(e + 1)))
    }
    a.push(j)
  }
  this.history[1] = a[2];
  this.history[0] = a[1];
  this.current = a[0];
  return a
};
proto.generateFieldTA = function(a) {
  return this.generateField(a, 30, 6, !1)
};
proto.generateFieldPDPDS = function(a) {
  return this.generateField(a, 24, 5, !1)
};
JSPDP.Tableau = function() {
};
proto = JSPDP.Tableau.prototype = {};
proto.init = function(a, b) {
  this.durations = {hover:12, match:61, pop:9};
  this.onActionPhase = new JSPDP.Event;
  this.onActive = new JSPDP.Event;
  this.onInactive = new JSPDP.Event;
  this.onSetPanel = new JSPDP.Event;
  this.onSwap = new JSPDP.Event;
  this.onLand = new JSPDP.Event;
  this.onCombo = new JSPDP.Event;
  this.onPop = new JSPDP.Event;
  this.dimensions = {width:a, height:b};
  this.panels = Array(this.dimensions.height);
  for(var c = 0;c < this.dimensions.height;c++) {
    this.panels[c] = Array(this.dimensions.width);
    for(var d = 0;d < this.dimensions.width;d++) {
      this.setPanel(c, d, new JSPDP.Panel)
    }
  }
  return this
};
proto.needsCheckMatches = !1;
proto.chainLevel = 0;
proto.active = !0;
proto.tickCount = 0;
proto.bounds = function(a, b) {
  return a >= 0 && a < this.dimensions.height && b >= 0 && b < this.dimensions.width
};
proto.getPanel = function(a, b) {
  return!this.bounds(a, b) ? null : this.panels[a][b]
};
proto.setPanel = function(a, b, c) {
  this.bounds(a, b) ? (c.row = a, c.col = b, this.panels[a][b] = c, this.onSetPanel.fire(c)) : console && console.log("setPanel out of bounds ", a, b)
};
proto.eachPanel = function(a) {
  for(var b = 0;b < this.dimensions.height;b++) {
    for(var c = 0;c < this.dimensions.width;c++) {
      a(this.getPanel(b, c))
    }
  }
};
proto.swap = function(a, b, c) {
  var d = b + (c ? 1 : -1), f = this.getPanel(a, b);
  other_panel = this.getPanel(a, d);
  var e = this.getPanel(a + 1, b), g = this.getPanel(a + 1, d);
  if(f && f.canSwap() && other_panel && other_panel.canSwap() && (!f.isAir() || !other_panel.isAir()) && (!e || e && !e.isHovering()) && (!g || g && !g.isHovering())) {
    var h = JSPDP.Panel.EFlags.Landing | JSPDP.Panel.EFlags.Falling | JSPDP.Panel.EFlags.FromLeft;
    f.removeFlags(h);
    other_panel.removeFlags(h);
    f.setTimer(JSPDP.Panel.EFlags.Swapping, 3);
    other_panel.setTimer(JSPDP.Panel.EFlags.Swapping, 3);
    (c ? f : other_panel).addFlags(JSPDP.Panel.EFlags.FromLeft);
    this.setPanel(a, d, f);
    this.setPanel(a, b, other_panel);
    f.isAir() ? g && !g.isAir() && (g.addFlags(JSPDP.Panel.EFlags.DontSwap), other_panel.addFlags(JSPDP.Panel.EFlags.DontSwap)) : other_panel.isAir() && e && !e.isAir() && (e.addFlags(JSPDP.Panel.EFlags.DontSwap), f.addFlags(JSPDP.Panel.EFlags.DontSwap));
    c = this.getPanel(a - 1, b);
    e = this.getPanel(a - 1, d);
    f.isAir() || e && e.isAir() && e.addFlags(JSPDP.Panel.EFlags.DontSwap);
    other_panel.isAir() || c && c.isAir() && c.addFlags(JSPDP.Panel.EFlags.DontSwap);
    a > 0 && ((b = this.getPanel(a - 1, b)) && (b.isAir() || b.isFalling()) && other_panel.addFlags(JSPDP.Panel.EFlags.DontSwap), (b = this.getPanel(a - 1, d)) && (b.isAir() || b.isFalling()) && f.addFlags(JSPDP.Panel.EFlags.DontSwap));
    this.onSwap.fire([f, other_panel]);
    return!0
  }
  return!1
};
proto.setHoverers = function(a, b, c, d) {
  for(;;) {
    var f = this.getPanel(a, b);
    if(!f || !f.canHover()) {
      break
    }
    f.isSwapping() && (c += f.timer);
    f.resetFlags(d | f.getFlags(JSPDP.Panel.EFlags.Chaining));
    f.setTimer(JSPDP.Panel.EFlags.Hovering, c);
    ++a
  }
};
proto.runTick = function() {
  this.runFlagsPhase();
  this.onActionPhase.fire();
  this.runLandingPhase();
  this.runMatchPhase();
  this.runWrapUpPhase();
  ++this.tickCount
};
proto.runFlagsPhase = function() {
  var a = this;
  this.eachPanel(function(b) {
    if(b.isFalling()) {
      var c = a.getPanel(b.row - 1, b.col);
      c.isAir() ? (a.setPanel(b.row, b.col, c), a.setPanel(b.row - 1, b.col, b)) : (b.removeFlags(JSPDP.Panel.EFlags.Falling | JSPDP.Panel.EFlags.DontSwap), b.setTimer(JSPDP.Panel.EFlags.Landing, 12), a.needsCheckMatches = !0, a.onLand.fire(b))
    }else {
      b.timer > 0 && (b.decrementTimer(), b.timer || (b.isSwapping() ? a.expireSwapping(b) : b.isHovering() ? a.expireHovering(b) : b.isLanding() ? a.expireLanding(b) : b.isMatching() ? a.expireMatching(b) : b.isPopping() ? a.expirePopping(b) : b.isPopped() ? a.expirePopped(b) : console && console.log("wat", b)))
    }
  })
};
proto.runLandingPhase = function() {
  var a = this;
  this.eachPanel(function(b) {
    if(b.isFalling()) {
      if(b.row == 0) {
        b.removeFlags(JSPDP.Panel.EFlags.Falling | JSPDP.Panel.EFlags.DontSwap), b.setTimer(JSPDP.Panel.EFlags.Landing, 12), a.needsCheckMatches = !0, a.onLand.fire(b)
      }else {
        var c = a.getPanel(b.row - 1, b.col);
        if(!c.isAir() && !c.isFalling()) {
          b.removeFlags(JSPDP.Panel.EFlags.Falling | JSPDP.Panel.EFlags.DontSwap), c.isHovering() ? a.setHoverers(b.row, b.col, c.timer, 0) : (b.setTimer(JSPDP.Panel.EFlags.Landing, 12), a.needsCheckMatches = !0, a.onLand.fire(b))
        }
      }
    }
  })
};
proto.runMatchPhase = function() {
  if(this.needsCheckMatches) {
    this.needsCheckMatches = !1;
    this.eachPanel(function(a) {
      a._checkMatches_matched = 0
    });
    for(var a, b, c, d = 0, f = 0, e = 0;e < this.dimensions.width;e++) {
      b = null;
      for(var g = c = 0;g < this.dimensions.height;g++) {
        a = this.getPanel(g, e);
        if(!a.isAir() && a.canMatch()) {
          if(c) {
            if(a.color == b.color) {
              if(++c >= 3) {
                if(!a._checkMatches_matched) {
                  a._checkMatches_matched = 1, ++d, a.isChaining() && (f = 1)
                }
                if(c == 3) {
                  d += 2, b = this.getPanel(g - 1, e), b._checkMatches_matched = 1, b.isChaining() && (f = 1), b = this.getPanel(g - 2, e), b._checkMatches_matched = 1, b.isChaining() && (f = 1)
                }
              }
            }else {
              c = 1
            }
          }else {
            c = 1
          }
        }else {
          c = 0
        }
        b = a
      }
    }
    for(g = 0;g < this.dimensions.height;g++) {
      b = null;
      for(e = c = 0;e < this.dimensions.width;e++) {
        a = this.getPanel(g, e);
        if(!a.isAir() && a.canMatch()) {
          if(c) {
            if(a.color == b.color) {
              if(++c >= 3) {
                if(!a._checkMatches_matched) {
                  a._checkMatches_matched = 1, ++d, a.isChaining() && (f = 1)
                }
                if(c == 3) {
                  b = this.getPanel(g, e - 1);
                  if(!b._checkMatches_matched) {
                    b._checkMatches_matched = 1, ++d, b.isChaining() && (f = 1)
                  }
                  b = this.getPanel(g, e - 2);
                  if(!b._checkMatches_matched) {
                    b._checkMatches_matched = 1, ++d, b.isChaining() && (f = 1)
                  }
                }
              }
            }else {
              c = 1
            }
          }else {
            c = 1
          }
        }else {
          c = 0
        }
        b = a
      }
    }
    if(f) {
      this.chainLevel = this.chainLevel ? this.chainLevel + 1 : 2
    }
    c = 1;
    b = [];
    for(g = this.dimensions.height - 1;g >= 0;g--) {
      for(e = 0;e < this.dimensions.width;e++) {
        a = this.getPanel(g, e), a._checkMatches_matched ? (a.setTimer(JSPDP.Panel.EFlags.Matching, this.durations.match), f && !a.isChaining() && a.addFlags(JSPDP.Panel.EFlags.Chaining), a.removeFlags(JSPDP.Panel.EFlags.Landing), a.comboSize = d, a.comboIndex = c, a.chainIndex = f ? this.chainLevel : 0, b.push(a), ++c) : a.isChaining() && a.canMatch() && (g > 0 ? this.getPanel(g - 1, e).isSwapping() || a.removeFlags(JSPDP.Panel.EFlags.Chaining) : a.removeFlags(JSPDP.Panel.EFlags.Chaining))
      }
    }
    d && this.onCombo.fire(b)
  }
};
proto.runWrapUpPhase = function() {
  var a = 0, b = 0;
  this.eachPanel(function(c) {
    c.isActive() && ++a;
    c.isChaining() && ++b
  });
  var c = a > 0;
  if(this.active != c) {
    (this.active = c) ? this.onActive.fire() : this.onInactive.fire()
  }
  if(b == 0) {
    this.chainLevel = 0
  }
};
proto.expireSwapping = function(a) {
  a.removeFlags(JSPDP.Panel.EFlags.Swapping | JSPDP.Panel.EFlags.DontSwap);
  var b = this.getPanel(a.row + 1, a.col);
  b && b.removeFlags(JSPDP.Panel.EFlags.DontSwap);
  (b = a.getFlags(JSPDP.Panel.EFlags.FromLeft)) && a.removeFlags(JSPDP.Panel.EFlags.FromLeft);
  if(!a.isAir() && a.row != 0) {
    var c = this.getPanel(a.row - 1, a.col);
    if(c.isAir()) {
      a.setTimer(JSPDP.Panel.EFlags.Hovering, this.durations.hover);
      this.setHoverers(a.row + 1, a.col, this.durations.hover + 1, 0);
      var c = a.col + (b ? -1 : 1), d = this.getPanel(a.row, c);
      d.isFalling() && (b ? (d.setTimer(JSPDP.Panel.EFlags.Hovering, this.durations.hover), this.setHoverers(a.row + 1, c, this.durations.hover + 1, 0)) : this.setHoverers(a.row, c, this.durations.hover, 0))
    }else {
      c.isHovering() && (a.setTimer(JSPDP.Panel.EFlags.Hovering, this.durations.hover), this.setHoverers(a.row + 1, a.col, this.durations.hover + 1, 0))
    }
  }else {
    a.isAir() && this.setHoverers(a.row + 1, a.col, this.durations.hover + 1, 0)
  }
  this.needsCheckMatches = !0
};
proto.expireHovering = function(a) {
  a.removeFlags(JSPDP.Panel.EFlags.Hovering | JSPDP.Panel.EFlags.DontSwap);
  a.addFlags(JSPDP.Panel.EFlags.Falling);
  var b = this.getPanel(a.row - 1, a.col);
  b.resetFlags(0);
  this.setPanel(a.row, a.col, b);
  this.setPanel(a.row - 1, a.col, a)
};
proto.expireLanding = function(a) {
  a.removeFlags(JSPDP.Panel.EFlags.Landing)
};
proto.expireMatching = function(a) {
  a.removeFlags(JSPDP.Panel.EFlags.Matching);
  a.setTimer(JSPDP.Panel.EFlags.Popping, a.comboIndex * this.durations.pop)
};
proto.expirePopping = function(a) {
  a.comboIndex == a.comboSize ? (a.removeFlags(JSPDP.Panel.EFlags.Popping), a.addFlags(JSPDP.Panel.EFlags.Popped), this.setPanel(a.row, a.col, new JSPDP.Panel), this.setHoverers(a.row + 1, a.col, this.durations.hover + 1, JSPDP.Panel.EFlags.Chaining)) : (a.removeFlags(JSPDP.Panel.EFlags.Popping), a.setTimer(JSPDP.Panel.EFlags.Popped, (a.comboSize - a.comboIndex) * this.durations.pop));
  this.onPop.fire(a)
};
proto.expirePopped = function(a) {
  this.setPanel(a.row, a.col, new JSPDP.Panel);
  this.setHoverers(a.row + 1, a.col, this.durations.hover + 1, JSPDP.Panel.EFlags.Chaining)
};
JSPDP.RisingTableau = function() {
};
proto = JSPDP.RisingTableau.prototype = new JSPDP.Tableau;
proto.toppedOut = !1;
proto.init = function(a, b) {
  JSPDP.Tableau.prototype.init.call(this, a, b);
  this.onRise = new JSPDP.Event;
  this.onRow = new JSPDP.Event;
  this.onTopout = new JSPDP.Event;
  this.onCombo.subscribe(this.handleCombo.bind(this));
  this.generator = (new JSPDP.Generator).init(a);
  for(var c = this.generator.generateFieldTA(5), d = 0;d < c.length;d++) {
    for(var f = 0;f < this.dimensions.width;f++) {
      if(c[d][f] != void 0) {
        var e = new JSPDP.Panel;
        e.color = c[d][f];
        e.type = 1;
        this.setPanel(d, f, e)
      }
    }
  }
  this.generator.generateRow(5);
  return this
};
proto.stopTicks = 0;
proto.riseSpeed = 1 / 60 / 10;
proto.riseOffset = 0;
proto.liftSpeed = 0.0625;
proto.liftJuice = 0;
proto.runTick = function() {
  if(this.active) {
    this.liftJuice = 0
  }
  if(this.liftJuice > 0) {
    this.stopTicks = 0
  }
  if(this.stopTicks > 0) {
    --this.stopTicks
  }else {
    if(!this.active && !this.toppedOut) {
      if(this.liftJuice > 0) {
        if(this.riseOffset += this.liftSpeed, this.liftJuice -= 0.0625, this.liftJuice < 0) {
          this.liftJuice = 0
        }
      }else {
        this.riseOffset += this.riseSpeed
      }
      for(;this.riseOffset >= 1;) {
        this.riseOffset -= 1;
        for(var a = this.dimensions.height - 1;a > 0;a--) {
          for(var b = 0;b < this.dimensions.width;b++) {
            var c = this.getPanel(a, b);
            this.setPanel(a, b, this.getPanel(a - 1, b));
            this.setPanel(a - 1, b, c)
          }
        }
        for(a = 0;a < this.dimensions.width;a++) {
          c = new JSPDP.Panel, c.type = 1, c.color = this.generator.current[a], this.setPanel(0, a, c)
        }
        this.needsCheckMatches = !0;
        this.generator.generateRow(5);
        this.liftJuice = 0;
        c = this.panels[this.panels.length - 1];
        for(a = 0;a < c.length;a++) {
          if(!c[a].isAir()) {
            this.toppedOut = !0;
            this.riseOffset = 0;
            break
          }
        }
        this.onRow.fire()
      }
      this.onRise.fire()
    }
  }
  JSPDP.Tableau.prototype.runTick.call(this);
  if(this.toppedOut) {
    this.toppedOut = !1;
    c = this.panels[this.panels.length - 1];
    for(a = 0;a < c.length;a++) {
      if(!c[a].isAir()) {
        this.toppedOut = !0;
        break
      }
    }
  }
  this.toppedOut && !this.stopTicks && !this.active && (this.onTopout.fire(), console.log("topout"))
};
proto.handleCombo = function(a) {
  a = a[0];
  if(a.comboSize > 3 || a.chainIndex > 1) {
    if(this.stopTicks += 60 * (this.stopTicks ? 1 : 5), this.stopTicks > 5940) {
      this.stopTicks = 5940
    }
  }
};
proto.lift = function() {
  if(!this.liftJuice) {
    this.liftJuice = 1
  }
};
JSPDP.GraphicsTheme = function() {
};
proto = JSPDP.GraphicsTheme.prototype = {};
proto.init = function(a, b) {
  this.onload = new JSPDP.Event;
  this.onload.subscribe(b);
  this.path = a;
  this.panelDimensions = {width:64, height:64};
  this.panelImages = [];
  var c = [this.path + "/panels.png", this.path + "/yellow-duck.png", this.path + "/cursor.png"], d = this;
  (new JSPDP.ImageLoader).init(c, function(a) {
    console && console.log("Images loaded: ", a);
    for(var b = a.image_map[d.path + "/panels.png"], c = 0;c < 5;c++) {
      var h = document.createElement("canvas");
      h.width = d.panelDimensions.width;
      h.height = d.panelDimensions.height;
      h.getContext("2d").drawImage(b, d.panelDimensions.width * c, 0, d.panelDimensions.width, d.panelDimensions.height, 0, 0, d.panelDimensions.width, d.panelDimensions.height);
      d.panelImages[c] = h
    }
    d.cursorImage = a.image_map[d.path + "/cursor.png"];
    d.duck = a.image_map[d.path + "/yellow-duck.png"];
    d.onload.fire()
  }, function(a) {
    console && console.log("Loading images... ", a)
  });
  return this
};
JSPDP.TableauUI = function() {
};
proto = JSPDP.TableauUI.prototype = {};
proto.init = function(a) {
  this.tableau = a.tableau;
  this.theme = a.theme;
  this.element = a.element;
  this.panelDimensions = a.panelDimensions;
  return this
};
proto.createCanvas = function() {
  var a = document.createElement("canvas");
  a.width = this.panelDimensions.width * this.tableau.dimensions.width;
  a.height = this.panelDimensions.height * this.tableau.dimensions.height;
  this.tableau instanceof JSPDP.RisingTableau && (a.height += this.panelDimensions.height);
  return a
};
proto.canvasPos = function(a, b) {
  return{x:this.panelDimensions.width * b, y:this.panelDimensions.height * this.tableau.dimensions.height - this.panelDimensions.height * (a + 1)}
};
proto.tableauPos = function(a, b) {
  return{row:this.tableau.dimensions.height - 1 - Math.floor(b / this.panelDimensions.height), col:Math.floor(a / this.panelDimensions.width)}
};
proto.riseOffset = function() {
  return this.tableau instanceof JSPDP.RisingTableau ? -(this.panelDimensions.height * this.tableau.riseOffset) : 0
};
proto.translate = function(a, b) {
  var c = 0, d = 0, f = this.element;
  do {
    c += f.offsetLeft, d += f.offsetTop
  }while(f = f.offsetParent);
  return{x:a - c, y:b - d}
};
proto.refresh = function() {
};
proto.update = function() {
  return!1
};
proto.draw = function() {
};
JSPDP.RenderManager = function() {
};
proto = JSPDP.RenderManager.prototype = new JSPDP.TableauUI;
proto.init = function(a, b) {
  JSPDP.TableauUI.prototype.init.call(this, a);
  this.canvas = this.createCanvas();
  this.tableau instanceof JSPDP.RisingTableau && (this.canvas.height -= this.panelDimensions.height);
  this.ctx = this.canvas.getContext("2d");
  a.element = this.canvas;
  this.renderers = [];
  if(typeof b != "undefined") {
    for(var c = 0;c < b.length;c++) {
      this.renderers.push((new b[c]).init(a))
    }
  }
  this.lastTick = this.tableau.tickCount;
  return this
};
proto.get = function(a) {
  for(var b in this.renderers) {
    if(this.renderers[b] instanceof a) {
      return this.renderers[b]
    }
  }
};
proto.start = function() {
  this.running = !0;
  this.refresh();
  var a = function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(a) {
      window.setTimeout(a, 1E3 / 45)
    }
  }(), b = this, c = function() {
    b.draw();
    b.running && a(c)
  };
  a(c)
};
proto.stop = function() {
  this.running = !1
};
proto.refresh = function() {
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  for(var a = 0;a < this.renderers.length;a++) {
    var b = this.renderers[a];
    b.refresh();
    b.draw(this.ctx)
  }
};
proto.draw = function() {
  if(this.tableau.tickCount != this.lastTick) {
    this.lastTick = this.tableau.tickCount;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for(var a = 0;a < this.renderers.length;a++) {
      var b = this.renderers[a];
      b.update();
      b.draw(this.ctx)
    }
  }
};
JSPDP.Canvas2DTableauRenderer = function() {
};
proto = JSPDP.Canvas2DTableauRenderer.prototype = new JSPDP.TableauUI;
proto.init = function(a) {
  JSPDP.TableauUI.prototype.init.call(this, a);
  this.panelImages = [];
  for(a = 0;a < this.theme.panelImages.length;a++) {
    var b = document.createElement("canvas");
    b.width = this.panelDimensions.width;
    b.height = this.panelDimensions.height;
    b.getContext("2d").drawImage(this.theme.panelImages[a], 0, 0, this.theme.panelDimensions.width, this.theme.panelDimensions.height, 0, 0, this.panelDimensions.width, this.panelDimensions.height);
    console.log("ok");
    this.panelImages[a] = b
  }
  this.canvas = this.createCanvas();
  this.ctx = this.canvas.getContext("2d");
  this.ctx.fillStyle = "rgb(255,255,255)";
  this.tableau.onSetPanel.subscribe(this.handleSetPanel.bind(this));
  this.tableau.onSwap.subscribe(this.handleSwap.bind(this));
  this.tableau.onLand.subscribe(this.handleLand.bind(this));
  this.tableau.onCombo.subscribe(this.handleCombo.bind(this));
  this.tableau.onPop.subscribe(this.handlePop.bind(this));
  this.tableau instanceof JSPDP.RisingTableau && this.tableau.onRow.subscribe(this.handleRow.bind(this));
  this.animatingPanels = [];
  this.swappingPanels = [];
  this.needsGeneratorRender = !1;
  return this
};
proto.renderPanel = function(a) {
  var b = this.canvasPos(a.row, a.col);
  !a.isAir() && !a.isPopped() && !a.isSwapping() ? a.isMatching() && this.tableau.tickCount & 1 && a.timer > this.tableau.durations.match * 0.25 ? this.ctx.fillRect(b.x, b.y, this.panelDimensions.width, this.panelDimensions.height) : a.isPopping() ? (this.ctx.fillStyle = "rgb(64,64,64)", this.ctx.fillRect(b.x, b.y, this.panelDimensions.width, this.panelDimensions.height), this.ctx.fillStyle = "rgb(255,255,255)") : this.ctx.drawImage(this.panelImages[a.color], b.x, b.y) : this.ctx.clearRect(b.x, b.y, 
  this.panelDimensions.width, this.panelDimensions.height)
};
proto.renderSwappingPanel = function(a) {
  if(!a.isAir()) {
    var b = this.canvasPos(a.row, a.col), c = this.panelDimensions.width / 4;
    c *= 4 - a.timer;
    c = a.flags & JSPDP.Panel.EFlags.FromLeft ? -this.panelDimensions.width + c : this.panelDimensions.width - c;
    this.ctx.drawImage(this.panelImages[a.color], b.x + c, b.y)
  }
};
proto.renderAnimatingPanels = function() {
  if(this.animatingPanels.length) {
    for(var a = 0;a < this.animatingPanels.length;a++) {
      var b = this.animatingPanels[a];
      this.renderPanel(b);
      b.getFlags(b.renderFlags) || this.animatingPanels.splice(a--, 1)
    }
    return!0
  }
  return!1
};
proto.renderSwappingPanels = function() {
  if(this.swappingPanels.length) {
    for(var a = 0;a < this.swappingPanels.length;a++) {
      var b = this.swappingPanels[a];
      this.renderPanel(b);
      (b = this.tableau.getPanel(b.row, b.col + (b.getFlags(JSPDP.Panel.EFlags.FromLeft) ? -1 : 1))) && !b.isSwapping() && this.renderPanel(b)
    }
    for(a = this.swappingPanels.length - 1;a >= 0;a--) {
      b = this.swappingPanels[a], b.isSwapping() ? this.renderSwappingPanel(b) : (this.renderPanel(b), this.swappingPanels.splice(a, 1))
    }
    return!0
  }
  return!1
};
proto.renderGenerator = function() {
  for(var a = this.canvasPos(-1, 0), b = 0;b < this.tableau.dimensions.width;b++) {
    this.ctx.drawImage(this.panelImages[this.tableau.generator.current[b]], this.panelDimensions.width * b, a.y)
  }
  this.ctx.save();
  this.ctx.fillStyle = "rgb(0,0,0)";
  this.ctx.globalAlpha = 0.6;
  this.ctx.fillRect(0, a.y, this.panelDimensions.width * this.tableau.dimensions.width, this.panelDimensions.width);
  this.ctx.restore();
  this.needsGeneratorRender = !1
};
proto.handleSetPanel = function(a) {
  this.renderPanel(a)
};
proto.handleLand = function(a) {
  a.renderFlags = JSPDP.Panel.EFlags.Landing;
  this.animatingPanels.push(a)
};
proto.handleCombo = function(a) {
  for(var b = 0;b < a.length;b++) {
    var c = a[b];
    c.renderFlags = JSPDP.Panel.EFlags.Matching;
    this.animatingPanels.push(c)
  }
};
proto.handlePop = function(a) {
  this.renderPanel(a)
};
proto.handleSwap = function(a) {
  this.swappingPanels.push(a[0]);
  this.swappingPanels.push(a[1])
};
proto.handleRow = function() {
  this.needsGeneratorRender = !0
};
proto.refresh = function() {
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  var a = this;
  this.tableau.eachPanel(function(b) {
    a.renderPanel(b)
  });
  this.renderSwappingPanels();
  this.tableau instanceof JSPDP.RisingTableau && this.renderGenerator()
};
proto.update = function() {
  var a = this.renderAnimatingPanels();
  a |= this.renderSwappingPanels();
  this.needsGeneratorRender && (a = !0, this.renderGenerator());
  return a
};
proto.draw = function(a) {
  a.drawImage(this.canvas, 0, this.riseOffset())
};
JSPDP.Canvas2DFXRenderer = function() {
};
proto = JSPDP.Canvas2DFXRenderer.prototype = new JSPDP.TableauUI;
proto.init = function(a) {
  JSPDP.TableauUI.prototype.init.call(this, a);
  this.canvas = this.createCanvas();
  this.ctx = this.canvas.getContext("2d");
  this.tableau.onPop.subscribe(this.handlePop.bind(this));
  this.tableau.onCombo.subscribe(this.handleCombo.bind(this));
  this.particles = [];
  this.lastTick = -1;
  this.cards = [];
  return this
};
proto.handlePop = function(a) {
  a = this.canvasPos(a.row, a.col);
  a.x += this.panelDimensions.width / 2;
  a.y += this.panelDimensions.height / 2;
  for(var b = 0;b < 8;b++) {
    this.particles.push({b:this.tableau.tickCount, l:60, t:this.tableau.tickCount, x:a.x, y:a.y, xv:Math.random() * 5 - 2.5, yv:Math.random() * 10 - 5, xf:0, yf:0.1, d:0.99})
  }
};
proto.handleCombo = function(a) {
  var b = a[0].comboSize, c = a[0].chainIndex, d = 0;
  if(c > 1) {
    var f = "x" + c, c = document.createElement("canvas"), e = c.getContext("2d");
    c.height = this.panelDimensions.height;
    var g = Math.floor(this.panelDimensions.height * 0.8) + "px Arial";
    e.font = g;
    var h = e.measureText(f).width + this.panelDimensions.width * 0.6;
    d += h;
    c.width = h;
    e.font = g;
    e.textBaseline = "top";
    e.lineWidth = this.panelDimensions.width * 0.08;
    e.fillStyle = "green";
    e.strokeStyle = "white";
    e.fillRect(0, 0, c.width, c.height);
    e.strokeRect(0, 0, c.width, c.height);
    e.fillStyle = "white";
    e.fillText(f, this.panelDimensions.width * 0.3, this.panelDimensions.height * 0.08);
    f = this.canvasPos(a[0].row, a[0].col);
    c = {canvas:c, canvas_pos:f, born:this.tableau.tickCount};
    this.cards.push(c)
  }
  if(b > 3) {
    f = b, c = document.createElement("canvas"), e = c.getContext("2d"), c.height = this.panelDimensions.height, g = Math.floor(this.panelDimensions.height * 0.8) + "px Arial", e.font = g, h = e.measureText(f).width + this.panelDimensions.width * 0.6, c.width = h, e.font = g, e.textBaseline = "top", e.lineWidth = this.panelDimensions.width * 0.08, e.fillStyle = "red", e.strokeStyle = "white", e.fillRect(0, 0, c.width, c.height), e.strokeRect(0, 0, c.width, c.height), e.fillStyle = "white", e.fillText(f, 
    this.panelDimensions.width * 0.3, this.panelDimensions.height * 0.08), f = this.canvasPos(a[0].row, a[0].col), f.x += d, c = {canvas:c, canvas_pos:f, born:this.tableau.tickCount}, this.cards.push(c)
  }
};
proto.refresh = function() {
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  for(var a = 0;a < this.particles.length;a++) {
    for(var b = this.particles[a], c = b.t;c < this.tableau.tickCount;c++) {
      b.x += b.xv, b.y += b.yv, b.xv = b.xv * b.d + b.xf, b.yv = b.yv * b.d + b.yf
    }
    this.ctx.save();
    this.ctx.globalAlpha = 1 - (b.t - b.b) / b.l;
    this.ctx.drawImage(this.theme.duck, b.x, b.y);
    this.ctx.restore();
    b.t = this.tableau.tickCount;
    b.t - b.b > b.l && this.particles.splice(a--, 1)
  }
  this.ctx.save();
  this.ctx.globalAlpha = 0.5;
  for(a = 0;a < this.cards.length;a++) {
    b = this.cards[a], this.ctx.drawImage(b.canvas, b.canvas_pos.x, b.canvas_pos.y + (-1 - Math.sin((this.tableau.tickCount - b.born) / 60 * (Math.PI / 2)) * this.panelDimensions.height * 0.75)), this.tableau.tickCount > b.born + 60 && this.cards.splice(a--, 1)
  }
  this.ctx.restore()
};
proto.update = function() {
  return this.tableau.tickCount != this.lastTick ? (this.lastTick = this.tableau.tickCount, this.refresh(), !0) : !1
};
proto.draw = function(a) {
  a.drawImage(this.canvas, 0, this.riseOffset())
};
JSPDP.Cursor = function() {
};
JSPDP.Cursor.EAction = {Rest:0, Up:1, Down:2, Left:3, Right:4, Swap1:5, Swap2:6, Lift:7, LENGTH:8};
proto = JSPDP.Cursor.prototype = new JSPDP.TableauUI;
proto.init = function(a) {
  JSPDP.TableauUI.prototype.init.call(this, a);
  this.position = {row:0, col:0};
  this.lastAction = this.action = JSPDP.Cursor.EAction.Rest;
  this.lastActionRepeatCount = 0;
  this.onStartAction = new JSPDP.Event;
  this.onStopAction = new JSPDP.Event;
  this.tableau.onActionPhase.subscribe(this.handleActionPhase.bind(this));
  this.tableau.onRise && this.tableau.onRise.subscribe(this.handleRise.bind(this));
  this.tableau.onRow && this.tableau.onRow.subscribe(this.handleRow.bind(this));
  this.canvas = this.createCanvas();
  this.ctx = this.canvas.getContext("2d");
  return this
};
proto.moveTo = function(a, b) {
  if(!this.tableau.bounds(a, b)) {
    return!1
  }
  this.position.row = a;
  this.position.col = b;
  this.moved = !0;
  this.action = this.lastAction = this.lastActionRepeatCount = 0;
  return!0
};
proto.startAction = function(a) {
  this.action = a;
  this.onStartAction.fire(a)
};
proto.stopAction = function(a) {
  if(this.action == a) {
    this.action = 0
  }
  this.onStopAction.fire(a)
};
proto.handleActionPhase = function() {
  var a = this.action;
  if(this.lastAction == this.action) {
    if(++this.lastActionRepeatCount, a != JSPDP.Cursor.EAction.Lift && this.lastActionRepeatCount < 16) {
      a = 0
    }else {
      if(a == JSPDP.Cursor.EAction.Swap1 || a == JSPDP.Cursor.EAction.Swap2) {
        a = 0
      }
    }
  }else {
    this.lastAction = this.action, this.lastActionRepeatCount = 0
  }
  if(a) {
    var b = {row:this.position.row, col:this.position.col}, c = JSPDP.Cursor.EAction;
    switch(a) {
      case c.Up:
        this.position.row++;
        break;
      case c.Down:
        this.position.row--;
        break;
      case c.Left:
        this.position.col--;
        break;
      case c.Right:
        this.position.col++;
        break;
      case c.Swap1:
      ;
      case c.Swap2:
        this.tableau.swap(this.position.row, this.position.col, !0);
        break;
      case c.Lift:
        this.tableau instanceof JSPDP.RisingTableau && this.tableau.lift()
    }
    a = this.tableau.dimensions.height - 1 - Math.ceil(this.tableau.riseOffset);
    if(this.position.row < 0) {
      this.position.row = 0
    }else {
      if(this.position.row > a) {
        this.position.row = a
      }
    }
    if(this.position.col < 0) {
      this.position.col = 0
    }else {
      if(this.position.col >= this.tableau.dimensions.width - 1) {
        this.position.col = this.tableau.dimensions.width - 2
      }
    }
    if(this.position.row != b.row || this.position.col != b.col) {
      this.moved = !0
    }
  }
};
proto.handleRise = function() {
  var a = this.tableau.dimensions.height - 1 - Math.ceil(this.tableau.riseOffset);
  if(this.position.row > a) {
    this.position.row = a, this.moved = !0
  }
};
proto.handleRow = function() {
  this.position.row++;
  var a = this.tableau.dimensions.height - 1 - Math.ceil(this.tableau.riseOffset);
  if(this.position.row > a) {
    this.position.row = a
  }
  this.moved = !0
};
proto.moved = !1;
proto.refresh = function() {
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  var a = this.canvasPos(this.position.row, this.position.col);
  this.ctx.drawImage(this.theme.cursorImage, a.x, a.y)
};
proto.update = function() {
  return this.moved ? (this.refresh(), this.moved = !1, !0) : !1
};
proto.draw = function(a) {
  a.drawImage(this.canvas, 0, this.riseOffset())
};
JSPDP.KeyboardCursor = function() {
};
JSPDP.KeyboardCursor.Button = function(a, b) {
  this.key = a;
  this.action = b
};
proto = JSPDP.KeyboardCursor.prototype = new JSPDP.Cursor;
proto.init = function(a) {
  JSPDP.Cursor.prototype.init.call(this, a);
  this.buttons = [];
  var a = JSPDP.Cursor.EAction, b = JSPDP.KeyboardCursor.Button;
  this.buttons.push(new b(38, a.Up));
  this.buttons.push(new b(40, a.Down));
  this.buttons.push(new b(37, a.Left));
  this.buttons.push(new b(39, a.Right));
  this.buttons.push(new b(90, a.Swap1));
  this.buttons.push(new b(88, a.Swap2));
  this.buttons.push(new b(32, a.Lift));
  addEventListener("keydown", this.onKeydown.bind(this), !1);
  addEventListener("keyup", this.onKeyup.bind(this), !1);
  document.onmousedown = function() {
    return!1
  };
  return this
};
proto.onKeydown = function(a) {
  for(var b = 0;b < this.buttons.length;b++) {
    if(a.keyCode == this.buttons[b].key) {
      this.startAction(this.buttons[b].action);
      a.preventDefault();
      break
    }
  }
};
proto.onKeyup = function(a) {
  for(var b = 0;b < this.buttons.length;b++) {
    if(a.keyCode == this.buttons[b].key) {
      this.stopAction(this.buttons[b].action);
      a.preventDefault();
      break
    }
  }
};
JSPDP.TouchController = function() {
};
proto = JSPDP.TouchController.prototype = new JSPDP.TableauUI;
proto.selection = null;
proto.position = null;
proto.lastSwapTick = -9001;
proto.init = function(a) {
  JSPDP.TableauUI.prototype.init.call(this, a);
  this.onSelect = new JSPDP.Event;
  this.tableau.onActionPhase.subscribe(this.onActionPhase.bind(this));
  this.tableau instanceof JSPDP.RisingTableau && this.tableau.onRow.subscribe(this.handleRow.bind(this));
  addEventListener("mousedown", this.onMousedown.bind(this), !1);
  addEventListener("mouseup", this.onMouseup.bind(this), !1);
  addEventListener("mousemove", this.onMousemove.bind(this), !1);
  addEventListener("mousewheel", this.onMousewheel.bind(this), !1);
  addEventListener("DOMMouseScroll", this.onMousewheel.bind(this), !1);
  return this
};
proto.onMousedown = function(a) {
  a = this.translate(a.pageX, a.pageY);
  a.y -= this.riseOffset();
  var a = this.tableauPos(a.x, a.y), b = this.tableau.getPanel(a.row, a.col);
  b ? (this.selection = {panel:b, tableau_pos:a}, this.tableau_pos = a, this.onSelect.fire(this.selection)) : this.selection = null
};
proto.onMouseup = function() {
  this.selection = null
};
proto.onMousemove = function(a) {
  if(this.selection) {
    a = this.translate(a.pageX, a.pageY), a.y -= this.riseOffset(), this.tableau_pos = this.tableauPos(a.x, a.y)
  }
};
proto.onMousewheel = function(a) {
  if((a.wheelDelta ? a.wheelDelta * (window.opera ? -1 : 1) : a.detail * -1) !== 0 && this.tableau instanceof JSPDP.RisingTableau) {
    this.tableau.lift(), a.preventDefault()
  }
};
proto.onActionPhase = function() {
  if(this.selection) {
    var a = this.tableau.getPanel(this.selection.tableau_pos.row, this.selection.tableau_pos.col);
    if(a != this.selection.panel) {
      this.selection = null
    }else {
      if(!(this.lastSwapTick + 3 >= this.tableau.tickCount) && this.tableau_pos.col != this.selection.tableau_pos.col) {
        var b = this.tableau_pos.col > this.selection.tableau_pos.col, c = this.selection.tableau_pos.col + (b ? 1 : -1), d = this.tableau.getPanel(this.selection.tableau_pos.row, c);
        if(a && d && !a.isFalling() && !d.isFalling() && this.tableau.swap(this.selection.tableau_pos.row, this.selection.tableau_pos.col, b)) {
          this.lastSwapTick = this.tableau.tickCount, this.selection = {panel:a, tableau_pos:{col:c, row:this.selection.tableau_pos.row}}
        }
      }
    }
  }
};
proto.handleRow = function() {
  this.tableau_pos && this.tableau_pos.row++;
  this.selection && this.selection.tableau_pos.row++
};
JSPDP.DualController = function() {
};
proto = JSPDP.DualController.prototype = new JSPDP.TableauUI;
proto.init = function(a) {
  JSPDP.TableauUI.prototype.init.call(this, a);
  this.keyboardCursor = (new JSPDP.KeyboardCursor).init(a);
  this.touchController = (new JSPDP.TouchController).init(a);
  this.touchController.onSelect.subscribe(this.handleSelect.bind(this));
  this.tableau.onSwap.subscribe(this.handleSwap.bind(this));
  return this
};
proto.handleSelect = function(a) {
  var b = a.tableau_pos.row, a = a.tableau_pos.col;
  a > 0 && a > this.keyboardCursor.position.col && --a;
  this.tableau.bounds(b, a + 1) || --a;
  this.tableau.bounds(b, a) && this.keyboardCursor.moveTo(b, a)
};
proto.handleSwap = function(a) {
  var b = a[0].row, c = a[0].col;
  if(a[1].col < c) {
    c = a[1].col
  }
  this.keyboardCursor.moveTo(b, c)
};
proto.refresh = function() {
  this.keyboardCursor.refresh()
};
proto.update = function() {
  return this.keyboardCursor.update()
};
proto.draw = function(a) {
  this.keyboardCursor.draw(a)
};
JSPDP.ButtonMasher = function() {
};
proto = JSPDP.ButtonMasher.prototype = {};
proto.init = function(a, b) {
  this.tableau = a;
  this.cursor = b;
  return this
};
proto.runTick = function() {
  var a = -1;
  this.tableau.eachPanel(function(b) {
    if(!b.isAir() && b.row > a) {
      a = b.row
    }
  });
  !this.tableau.active && a < 10 ? this.cursor.startAction(JSPDP.Cursor.EAction.Lift) : this.cursor.startAction(Math.ceil(Math.random() * JSPDP.Cursor.EAction.LENGTH))
};

