goog.provide('webglmaps.VertexAttrib');

goog.require('goog.asserts');



/**
 * @constructor
 * @param {string} name Name.
 */
webglmaps.VertexAttrib = function(name) {

  /**
   * @private
   * @type {WebGLRenderingContext}
   */
  this.gl_ = null;

  /**
   * @private
   * @type {string}
   */
  this.name_ = name;

  /**
   * @private
   * @type {number}
   */
  this.location_ = -1;

};


/**
 */
webglmaps.VertexAttrib.prototype.enableArray = function() {
  var gl = this.gl_;
  goog.asserts.assert(!goog.isNull(gl));
  // FIXME disable assert while there are multiple simultaneous shaders
  //goog.asserts.assert(this.location_ != -1);
  gl.enableVertexAttribArray(this.location_);
};


/**
 * @param {number} size Size.
 * @param {number} type Type.
 * @param {boolean} normalize Normalized.
 * @param {number} stride Stride.
 * @param {number} offset Offset.
 */
webglmaps.VertexAttrib.prototype.pointer =
    function(size, type, normalize, stride, offset) {
  var gl = this.gl_;
  goog.asserts.assert(!goog.isNull(gl));
  goog.asserts.assert(this.location_ != -1);
  gl.vertexAttribPointer(
      this.location_, size, type, normalize, stride, offset);
};


/**
 * @param {WebGLRenderingContext} gl GL.
 */
webglmaps.VertexAttrib.prototype.setGL = function(gl) {
  this.gl_ = gl;
  if (goog.isNull(gl)) {
    this.location_ = -1;
  }
};


/**
 * @param {WebGLProgram} program Program.
 */
webglmaps.VertexAttrib.prototype.setProgram = function(program) {
  if (goog.isNull(program)) {
    this.location_ = -1;
  } else {
    var gl = this.gl_;
    goog.asserts.assert(!goog.isNull(gl));
    this.location_ = gl.getAttribLocation(program, this.name_);
    goog.asserts.assert(!goog.isNull(this.location_));
  }
};
