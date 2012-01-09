goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');
goog.require('goog.functions');
goog.require('goog.math');
goog.require('goog.object');
goog.require('goog.vec.Mat4');
goog.require('goog.vec.Vec3');
goog.require('webglmaps.Program');
goog.require('webglmaps.Tile');
goog.require('webglmaps.TileCoord');
goog.require('webglmaps.TileQueue');
goog.require('webglmaps.TileUrl');
goog.require('webglmaps.utils');

goog.provide('webglmaps.Map');



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
   * @type {goog.vec.Vec3.Type}
   */
  this.center_ = goog.vec.Vec3.createFromValues(0.5, 0.5, 0);

  /**
   * @private
   * @type {number}
   */
  this.zoom_ = 0;

  /**
   * @private
   * @type {number}
   */
  this.targetZoom_ = 0;

  /**
   * @private
   * @type {number}
   */
  this.zoomStartTime_ = 0;

  /**
   * @private
   * @type {number}
   */
  this.zoomPeriod_ = 0;

  /**
   * @private
   * @type {number}
   */
  this.rotation_ = 0;

  /**
   * @private
   * @type {webglmaps.TileQueue}
   */
  this.tileQueue_ = new webglmaps.TileQueue(this);

  /**
   * @private
   * @type {number}
   */
  this.tileSize_ = opt_tileSize || 256;

  /**
   * @private
   * @type {number}
   */
  this.frameIndex_ = 0;

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
   * @type {Array.<webglmaps.Layer>}
   */
  this.layers_ = [];

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
   * @type {webglmaps.Program}
   */
  this.program_ = new webglmaps.Program(gl);
  this.program_.use();

  this.updateMatrices_();
  this.setDirty_();

};
goog.inherits(webglmaps.Map, goog.events.EventTarget);


/**
 * @param {webglmaps.Layer} layer Layer.
 */
webglmaps.Map.prototype.addLayer = function(layer) {
  layer.setGL(this.gl_);
  layer.setTileQueue(this.tileQueue_);
  this.layers_.push(layer);
  this.layerChangeListeners_[goog.getUid(layer)] = goog.events.listen(layer,
      goog.events.EventType.CHANGE, this.handleLayerChange, false, this);
  this.setDirty_();
};


/**
 * @protected
 */
webglmaps.Map.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
  var gl = this.gl_;
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindTexture(gl.TEXTURE0, null);
  goog.disposeAll(this.layers_);
  this.layers_ = null;
  gl.useProgram(null);
  goog.dispose(this.program_);
  this.program_ = null;
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
 * @param {goog.vec.Vec3.Type=} opt_result Result.
 * @return {!goog.vec.Vec3.Type} Center.
 */
webglmaps.Map.prototype.getCenter = function(opt_result) {
  if (goog.isDefAndNotNull(opt_result)) {
    goog.vec.Vec3.setFromArray(opt_result, this.center_);
    return opt_result;
  } else {
    return goog.vec.Vec3.clone(this.center_);
  }
};


/**
 * @return {Element} Element.
 */
webglmaps.Map.prototype.getElement = function() {
  return this.gl_.canvas;
};


/**
 * @return {number} Rotation.
 */
webglmaps.Map.prototype.getRotation = function() {
  return this.rotation_;
};


/**
 * @return {number} Target zoom.
 */
webglmaps.Map.prototype.getTargetZoom = function() {
  return this.targetZoom_;
};


/**
 * @return {number} Rotation.
 */
webglmaps.Map.prototype.getZoom = function() {
  return this.zoom_;
};


/**
 */
webglmaps.Map.prototype.handleLayerChange = function() {
  this.setDirty_();
};


/**
 * @private
 */
