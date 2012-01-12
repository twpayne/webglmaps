goog.provide('webglmaps.Map');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.dom.ViewportSizeMonitor');
goog.require('goog.events');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');
goog.require('goog.functions');
goog.require('goog.math');
goog.require('goog.object');
goog.require('goog.vec.Mat4');
goog.require('goog.vec.Vec3');
goog.require('webglmaps.Camera');
goog.require('webglmaps.Program');
goog.require('webglmaps.ProgramCache');
goog.require('webglmaps.TileCoord');
goog.require('webglmaps.TileLayer');
goog.require('webglmaps.TileUrl');
goog.require('webglmaps.TileVertices');
goog.require('webglmaps.shader.Fragment');
goog.require('webglmaps.shader.Vertex');
goog.require('webglmaps.shader.fragment.Default');
goog.require('webglmaps.shader.vertex.Default');
goog.require('webglmaps.tilequeue.Priority');
goog.require('webglmaps.transitions');
goog.require('webglmaps.utils');


/**
 * @const
 * @type {number}
 */
webglmaps.TILE_FADE_IN_PERIOD = 100;


/**
 * @const
 * @type {webglmaps.transitions.TransitionFn}
 */
webglmaps.TILE_FADE_IN_TRANSITION = webglmaps.transitions.splat;



/**
 * @constructor
 * @extends {goog.events.EventTarget}
 * @param {HTMLCanvasElement} canvas Canvas.
 * @param {number=} opt_tileSize Tile size.
 * @param {Array.<number>=} opt_bgColor Background color.
 */
webglmaps.Map = function(canvas, opt_tileSize, opt_bgColor) {

  /**
   * @private
   * @type {webglmaps.Camera}
   */
  this.camera_ = new webglmaps.Camera();

  /**
   * @private
   * @type {boolean}
   */
  this.animating_ = false;

  /**
   * @private
   * @type {boolean}
   */
  this.dirty_ = false;

  /**
   * @private
   * @type {number}
   */
  this.frozen_ = 0;

  /**
   * @private
   * @type {webglmaps.TileQueue}
   */
  this.tileQueue_ = new webglmaps.tilequeue.Priority(this.camera_);

  /**
   * @private
   * @type {number}
   */
  this.tileSize_ = opt_tileSize || 256;

  /**
   * @private
   * @type {number}
   */
  this.time_ = 0;

  /**
   * @private
   * @type {number}
   */
  this.firstUsedTime_ = 0;

  /**
   * @private
   * @type {goog.vec.Mat4.Type}
   */
  this.positionToViewportMatrix_ = goog.vec.Mat4.create();

  /**
   * @private
   * @type {goog.vec.Mat4.Type}
   */
  this.viewportToPositionMatrix_ = goog.vec.Mat4.create();

  /**
   * @private
   * @type {goog.vec.Mat4.Type}
   */
  this.elementPixelToPositionMatrix_ = goog.vec.Mat4.create();

  /**
   * @private
   * @type {Array.<webglmaps.TileLayer>}
   */
  this.tileLayers_ = [];

  /**
   * @private
   * @type {Object.<number, ?number>}
   */
  this.layerChangeListeners_ = {};

  /**
   * @private
   * @type {WebGLRenderingContext}
   */
  this.gl_ = /** @type {WebGLRenderingContext} */
      (canvas.getContext('experimental-webgl', {
        'alpha': false,
        'depth': false,
        'antialias': true,
        'stencil': false,
        'preserveDrawingBuffer': false
      }));
  goog.asserts.assert(!goog.isNull(this.gl_));

  var gl = this.gl_;

  var clearColor = opt_bgColor || [0, 0, 0];
  gl.clearColor(clearColor[0], clearColor[1], clearColor[2], 1);
  gl.disable(gl.DEPTH_TEST);
  gl.disable(gl.SCISSOR_TEST);
  gl.disable(gl.CULL_FACE);

  /**
   * @private
   * @type {webglmaps.shader.Fragment}
   */
  this.defaultFragmentShader_ = new webglmaps.shader.fragment.Default();

  /**
   * @private
   * @type {webglmaps.shader.Vertex}
   */
  this.defaultVertexShader_ = new webglmaps.shader.vertex.Default();

  /**
   * @private
   * @type {webglmaps.ProgramCache}
   */
  this.programCache_ = new webglmaps.ProgramCache();

  /**
   * @private
   * @type {webglmaps.Program}
   */
  this.program_ = null;

  /**
   * @private
   * @type {Object.<webglmaps.TileCoord, webglmaps.TileVertices>}
   */
  this.tileVertices_ = {};

  var vsm = new goog.dom.ViewportSizeMonitor();
  goog.events.listen(
      vsm, goog.events.EventType.RESIZE, this.handleResize, false, this);
  this.setSize_(vsm.getSize());

};
goog.inherits(webglmaps.Map, goog.events.EventTarget);


