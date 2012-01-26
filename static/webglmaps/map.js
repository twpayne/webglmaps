goog.provide('webglmaps.Map');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.dom.ViewportSizeMonitor');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.functions');
goog.require('goog.math');
goog.require('goog.object');
goog.require('goog.vec.Mat4');
goog.require('goog.vec.Vec3');
goog.require('goog.webgl');
goog.require('webglmaps.Camera');
goog.require('webglmaps.EventTargetGLObject');
goog.require('webglmaps.LayerHelper');
goog.require('webglmaps.Program');
goog.require('webglmaps.ProgramCache');
goog.require('webglmaps.TileBounds');
goog.require('webglmaps.TileCoord');
goog.require('webglmaps.TileLayer');
goog.require('webglmaps.TileLayerHelper');
goog.require('webglmaps.TileQueue');
goog.require('webglmaps.shader.Fragment');
goog.require('webglmaps.shader.Vertex');
goog.require('webglmaps.shader.fragment.Default');
goog.require('webglmaps.shader.vertex.Default');
goog.require('webglmaps.utils');



/**
 * @constructor
 */
webglmaps.MapOptions = function() {
};


/**
 * @type {webglmaps.Camera}
 */
webglmaps.MapOptions.prototype.camera;


/**
 * @type {Array.<number>|undefined}
 */
webglmaps.MapOptions.prototype.clearColor;


/**
 * @type {number|undefined}
 */
webglmaps.MapOptions.prototype.tileSize;



/**
 * @constructor
 * @extends {webglmaps.EventTargetGLObject}
 * @param {HTMLCanvasElement} canvas Canvas.
 * @param {Object|webglmaps.MapOptions=} opt_options Options.
 */
webglmaps.Map = function(canvas, opt_options) {

  goog.base(this);

  var options = /** @type {webglmaps.MapOptions} */ (opt_options || {});

  /**
   * @private
   * @type {webglmaps.Camera}
   */
  this.camera_ = options.camera || new webglmaps.Camera();

  /**
   * @private
   * @type {Array.<number>}
   */
  this.clearColor_ = options.clearColor || [1, 1, 1];

  /**
   * @private
   * @type {number}
   */
  this.tileSize_ = options.tileSize || 256;

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
   * @type {goog.vec.Mat4.Float32}
   */
  this.positionToViewportMatrix_ = goog.vec.Mat4.createFloat32();

  /**
   * @private
   * @type {goog.vec.Mat4.Float32}
   */
  this.viewportToPositionMatrix_ = goog.vec.Mat4.createFloat32();

  /**
   * @private
   * @type {goog.vec.Mat4.Float32}
   */
  this.elementPixelToPositionMatrix_ = goog.vec.Mat4.createFloat32();

  /**
   * @private
   * @type {webglmaps.LayerHelper}
   */
  this.layerHelper_ = new webglmaps.LayerHelper();
  this.layerHelper_.setPositionToViewportMatrix(
      this.positionToViewportMatrix_);

  /**
   * @private
   * @type {webglmaps.TileQueue}
   */
  this.tileQueue_ = new webglmaps.TileQueue();

  /**
   * @private
   * @type {webglmaps.TileLayerHelper}
   */
  this.tileLayerHelper_ = new webglmaps.TileLayerHelper(this.tileQueue_);

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

  var gl = /** @type {WebGLRenderingContext} */
      (canvas.getContext('experimental-webgl', {
        'alpha': false,
        'depth': false,
        'antialias': true,
        'stencil': false,
        'preserveDrawingBuffer': false
      }));
  goog.asserts.assert(!goog.isNull(gl));
  this.setGL(gl);

  var vsm = new goog.dom.ViewportSizeMonitor();
  goog.events.listen(
      vsm, goog.events.EventType.RESIZE, this.handleResize, false, this);
  this.setSize_(vsm.getSize());

};
goog.inherits(webglmaps.Map, webglmaps.EventTargetGLObject);


/**
 * @param {webglmaps.TileLayer} tileLayer Tile layer.
 */
webglmaps.Map.prototype.addTileLayer = function(tileLayer) {
  tileLayer.setGL(this.gl);
  this.tileLayers_.push(tileLayer);
  this.layerChangeListeners_[goog.getUid(tileLayer)] = goog.events.listen(
      tileLayer, goog.events.EventType.CHANGE, this.handleTileLayerChange,
      false, this);
  if (tileLayer.getVisible()) {
    this.redraw();
  }
};


/**
 * @param {goog.vec.Vec3.AnyType} pixel Pixel.
 * @param {goog.vec.Vec3.AnyType} position Positon.
 * @return {!goog.vec.Vec3.AnyType} Position.
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
  return this.getGL().canvas;
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
  // FIXME should only call redraw if layer is use in current view
  this.redraw();
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

  var gl = this.getGL();

  if (this.camera_.isDirty()) {
    this.updateMatrices_();
    this.tileQueue_.reprioritize();
    this.camera_.setDirty(false);
  }

  gl.clear(goog.webgl.COLOR_BUFFER_BIT);

  if (this.firstUsedTime_ === 0) {
    this.firstUsedTime_ = Date.now();
  } else {
    this.time_ = Date.now() - this.firstUsedTime_;
  }
  window.console.log('map.time_ = ' + this.time_);
  this.layerHelper_.setTime(this.time_);

  var z = this.camera_.getTileZoom(), n = 1 << z;
  var xs = new Array(4), ys = new Array(4);
  var i, position = goog.vec.Vec3.createFloat32();
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
  var tileBounds = new webglmaps.TileBounds(z, x0, y0, x1, y1);
  this.tileLayerHelper_.setTileBounds(tileBounds);

  goog.array.forEach(this.tileLayers_, function(tileLayer) {
    if (tileLayer.getVisible()) {
      animate = tileLayer.render(
          this.layerHelper_, this.tileLayerHelper_) || animate;
    }
  }, this);

  if (animate) {
    this.animating_ = true;
    window.myRequestAnimationFrame(
        goog.bind(this.render_, this), gl.canvas);
  }

  this.tileQueue_.update(); // FIXME is this needed?

};


/**
 * @param {webglmaps.Camera} camera Camera.
 */
webglmaps.Map.prototype.setCamera = function(camera) {
  this.camera_ = camera;
  this.tileQueue_.setCamera(camera);
  this.redraw();
};


/**
 * @inheritDoc
 */
webglmaps.Map.prototype.setGL = function(gl) {
  if (!goog.isNull(this.gl)) {
    this.gl.bindBuffer(goog.webgl.ARRAY_BUFFER, null);
    this.gl.bindTexture(goog.webgl.TEXTURE0, null);
    this.gl.useProgram(null);
  }
  goog.base(this, 'setGL', gl);
  gl.clearColor(
      this.clearColor_[0], this.clearColor_[1], this.clearColor_[2], 1);
  gl.disable(goog.webgl.DEPTH_TEST);
  gl.disable(goog.webgl.SCISSOR_TEST);
  gl.disable(goog.webgl.CULL_FACE);
  this.layerHelper_.setGL(gl);
  this.tileLayerHelper_.setGL(gl);
  goog.array.forEach(this.tileLayers_, function(tileLayer) {
    tileLayer.setGL(gl);
  });
};


/**
 * @param {goog.math.Size} size Size.
 * @private
 */
webglmaps.Map.prototype.setSize_ = function(size) {
  if (!goog.isNull(this.gl)) {
    this.gl.canvas.width = size.width;
    this.gl.canvas.height = size.height;
    this.gl.viewport(0, 0, size.width, size.height);
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

  var gl = this.getGL();

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