webglmaps.Map.prototype.render_ = function() {

  var animate = false;

  ++this.frameIndex_;
  this.dirty_ = false;

  var gl = this.gl_;
  var time = Date.now();

  if (this.zoom_ != this.targetZoom_) {
    var delta = time - this.zoomStartTime_;
    if (delta < this.zoomPeriod_) {
      this.zoom_ = webglmaps.Map.ZOOM_TRANSITION(
          this.startZoom_, this.targetZoom_ - this.startZoom_,
          delta / this.zoomPeriod_);
      animate = true;
    } else {
      this.zoom_ = this.targetZoom_;
    }
    this.updateMatrices_();
  }

  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.uniformMatrix4fv(
      this.program_.uMVPMatrixLocation, false, this.positionToViewportMatrix_);

  var z = Math.ceil(this.zoom_ - 0.5), n = 1 << z;
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

  goog.array.forEach(this.layers_, function(layer) {
    animate = layer.render(
        this.frameIndex_, time, this.program_, z, x0, y0, x1, y1) || animate;
  }, this);

  if (animate) {
    this.requestAnimationFrame_();
  }

  this.tileQueue_.update();

};


/**
 * @private
 */
webglmaps.Map.prototype.requestAnimationFrame_ = function() {
  window.webkitRequestAnimationFrame(
      goog.bind(this.render_, this), this.gl_.canvas);
};


/**
 * @param {goog.vec.Vec3.Vec3Like} center Center.
 */
webglmaps.Map.prototype.setCenter = function(center) {
  if (!goog.vec.Vec3.equals(this.center_, center)) {
    goog.vec.Vec3.setFromArray(this.center_, center);
    this.tileQueue_.reprioritize();
    this.updateMatrices_();
    this.setDirty_();
  }
};


/**
 * @private
 */
webglmaps.Map.prototype.setDirty_ = function() {
  this.dirty_ = true;
  if (this.frozen_ <= 0) {
    this.render_();
  }
};


/**
 * @param {number} rotation Rotation.
 */
webglmaps.Map.prototype.setRotation = function(rotation) {
  if (this.rotation_ != rotation) {
    this.rotation_ = rotation;
    this.tileQueue_.reprioritize();
    this.updateMatrices_();
    this.setDirty_();
  }
};


/**
 * @param {number} zoom Zoom.
 * @param {number=} opt_period Period.
 */
webglmaps.Map.prototype.setZoom = function(zoom, opt_period) {
  zoom = Math.max(zoom, 0);
  if (this.zoom_ == zoom) {
    return;
  }
  var period = opt_period || 0;
  if (period === 0) {
    this.zoom_ = zoom;
    this.targetZoom_ = zoom;
    this.tileQueue_.reprioritize();
    this.updateMatrices_();
  } else {
    this.startZoom_ = this.zoom_;
    this.targetZoom_ = zoom;
    this.zoomSign_ = goog.math.sign(this.zoom_ - this.targetZoom_);
    this.zoomStartTime_ = Date.now();
    this.zoomPeriod_ = period;
  }
  this.setDirty_();
};


/**
 */
webglmaps.Map.prototype.thaw = function() {
  goog.asserts.assert(this.frozen_ > 0);
  if (--this.frozen_ <= 0) {
    this.render_();
    this.tileQueue_.reprioritize();
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
      this.tileSize_ * Math.pow(2, this.zoom_ + 1) / gl.drawingBufferWidth,
      this.tileSize_ * Math.pow(2, this.zoom_ + 1) / gl.drawingBufferHeight, 1);
  goog.vec.Mat4.rotate(m, this.rotation_, 0, 0, 1);
  goog.vec.Mat4.translate(m, -this.center_[0], -this.center_[1], 0);

  var inverted = goog.vec.Mat4.invert(m, this.viewportToPositionMatrix_);
  goog.asserts.assert(inverted);

  m = this.elementPixelToPositionMatrix_;
  goog.vec.Mat4.makeIdentity(m);
  goog.vec.Mat4.translate(m, -1, 1, 0);
  goog.vec.Mat4.scale(
      m, 2 / gl.drawingBufferWidth, -2 / gl.drawingBufferHeight, 1);
  goog.vec.Mat4.multMat(this.viewportToPositionMatrix_, m, m);

};


/**
 * @const
 * @type {webglmaps.transitions.TransitionFn}
 */
webglmaps.Map.ZOOM_TRANSITION = webglmaps.transitions.superPop;
