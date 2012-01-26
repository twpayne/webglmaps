goog.provide('webglmaps.ArrayBuffer');

goog.require('goog.webgl');
goog.require('webglmaps.StaticGLObject');



/**
 * @constructor
 * @extends {webglmaps.StaticGLObject}
 * @param {WebGLRenderingContext} gl GL.
 * @param {ArrayBuffer|ArrayBufferView|null|number} data Data.
 * @param {number} usage Usage.
 */
webglmaps.ArrayBuffer = function(gl, data, usage) {

  goog.base(this, gl);

  /**
   * @private
   * @type {WebGLBuffer}
   */
  this.buffer_ = gl.createBuffer();
  gl.bindBuffer(goog.webgl.ARRAY_BUFFER, this.buffer_);
  gl.bufferData(goog.webgl.ARRAY_BUFFER, data, usage);

};
goog.inherits(webglmaps.ArrayBuffer, webglmaps.StaticGLObject);


/**
 */
webglmaps.ArrayBuffer.prototype.bind = function() {
  var gl = this.getGL();
  gl.bindBuffer(goog.webgl.ARRAY_BUFFER, this.buffer_);
};


/**
 * @inheritDoc
 */
webglmaps.ArrayBuffer.prototype.disposeInternal = function() {
  var gl = this.getGL();
  gl.deleteBuffer(this.buffer_);
  this.buffer_ = null;
  goog.base(this, 'disposeInternal');
};
