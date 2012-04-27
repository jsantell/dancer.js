/* Allows safe, dyamic creation of namespaces.
*/
var Attraction, Behaviour, Collision, ConstantForce, EdgeBounce, EdgeWrap, Particle, Physics, Random, Spring, Vector, Wander, namespace,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

namespace = function(id) {
  var path, root, _i, _len, _ref, _ref2, _results;
  root = self;
  _ref = id.split('.');
  _results = [];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    path = _ref[_i];
    _results.push(root = (_ref2 = root[path]) != null ? _ref2 : root[path] = {});
  }
  return _results;
};

/* RequestAnimationFrame shim.
*/

(function() {
  var time, vendor, vendors, _i, _len;
  time = 0;
  vendors = ['ms', 'moz', 'webkit', 'o'];
  for (_i = 0, _len = vendors.length; _i < _len; _i++) {
    vendor = vendors[_i];
    if (!(!window.requestAnimationFrame)) continue;
    window.requestAnimationFrame = window[vendor + 'RequestAnimationFrame'];
    window.cancelRequestAnimationFrame = window[vendor + 'CancelRequestAnimationFrame'];
  }
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback, element) {
      var delta, now, old;
      now = new Date().getTime();
      delta = Math.max(0, 16 - (now - old));
      setTimeout((function() {
        return callback(time + delta);
      }), delta);
      return old = now + delta;
    };
  }
  if (!window.cancelAnimationFrame) {
    return window.cancelAnimationFrame = function(id) {
      return clearTimeout(id);
    };
  }
})();

/* Random
*/

Random = function(min, max) {
  if (!(max != null)) {
    max = min;
    min = 0;
  }
  return min + Math.random() * (max - min);
};

Random.int = function(min, max) {
  if (!(max != null)) {
    max = min;
    min = 0;
  }
  return Math.floor(min + Math.random() * (max - min));
};

Random.sign = function(prob) {
  if (prob == null) prob = 0.5;
  if (Math.random() < prob) {
    return 1;
  } else {
    return -1;
  }
};

Random.bool = function(prob) {
  if (prob == null) prob = 0.5;
  return Math.random() < prob;
};

Random.item = function(list) {
  return list[Math.floor(Math.random() * list.length)];
};

/* 2D Vector
*/

Vector = (function() {
  /* Adds two vectors and returns the product.
  */
  Vector.add = function(v1, v2) {
    return new Vector(v1.x + v2.x, v1.y + v2.y);
  };

  /* Subtracts v2 from v1 and returns the product.
  */

  Vector.sub = function(v1, v2) {
    return new Vector(v1.x - v2.x, v1.y - v2.y);
  };

  /* Projects one vector (v1) onto another (v2)
  */

  Vector.project = function(v1, v2) {
    return v1.clone().scale((v1.dot(v2)) / v1.magSq());
  };

  /* Creates a new Vector instance.
  */

  function Vector(x, y) {
    this.x = x != null ? x : 0.0;
    this.y = y != null ? y : 0.0;
  }

  /* Sets the components of this vector.
  */

  Vector.prototype.set = function(x, y) {
    this.x = x;
    this.y = y;
    return this;
  };

  /* Add a vector to this one.
  */

  Vector.prototype.add = function(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
  };

  /* Subtracts a vector from this one.
  */

  Vector.prototype.sub = function(v) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  };

  /* Scales this vector by a value.
  */

  Vector.prototype.scale = function(f) {
    this.x *= f;
    this.y *= f;
    return this;
  };

  /* Computes the dot product between vectors.
  */

  Vector.prototype.dot = function(v) {
    return this.x * v.x + this.y * v.y;
  };

  /* Computes the cross product between vectors.
  */

  Vector.prototype.cross = function(v) {
    return (this.x * v.y) - (this.y * v.x);
  };

  /* Computes the magnitude (length).
  */

  Vector.prototype.mag = function() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  };

  /* Computes the squared magnitude (length).
  */

  Vector.prototype.magSq = function() {
    return this.x * this.x + this.y * this.y;
  };

  /* Computes the distance to another vector.
  */

  Vector.prototype.dist = function(v) {
    var dx, dy;
    dx = v.x - this.x;
    dy = v.y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  /* Computes the squared distance to another vector.
  */

  Vector.prototype.distSq = function(v) {
    var dx, dy;
    dx = v.x - this.x;
    dy = v.y - this.y;
    return dx * dx + dy * dy;
  };

  /* Normalises the vector, making it a unit vector (of length 1).
  */

  Vector.prototype.norm = function() {
    var m;
    m = Math.sqrt(this.x * this.x + this.y * this.y);
    this.x /= m;
    this.y /= m;
    return this;
  };

  /* Limits the vector length to a given amount.
  */

  Vector.prototype.limit = function(l) {
    var m, mSq;
    mSq = this.x * this.x + this.y * this.y;
    if (mSq > l * l) {
      m = Math.sqrt(mSq);
      this.x /= m;
      this.y /= m;
      this.x *= l;
      this.y *= l;
      return this;
    }
  };

  /* Copies components from another vector.
  */

  Vector.prototype.copy = function(v) {
    this.x = v.x;
    this.y = v.y;
    return this;
  };

  /* Clones this vector to a new itentical one.
  */

  Vector.prototype.clone = function() {
    return new Vector(this.x, this.y);
  };

  /* Resets the vector to zero.
  */

  Vector.prototype.clear = function() {
    this.x = 0.0;
    this.y = 0.0;
    return this;
  };

  return Vector;

})();

