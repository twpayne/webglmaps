goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.debug');
goog.require('goog.debug.Logger');
goog.require('goog.dom');
goog.require('goog.functions');
goog.require('goog.object');
goog.require('webglmaps.Program');
goog.require('webglmaps.Tile');
goog.require('webglmaps.TileCoord');
goog.require('webglmaps.TileUrl');
goog.require('webglmaps.utils');

goog.provide('webglmaps.Map');



/**
 * @constructor
 * @param {HTMLCanvasElement} canvas Canvas.
 * @param {webglmaps.TileUrl} tileUrl Tile URL.
 * @param {number=} opt_tileSize Tile size.
 * @param {Array.<number>=} opt_bgColor Background color.
 */
webglmaps.Map = function(canvas, tileUrl, opt_tileSize, opt_bgColor) {

  /**
   * @private
   * @type {goog.debug.Logger}
   */
  this.logger_ = goog.debug.Logger.getLogger('webglmaps.Map');

  /**
   * @private
   * @type {webglmaps.TileUrl}
   */
  this.tileUrl_ = tileUrl;

  /**
   * @private
   * @type {number}
   */
  this.tileSize_ = opt_tileSize || 1;

  /**
   * @type {Object.<number, ?number>}
   * @private
   */
  this.tileLoadListeners_ = {};

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

  /**
   * @private
   * @type {Array.<webglmaps.Tile>}
   */
  this.tiles_ = [];
  var z = 2, n = 1 << z;
  var tile, tileCoord, x, y;
  for (x = 0; x < n; ++x) {
    for (y = 0; y < n; ++y) {
      tileCoord = new webglmaps.TileCoord(z, x, y);
      tile = this.requestTile_(tileCoord, this.tileUrl_);
      this.tiles_.push(tile);
    }
  }

  this.render_();

};


/**
 * @param {webglmaps.Tile} tile Tile.
 * @private
 */
webglmaps.Map.prototype.onTileLoad_ = function(tile) {
  var uid = goog.getUid(tile);
  if (goog.object.containsKey(this.tileLoadListeners_, uid)) {
    goog.events.unlistenByKey(this.tileLoadListeners_[uid]);
    goog.object.remove(this.tileLoadListeners_, uid);
  }
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
  var mvpMatrix = [
    xScale, 0, 0, 0,
    0, yScale, 0, 0,
    0, 0, 1, 0,
    xOffset, yOffset, 0, 1
  ];
  gl.uniformMatrix4fv(
      this.program_.uMVPMatrixLocation, false, new Float32Array(mvpMatrix));

  var requestAnimationFrames = goog.array.map(
      this.tiles_, function(tile) {
        return tile.render(time, this.program_);
      }, this);
  if (goog.array.some(requestAnimationFrames, goog.functions.identity)) {
    this.logger_.info('tile requestAnimationFrame_');
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


/**
 * @param {webglmaps.TileCoord} tileCoord Tile coord.
 * @param {webglmaps.TileUrl} tileUrl Tile URL.
 * @private
 * @return {webglmaps.Tile} Tile.
 */
webglmaps.Map.prototype.requestTile_ = function(tileCoord, tileUrl) {
  var tile = new webglmaps.Tile(this.gl_, tileCoord, this.tileUrl_);
  this.tileLoadListeners_[goog.getUid(tile)] = goog.events.listen(
      tile, goog.events.EventType.LOAD, goog.bind(this.onTileLoad_, this));
  return tile;
};