/**
 * @param {webglmaps.TileLayer} tileLayer Tile layer.
 */
webglmaps.Map.prototype.addTileLayer = function(tileLayer) {
  tileLayer.setGL(this.gl_);
  this.tileLayers_.push(tileLayer);
  this.layerChangeListeners_[goog.getUid(tileLayer)] = goog.events.listen(
      tileLayer, goog.events.EventType.CHANGE, this.handleTileLayerChange,
      false, this);
  this.redraw();
};


/**
 * @protected
 */
webglmaps.Map.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
  var gl = this.gl_;
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindTexture(gl.TEXTURE0, null);
  goog.disposeAll(this.tileLayers_);
  this.tileLayers_ = [];
  gl.useProgram(null);
  this.program_ = null;
  goog.dispose(this.programCache_);
  this.programCache_ = null;
  this.gl_ = null;
};


/**
 * @param {goog.vec.Vec3.Vec3Like} pixel Pixel.
 * @param {goog.vec.Vec3.Vec3Like} position Positon.
 * @return {!goog.vec.Vec3.Vec3Like} Position.
 */
webglmaps.Map.prototype.fromElementPixelToPosition = function(pixel, position) {
  return goog.vec.Mat4.multVec3(
      this.elementPixelToPositionMatrix_, pixel, position);
};


/**
 */
webglmaps.Map.prototype.freeze = function() {
  ++this.frozen_;
};


/**
 * @return {webglmaps.Camera} camera Camera.
 */
webglmaps.Map.prototype.getCamera = function() {
  return this.camera_;
};


/**
 * @return {Element} Element.
 */
webglmaps.Map.prototype.getElement = function() {
  return this.gl_.canvas;
};


/**
 * @param {webglmaps.TileCoord} tileCoord Tile coord.
 */
webglmaps.Map.prototype.bindTileVertices = function(tileCoord) {
  if (tileCoord in this.tileVertices_) {
    this.tileVertices_[tileCoord].bind();
  } else {
    this.tileVertices_[tileCoord] =
        new webglmaps.TileVertices(this.gl_, tileCoord);
  }
};


/**
 * @param {goog.events.BrowserEvent} event Event.
 */
webglmaps.Map.prototype.handleResize = function(event) {
  var vsm = /** @type {goog.dom.ViewportSizeMonitor} */ event.target;
  this.setSize_(vsm.getSize());
};


/**
 * @param {goog.events.Event} event Event.
 */
webglmaps.Map.prototype.handleTileLayerChange = function(event) {
  var tileLayer = /** @type {webglmaps.TileLayer} */ event.target;
  if (tileLayer.getLastUsedTime() == this.time_) {
    this.redraw();
  }
};


/**
 */
webglmaps.Map.prototype.redraw = function() {
  if (!this.animating_) {
    if (this.frozen_ <= 0) {
      this.render_();
    } else {
      this.dirty_ = true;
    }
  }
};


/**
 * @private
 */
webglmaps.Map.prototype.render_ = function() {

  var animate = false;

  this.animating_ = false;
  this.dirty_ = false;
  this.time_ = Date.now();
  if (this.firstUsedTime_ === 0) {
    this.firstUsedTime_ = this.time_;
  }

  var gl = this.gl_;

  if (this.camera_.isDirty()) {
    this.updateMatrices_();
    this.tileQueue_.reprioritize();
    this.camera_.setDirty(false);
  }

  gl.clear(gl.COLOR_BUFFER_BIT);

  var z = this.camera_.getTileZoom(), n = 1 << z;
  var xs = new Array(4), ys = new Array(4);
  var i, position = goog.vec.Vec3.create();
  for (i = 0; i < 4; ++i) {
    position[0] = 2 * (i >> 1) - 1;
    position[1] = 2 * (i & 1) - 1;
    goog.vec.Mat4.multVec3(this.viewportToPositionMatrix_, position, position);
    xs[i] = Math.floor(n * position[0]);
    ys[i] = n - Math.floor(n * position[1]) - 1;
  }
  var x0 = goog.math.clamp(Math.min.apply(null, xs), 0, n - 1);
  var y0 = goog.math.clamp(Math.min.apply(null, ys), 0, n - 1);
  var x1 = goog.math.clamp(Math.max.apply(null, xs), 0, n - 1);
  var y1 = goog.math.clamp(Math.max.apply(null, ys), 0, n - 1);

  goog.array.forEach(this.tileLayers_, function(tileLayer) {
    if (this.renderTileLayer_(tileLayer, z, x0, y0, x1, y1)) {
      animate = true;
    }
  }, this);

  if (animate) {
    this.animating_ = true;
    window.myRequestAnimationFrame(
        goog.bind(this.render_, this), this.gl_.canvas);
  }

};