/* Particle
*/

Particle = (function() {

  function Particle(mass) {
    this.mass = mass != null ? mass : 1.0;
    this.setMass(this.mass);
    this.setRadius(1.0);
    this.fixed = false;
    this.behaviours = [];
    this.pos = new Vector();
    this.vel = new Vector();
    this.acc = new Vector();
    this.old = {
      pos: new Vector(),
      vel: new Vector(),
      acc: new Vector()
    };
  }

  /* Moves the particle to a given location vector.
  */

  Particle.prototype.moveTo = function(pos) {
    this.pos.copy(pos);
    return this.old.pos.copy(pos);
  };

  /* Sets the mass of the particle.
  */

  Particle.prototype.setMass = function(mass) {
    this.mass = mass != null ? mass : 1.0;
    return this.massInv = 1.0 / this.mass;
  };

  /* Sets the radius of the particle.
  */

  Particle.prototype.setRadius = function(radius) {
    this.radius = radius != null ? radius : 1.0;
    return this.radiusSq = this.radius * this.radius;
  };

  /* Applies all behaviours to derive new force.
  */

  Particle.prototype.update = function(dt, index) {
    var behaviour, _i, _len, _ref, _results;
    if (!this.fixed) {
      _ref = this.behaviours;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        behaviour = _ref[_i];
        _results.push(behaviour.apply(this, dt, index));
      }
      return _results;
    }
  };

  return Particle;

})();

/* Spring
*/

Spring = (function() {

  function Spring(p1, p2, restLength, stiffness) {
    this.p1 = p1;
    this.p2 = p2;
    this.restLength = restLength != null ? restLength : 100;
    this.stiffness = stiffness != null ? stiffness : 1.0;
    this._delta = new Vector();
  }

  Spring.prototype.apply = function() {
    var dist, force;
    (this._delta.copy(this.p2.pos)).sub(this.p1.pos);
    dist = this._delta.mag() + 0.000001;
    force = (dist - this.restLength) / (dist * (this.p1.massInv + this.p2.massInv)) * this.stiffness;
    if (!this.p1.fixed) {
      this.p1.pos.add(this._delta.clone().scale(force * this.p1.massInv));
    }
    if (!this.p2.fixed) {
      return this.p2.pos.add(this._delta.scale(-force * this.p2.massInv));
    }
  };

  return Spring;

})();

/* Physics Engine
*/

