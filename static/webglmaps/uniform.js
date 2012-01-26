goog.provide('webglmaps.Uniform');

goog.require('goog.asserts');
goog.require('goog.vec.Mat4');
goog.require('webglmaps.GLObject');



/**
 * @constructor
 * @extends {webglmaps.GLObject}
 * @param {string} name Name.
 */
webglmaps.Uniform = function(name) {

  goog.base(this);

  /**
   * @private
   * @type {WebGLProgram}
   */
  this.program_ = null;

  /**
   * @private
   * @type {string}
   */
  this.name_ = name;

  /**
   * @private
   * @type {WebGLUniformLocation}
   */
  this.location_ = null;

};
goog.inherits(webglmaps.Uniform, webglmaps.GLObject);


/**
 * @return {string} Name.
 */
webglmaps.Uniform.prototype.getName = function() {
  return this.name_;
};


/**
 * @param {WebGLRenderingContext} gl GL.
 */
webglmaps.Uniform.prototype.setGL = function(gl) {
  this.location_ = null;
  goog.base(this, 'setGL', gl);
};


/**
 * @param {number} value Value.
 */
webglmaps.Uniform.prototype.set1f = function(value) {
  var gl = this.getGL();
  if (!goog.isNull(this.location_)) {
    gl.uniform1f(this.location_, value);
  }
};


/**
 * @param {number} value Value.
 */
webglmaps.Uniform.prototype.set1i = function(value) {
  var gl = this.getGL();
  if (!goog.isNull(this.location_)) {
    gl.uniform1i(this.location_, value);
  }
};


/**
 * @param {boolean} transpose Transpose.
 * @param {goog.vec.Mat4.Mat4Like} value Value.
 */
webglmaps.Uniform.prototype.setMatrix4fv = function(transpose, value) {
  var gl = this.getGL();
  if (!goog.isNull(this.location_)) {
    gl.uniformMatrix4fv(this.location_, transpose, value);
  }
};


/**
 * @param {WebGLProgram} program Program.
 */
webglmaps.Uniform.prototype.setProgram = function(program) {
  if (goog.isNull(program)) {
    this.location_ = null;
  } else {
    var gl = this.getGL();
    this.location_ = gl.getUniformLocation(program, this.name_);
  }
};