/**
 * @param {webglmaps.TileLayer} tileLayer Tile layer.
 * @param {number} z Z.
 * @param {number} x0 X0.
 * @param {number} y0 Y0.
 * @param {number} x1 X1.
 * @param {number} y1 Y1.
 * @return {boolean} Animate?
 * @private
 */
webglmaps.Map.prototype.renderTileLayer_ =
    function(tileLayer, z, x0, y0, x1, y1) {
  var gl = this.gl_;
  var animate = false;
  var fragmentShader = tileLayer.getFragmentShader() ||
      this.defaultFragmentShader_;
  animate = animate || fragmentShader.isAnimated();
  var vertexShader = tileLayer.getVertexShader() ||
      this.defaultVertexShader_;
  animate = animate || vertexShader.isAnimated();
  var program = this.programCache_.get(fragmentShader, vertexShader);
  if (program !== this.program_) {
    if (program.getGL() !== gl) {
      program.setGL(gl);
    }
    program.use();
    this.program_ = program;
  }
  program.mvpMatrixUniform.setMatrix4fv(false, this.positionToViewportMatrix_);
  program.timeUniform.set1f(this.time_ - this.firstUsedTime_);
  if (animate) {
    goog.asserts.assert(!goog.isNull(program.timeUniform.location_));
  }
  if (tileLayer.getInterimTiles()) {
    animate = this.renderTileLayerWithInterimTiles_(
        tileLayer, z, x0, y0, x1, y1) || animate;
  } else {
    animate = this.renderTileLayerWithoutInterimTiles_(
        tileLayer, z, x0, y0, x1, y1) || animate;
  }
  return animate;
};


/**
 * @param {webglmaps.TileLayer} tileLayer Tile layer.
 * @param {number} z Z.
 * @param {number} x0 X0.
 * @param {number} y0 Y0.
 * @param {number} x1 X1.
 * @param {number} y1 Y1.
 * @return {boolean} Animate?
 * @private
 */
webglmaps.Map.prototype.renderTileLayerWithInterimTiles_ =
    function(tileLayer, z, x0, y0, x1, y1) {
  var gl = this.gl_;
  var animate = false;
  var program = this.program_, tileQueue = this.tileQueue_, time = this.time_;
  var tileCoord = new webglmaps.TileCoord(z, 0, 0);
  /** @type {Object.<number, Object.<webglmaps.TileCoord, webglmaps.Tile>>} */
  var tilesToRender = {};
  tilesToRender[z] = {};
  var alpha, tile, timeSinceFirstUsed, useInterimTile, x, y;
  tileLayer.setUsedTime(time);
  for (x = x0; x <= x1; ++x) {
    tileCoord.x = x;
    for (y = y0; y <= y1; ++y) {
      tileCoord.y = y;
      tile = tileLayer.getTile(tileCoord, tileQueue);
      useInterimTile = true;
      if (!goog.isNull(tile)) {
        tile.setUsedTime(time);
        if (tile.isLoaded()) {
          tilesToRender[z][tileCoord] = tile;
          if (time - tile.getFirstUsedTime() >= webglmaps.TILE_FADE_IN_PERIOD) {
            useInterimTile = false;
          }
        }
      }
      if (useInterimTile) {
        tile = tileLayer.findInterimTile(tileCoord);
        if (!goog.isNull(tile)) {
          if (!(tile.tileCoord.z in tilesToRender)) {
            tilesToRender[tile.tileCoord.z] = {};
          }
          tilesToRender[tile.tileCoord.z][tile.tileCoord] = tile;
        }
      }
    }
  }
  var tileZooms = goog.object.getKeys(tilesToRender);
  goog.array.sort(tileZooms, Number);
  goog.array.forEachRight(tileZooms, function(tileZoom) {
    goog.object.forEach(tilesToRender[tileZoom], function(tile) {
      var timeSinceFirstUsed = time - tile.getFirstUsedTime();
      var alpha;
      if (tile.tileCoord.z == z &&
          timeSinceFirstUsed < webglmaps.TILE_FADE_IN_PERIOD) {
        alpha = webglmaps.TILE_FADE_IN_TRANSITION(
            0, 1, timeSinceFirstUsed / webglmaps.TILE_FADE_IN_PERIOD);
        animate = true;
      } else {
        alpha = 1;
      }
      tile.texture.bind();
      this.bindTileVertices(tile.tileCoord);
      program.position.pointer(2, gl.FLOAT, false, 16, 0);
      program.texCoord.pointer(2, gl.FLOAT, false, 16, 8);
      gl.activeTexture(gl.TEXTURE0);
      program.textureUniform.set1i(0);
      program.alphaUniform.set1f(alpha);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }, this);
  }, this);
  return animate;
};


