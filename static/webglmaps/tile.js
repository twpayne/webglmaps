goog.require('goog.events');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');
goog.require('webglmaps.Program');
goog.require('webglmaps.TileCoord');
goog.require('webglmaps.TileUrl');

goog.provide('webglmaps.Tile');



/**
 * @constructor
 * @param {webglmaps.TileCoord} tileCoord Tile coord.
 * @param {string} src Source.
 * @extends {goog.events.EventTarget}
 */
webglmaps.Tile = function(tileCoord, src) {

  goog.base(this);

  /**
   * @private
   * @type {WebGLRenderingContext}
   */
  this.gl_ = null;

  /**
   * @private
   * @type {webglmaps.TileCoord}
   */
  this.tileCoord_ = tileCoord;

  /**
   * @private
   * @type {WebGLBuffer}
   */
  this.vertexAttribBuffer_ = null;

  /**
   * @private
   * @type {Image}
   */
  this.image_ = null;

  /**
   * @private
   * @type {WebGLTexture}
   */
  this.texture_ = null;

  /**
   * @private
   * @type {?number}
   */
  this.firstRenderTime_ = null;

  var image = new Image();
  image.crossOrigin = '';
  image.src = src;
  goog.events.listenOnce(
      image, goog.events.EventType.LOAD, this.handleImageLoad, false, this);

};
goog.inherits(webglmaps.Tile, goog.events.EventTarget);


/**
 * @protected
 */
webglmaps.Tile.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
  this.setGL(null);
};


/**
 * @param {number} time Time.
 * @param {webglmaps.Program} program Program.
 * @param {number} z Z.
 * @return {boolean} Dirty?
 */
webglmaps.Tile.prototype.render = function(time, program, z) {
  var gl = this.gl_;
  if (goog.isNull(gl)) {
    return false;
  }
  if (goog.isNull(this.texture_)) {
    if (goog.isNull(this.image_)) {
      return false;
    }
    this.texture_ = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture_);
    gl.texImage2D(
        gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image_);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  } else {
    gl.bindTexture(gl.TEXTURE_2D, this.texture_);
  }
  if (goog.isNull(this.vertexAttribBuffer_)) {
    this.vertexAttribBuffer_ = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexAttribBuffer_);
    var n = 1 << this.tileCoord_.z;
    var x = this.tileCoord_.x, y = n - this.tileCoord_.y - 1;
    var positions = [
      x / n, y / n, 0, 1,
      (x + 1) / n, y / n, 1, 1,
      x / n, (y + 1) / n, 0, 0,
      (x + 1) / n, (y + 1) / n, 1, 0
    ];
    gl.bufferData(
        gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  } else {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexAttribBuffer_);
  }
  var alpha, dirty;
  if (this.tileCoord_.z != z) {
    alpha = 1;
    dirty = false;
  } else if (goog.isNull(this.firstRenderTime_)) {
    this.firstRenderTime_ = time;
    alpha = 0;
    dirty = true;
  } else if (time - this.firstRenderTime_ < webglmaps.Tile.FADE_IN_PERIOD) {
    alpha = (time - this.firstRenderTime_) / webglmaps.Tile.FADE_IN_PERIOD;
    dirty = true;
  } else {
    alpha = 1;
    dirty = false;
  }
  gl.vertexAttribPointer(
      program.aPositionLocation, 2, gl.FLOAT, false, 16, 0);
  gl.vertexAttribPointer(
      program.aTexCoordLocation, 2, gl.FLOAT, false, 16, 8);
  gl.activeTexture(gl.TEXTURE0);
  gl.uniform1i(program.uTextureLocation, 0);
  gl.uniform1f(program.uAlphaLocation, alpha);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  return dirty;
};


/**
 * @param {goog.events.BrowserEvent} event Event.
 */
webglmaps.Tile.prototype.handleImageLoad = function(event) {
  this.image_ = /** @type {Image} */ event.currentTarget;
  this.dispatchEvent(new goog.events.Event(goog.events.EventType.CHANGE, this));
};


/**
 * @param {WebGLRenderingContext} gl WebGL rendering context.
 */
webglmaps.Tile.prototype.setGL = function(gl) {
  if (!goog.isNull(this.gl_)) {
    gl.deleteBuffer(this.vertexAttribBuffer_);
    this.vertexAttribBuffer_ = null;
    if (!goog.isNull(this.texture_)) {
      gl.deleteTexture(this.texture_);
      this.texture_ = null;
    }
  }
  this.gl_ = gl;
};


/**
 * @const
 * @type {number}
 */
webglmaps.Tile.FADE_IN_PERIOD = 1000;