Physics = (function() {

  function Physics(integrator) {
    this.integrator = integrator != null ? integrator : new Euler();
    this.timestep = 1.0 / 60;
    this.viscosity = 0.005;
    this.behaviours = [];
    this._time = 0.0;
    this._step = 0.0;
    this._clock = null;
    this._buffer = 0.0;
    this._maxSteps = 4;
    this.particles = [];
    this.springs = [];
  }

  /* Performs a numerical integration step.
  */

  Physics.prototype.integrate = function(dt) {
    var behaviour, drag, index, particle, spring, _i, _j, _len, _len2, _len3, _ref, _ref2, _ref3, _results;
    drag = 1.0 - this.viscosity;
    _ref = this.particles;
    for (index = 0, _len = _ref.length; index < _len; index++) {
      particle = _ref[index];
      _ref2 = this.behaviours;
      for (_i = 0, _len2 = _ref2.length; _i < _len2; _i++) {
        behaviour = _ref2[_i];
        behaviour.apply(particle, dt, index);
      }
      particle.update(dt, index);
    }
    this.integrator.integrate(this.particles, dt, drag);
    _ref3 = this.springs;
    _results = [];
    for (_j = 0, _len3 = _ref3.length; _j < _len3; _j++) {
      spring = _ref3[_j];
      _results.push(spring.apply());
    }
    return _results;
  };

  /* Steps the system.
  */

  Physics.prototype.step = function() {
    var delta, i, time;
    if (this._clock == null) this._clock = new Date().getTime();
    time = new Date().getTime();
    delta = time - this._clock;
    if (delta <= 0.0) return;
    delta *= 0.001;
    this._clock = time;
    this._buffer += delta;
    i = 0;
    while (this._buffer >= this.timestep && ++i < this._maxSteps) {
      this.integrate(this.timestep);
      this._buffer -= this.timestep;
      this._time += this.timestep;
    }
    return this._step = new Date().getTime() - time;
  };

  /* Clean up after yourself.
  */

  Physics.prototype.destroy = function() {
    this.integrator = null;
    this.particles = null;
    return this.springs = null;
  };

  return Physics;

})();

/* Behaviour
*/

Behaviour = (function() {

  Behaviour.GUID = 0;

  function Behaviour() {
    this.GUID = Behaviour.GUID++;
    this.interval = 1;
  }

  Behaviour.prototype.apply = function(p, dt, index) {
    var _name, _ref;
    return ((_ref = p[_name = '__behaviour' + this.GUID]) != null ? _ref : p[_name] = {
      counter: 0
    }).counter++;
  };

  return Behaviour;

})();

/* Attraction Behaviour
*/

Attraction = (function(_super) {

  __extends(Attraction, _super);

  function Attraction(target, radius, strength) {
    this.target = target != null ? target : new Vector();
    this.radius = radius != null ? radius : 1000;
    this.strength = strength != null ? strength : 100.0;
    this._delta = new Vector();
    this.setRadius(this.radius);
    Attraction.__super__.constructor.apply(this, arguments);
  }

  /* Sets the effective radius of the bahavious.
  */

  Attraction.prototype.setRadius = function(radius) {
    this.radius = radius;
    return this.radiusSq = radius * radius;
  };

  Attraction.prototype.apply = function(p, dt, index) {
    var distSq;
    (this._delta.copy(this.target)).sub(p.pos);
    distSq = this._delta.magSq();
    if (distSq < this.radiusSq && distSq > 0.000001) {
      this._delta.norm().scale(1.0 - distSq / this.radiusSq);
      return p.acc.add(this._delta.scale(this.strength));
    }
  };

  return Attraction;

})(Behaviour);

/* Collision Behaviour
*/