/**
 * @param {webglmaps.TileLayer} tileLayer Tile layer.
 * @param {number} z Z.
 * @param {number} x0 X0.
 * @param {number} y0 Y0.
 * @param {number} x1 X1.
 * @param {number} y1 Y1.
 * @return {boolean} Animate?
 * @private
 */
webglmaps.Map.prototype.renderTileLayerWithoutInterimTiles_ =
    function(tileLayer, z, x0, y0, x1, y1) {
  var gl = this.gl_;
  var animate = false;
  var program = this.program_, tileQueue = this.tileQueue_, time = this.time_;
  var tileCoord = new webglmaps.TileCoord(z, 0, 0);
  var alpha, tile, timeSinceFirstUsed, x, y;
  tileLayer.setUsedTime(time);
  for (x = x0; x <= x1; ++x) {
    tileCoord.x = x;
    for (y = y0; y <= y1; ++y) {
      tileCoord.y = y;
      tile = tileLayer.getTile(tileCoord, tileQueue);
      if (!goog.isNull(tile)) {
        tile.setUsedTime(time);
        if (tile.isLoaded()) {
          timeSinceFirstUsed = time - tile.getFirstUsedTime();
          if (timeSinceFirstUsed < webglmaps.TILE_FADE_IN_PERIOD) {
            alpha = webglmaps.TILE_FADE_IN_TRANSITION(
                0, 1, timeSinceFirstUsed / webglmaps.TILE_FADE_IN_PERIOD);
            animate = true;
          } else {
            alpha = 1;
          }
          tile.texture.bind();
          this.bindTileVertices(tileCoord);
          program.position.pointer(2, gl.FLOAT, false, 16, 0);
          program.texCoord.pointer(2, gl.FLOAT, false, 16, 8);
          gl.activeTexture(gl.TEXTURE0);
          program.textureUniform.set1i(0);
          program.alphaUniform.set1f(alpha);
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }
      }
    }
  }
  return animate;
};


/**
 * @param {webglmaps.Camera} camera Camera.
 */
webglmaps.Map.prototype.setCamera = function(camera) {
  this.camera_ = camera;
  this.redraw();
};


/**
 * @param {goog.math.Size} size Size.
 * @private
 */
webglmaps.Map.prototype.setSize_ = function(size) {
  if (!goog.isNull(this.gl_)) {
    this.gl_.canvas.width = size.width;
    this.gl_.canvas.height = size.height;
    this.gl_.viewport(0, 0, size.width, size.height);
    this.updateMatrices_();
    this.redraw();
  }
};


/**
 */
webglmaps.Map.prototype.thaw = function() {
  goog.asserts.assert(this.frozen_ > 0);
  if (--this.frozen_ <= 0) {
    if (this.dirty_ && !this.animating_) {
      this.render_();
    }
  }
};


/**
 * @private
 */
webglmaps.Map.prototype.updateMatrices_ = function() {

  var gl = this.gl_;

  var m = this.positionToViewportMatrix_;
  goog.vec.Mat4.makeIdentity(m);
  goog.vec.Mat4.scale(m,
      2 * this.tileSize_ / gl.drawingBufferWidth,
      2 * this.tileSize_ / gl.drawingBufferHeight, 1);
  goog.vec.Mat4.multMat(m, this.camera_.getMatrix(), m);

  var inverted = goog.vec.Mat4.invert(m, this.viewportToPositionMatrix_);
  goog.asserts.assert(inverted);

  m = this.elementPixelToPositionMatrix_;
  goog.vec.Mat4.makeIdentity(m);
  goog.vec.Mat4.translate(m, -1, 1, 0);
  goog.vec.Mat4.scale(
      m, 2 / gl.drawingBufferWidth, -2 / gl.drawingBufferHeight, 1);
  goog.vec.Mat4.multMat(this.viewportToPositionMatrix_, m, m);

};
