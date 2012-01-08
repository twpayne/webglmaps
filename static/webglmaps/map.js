goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.debug');
goog.require('goog.debug.Logger');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');
goog.require('goog.functions');
goog.require('goog.object');
goog.require('goog.vec.Mat4');
goog.require('webglmaps.Program');
goog.require('webglmaps.Tile');
goog.require('webglmaps.TileCoord');
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
   * @type {goog.debug.Logger}
   */
  this.logger_ = goog.debug.Logger.getLogger('webglmaps.Map');

  /**
   * @private
   * @type {number}
   */
  this.tileSize_ = opt_tileSize || 256;

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
  if (goog.DEBUG) {
    gl.frontFace(gl.CCW);
    gl.cullFace(gl.BACK);
    gl.enable(gl.CULL_FACE);
  } else {
    gl.disable(gl.CULL_FACE);
  }

  /**
   * @private
   * @type {webglmaps.Program}
   */
  this.program_ = new webglmaps.Program(gl);
  this.program_.use();

  this.render_();

};
goog.inherits(webglmaps.Map, goog.events.EventTarget);


/**
 * @param {webglmaps.Layer} layer Layer.
 */
webglmaps.Map.prototype.addLayer = function(layer) {
  layer.setGL(this.gl_);
  this.layers_.push(layer);
  this.layerChangeListeners_[goog.getUid(layer)] = goog.events.listen(layer,
      goog.events.EventType.CHANGE, goog.bind(this.onLayerChange_, this));
  this.requestAnimationFrame_();
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
 * @private
 */
webglmaps.Map.prototype.onLayerChange_ = function() {
  this.requestAnimationFrame_();
};


/**
 * @private
 */
webglmaps.Map.prototype.render_ = function() {

  this.logger_.info('render_');

  var gl = this.gl_;
  var time = Date.now();

  gl.clear(gl.COLOR_BUFFER_BIT);

  var xScale, yScale, xOffset, yOffset;
  if (gl.drawingBufferWidth > gl.drawingBufferHeight) {
    xScale = 2 * gl.drawingBufferHeight / gl.drawingBufferWidth;
    yScale = 2;
    xOffset = -1 + (gl.drawingBufferWidth - gl.drawingBufferHeight) /
        gl.drawingBufferWidth;
    yOffset = -1;
  } else if (gl.drawingBufferWidth == gl.drawingBufferHeight) {
    xScale = 2;
    yScale = 2;
    xOffset = -1;
    yOffset = -1;
  } else {
    xScale = 2;
    yScale = 2 * gl.drawingBufferWidth / gl.drawingBufferHeight;
    xOffset = -1;
    yOffset = -1 + (gl.drawingBufferHeight - gl.drawingBufferWidth) /
        gl.drawingBufferHeight;
  }
  var mvpMatrix = goog.vec.Mat4.createFromValues(
      xScale, 0, 0, 0,
      0, yScale, 0, 0,
      0, 0, 1, 0,
      xOffset, yOffset, 0, 1
  );
  gl.uniformMatrix4fv(
      this.program_.uMVPMatrixLocation, false, mvpMatrix);

  var requestAnimationFrames = goog.array.map(
      this.layers_, function(layer) {
        return layer.render(time, this.program_);
      }, this);
  if (goog.array.some(requestAnimationFrames, goog.functions.identity)) {
    this.requestAnimationFrame_();
  }

};


/**
 * @private
 */
webglmaps.Map.prototype.requestAnimationFrame_ = function() {
  window.webkitRequestAnimationFrame(
      goog.bind(this.render_, this), this.gl_.canvas);
};
