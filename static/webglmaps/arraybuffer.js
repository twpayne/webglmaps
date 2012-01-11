goog.provide('webglmaps.ArrayBuffer');

goog.require('goog.Disposable');



/**
 * @constructor
 * @extends {goog.Disposable}
 * @param {WebGLRenderingContext} gl GL.
 */
webglmaps.ArrayBuffer = function(gl) {

  goog.base(this);

  /**
   * @private
   * @type {WebGLRenderingContext}
   */
  this.gl_ = gl;

  /**
   * @private
   * @type {WebGLBuffer}
   */
  this.buffer_ = gl.createBuffer();

};
goog.inherits(webglmaps.ArrayBuffer, goog.Disposable);


/**
 */
webglmaps.ArrayBuffer.prototype.bind = function() {
  var gl = this.gl_;
  goog.asserts.assert(!goog.isNull(gl));
  gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer_);
};


/**
 * @param {Float32Array} data Data.
 * @param {number} usage Usage.
 */
webglmaps.ArrayBuffer.prototype.data = function(data, usage) {
  var gl = this.gl_;
  goog.asserts.assert(!goog.isNull(gl));
  gl.bufferData(gl.ARRAY_BUFFER, data, usage);
};


/**
 * @protected
 */
webglmaps.ArrayBuffer.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
  this.gl_.deleteBuffer(this.buffer_);
  this.buffer_ = null;
  this.gl_ = null;
};