Collision = (function(_super) {

  __extends(Collision, _super);

  function Collision(useMass, callback) {
    this.useMass = useMass != null ? useMass : true;
    this.callback = callback != null ? callback : null;
    this.pool = [];
    this._delta = new Vector();
    Collision.__super__.constructor.apply(this, arguments);
  }

  Collision.prototype.apply = function(p, dt, index) {
    var dist, distSq, i, mt, o, overlap, r1, r2, radii, _ref, _results;
    _results = [];
    for (i = index, _ref = this.pool.length - 1; index <= _ref ? i <= _ref : i >= _ref; index <= _ref ? i++ : i--) {
      o = this.pool[i];
      if (o !== p) {
        (this._delta.copy(o.pos)).sub(p.pos);
        distSq = this._delta.magSq();
        radii = p.radius + o.radius;
        if (distSq <= radii * radii) {
          dist = Math.sqrt(distSq);
          overlap = (p.radius + o.radius) - dist;
          overlap += 0.5;
          mt = p.mass + o.mass;
          r1 = this.useMass ? o.mass / mt : 0.5;
          r2 = this.useMass ? p.mass / mt : 0.5;
          p.pos.add(this._delta.clone().norm().scale(overlap * -r1));
          o.pos.add(this._delta.norm().scale(overlap * r2));
          _results.push(typeof this.callback === "function" ? this.callback(p, o, overlap) : void 0);
        } else {
          _results.push(void 0);
        }
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  return Collision;

})(Behaviour);

/* Constant Force Behaviour
*/

ConstantForce = (function(_super) {

  __extends(ConstantForce, _super);

  function ConstantForce(force) {
    this.force = force != null ? force : new Vector();
    ConstantForce.__super__.constructor.apply(this, arguments);
  }

  ConstantForce.prototype.apply = function(p, dt, index) {
    return p.acc.add(this.force);
  };

  return ConstantForce;

})(Behaviour);

/* Edge Bounce Behaviour
*/

EdgeBounce = (function(_super) {

  __extends(EdgeBounce, _super);

  function EdgeBounce(min, max) {
    this.min = min != null ? min : new Vector();
    this.max = max != null ? max : new Vector();
    EdgeBounce.__super__.constructor.apply(this, arguments);
  }

  EdgeBounce.prototype.apply = function(p, dt, index) {
    if (p.pos.x - p.radius < this.min.x) {
      p.pos.x = this.min.x + p.radius;
    } else if (p.pos.x + p.radius > this.max.x) {
      p.pos.x = this.max.x - p.radius;
    }
    if (p.pos.y - p.radius < this.min.y) {
      return p.pos.y = this.min.y + p.radius;
    } else if (p.pos.y + p.radius > this.max.y) {
      return p.pos.y = this.max.y - p.radius;
    }
  };

  return EdgeBounce;

})(Behaviour);

/* Edge Wrap Behaviour
*/

EdgeWrap = (function(_super) {

  __extends(EdgeWrap, _super);

  function EdgeWrap(min, max) {
    this.min = min != null ? min : new Vector();
    this.max = max != null ? max : new Vector();
    EdgeWrap.__super__.constructor.apply(this, arguments);
  }

  EdgeWrap.prototype.apply = function(p, dt, index) {
    if (p.pos.x + p.radius < this.min.x) {
      p.pos.x = this.max.x + p.radius;
      p.old.pos.x = p.pos.x;
    } else if (p.pos.x - p.radius > this.max.x) {
      p.pos.x = this.min.x - p.radius;
      p.old.pos.x = p.pos.x;
    }
    if (p.pos.y + p.radius < this.min.y) {
      p.pos.y = this.max.y + p.radius;
      return p.old.pos.y = p.pos.y;
    } else if (p.pos.y - p.radius > this.max.y) {
      p.pos.y = this.min.y - p.radius;
      return p.old.pos.y = p.pos.y;
    }
  };

  return EdgeWrap;

})(Behaviour);

/* Wander Behaviour
*/

Wander = (function(_super) {

  __extends(Wander, _super);

  function Wander(jitter, radius, strength) {
    this.jitter = jitter != null ? jitter : 0.5;
    this.radius = radius != null ? radius : 100;
    this.strength = strength != null ? strength : 1.0;
    this.theta = Math.random() * Math.PI * 2;
    Wander.__super__.constructor.apply(this, arguments);
  }

  Wander.prototype.apply = function(p, dt, index) {
    this.theta += (Math.random() - 0.5) * this.jitter * Math.PI * 2;
    p.acc.x += Math.cos(this.theta) * this.radius * this.strength;
    return p.acc.y += Math.sin(this.theta) * this.radius * this.strength;
  };

  return Wander;

})(Behaviour);
