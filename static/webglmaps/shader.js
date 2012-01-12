goog.provide('webglmaps.Shader');

goog.require('goog.Disposable');
goog.require('goog.array');
goog.require('goog.asserts');
goog.require('webglmaps.Uniform');



/**
 * @constructor
 * @extends {goog.Disposable}
 * @param {string} source Source.
 * @param {Array.<webglmaps.Uniform>=} opt_uniforms Uniforms.
 */
webglmaps.Shader = function(source, opt_uniforms) {

  goog.base(this);

  /**
   * @private
   * @type {WebGLRenderingContext}
   */
  this.gl_ = null;

  /**
   * @private
   * @type {WebGLShader}
   */
  this.shader_ = null;

  /**
   * @private
   * @type {string}
   */
  this.source_ = source;

  /**
   * @private
   * @type {Array.<webglmaps.Uniform>}
   */
  this.uniforms_ = opt_uniforms || [];

};
goog.inherits(webglmaps.Shader, goog.Disposable);


/**
 */
webglmaps.Shader.prototype.compile = function() {
  var gl = this.gl_;
  goog.asserts.assert(!goog.isNull(this.gl_));
  this.shader_ = this.create();
  gl.shaderSource(this.shader_, this.source_);
  gl.compileShader(this.shader_);
  if (!gl.getShaderParameter(this.shader_, gl.COMPILE_STATUS)) {
    window.console.log(gl.getShaderInfoLog(this.shader_));
    goog.asserts.assert(
        gl.getShaderParameter(this.shader_, gl.COMPILE_STATUS));
  }
};


/**
 * @protected
 * @return {WebGLShader} Shader.
 */
webglmaps.Shader.prototype.create = goog.abstractMethod;


/**
 * @protected
 */
webglmaps.Shader.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
  this.setGL(null);
};


/**
 * @return {WebGLShader} Shader.
 */
webglmaps.Shader.prototype.get = function() {
  return this.shader_;
};


/**
 * @return {boolean} Is animated?
 */
webglmaps.Shader.prototype.isAnimated = function() {
  return false;
};


/**
 * @param {WebGLRenderingContext} gl GL.
 */
webglmaps.Shader.prototype.setGL = function(gl) {
  if (!goog.isNull(this.gl_)) {
    goog.array.forEach(this.uniforms_, function(uniform) {
      uniform.setGL(null);
    });
    if (!goog.isNull(this.shader_)) {
      this.gl_.deleteShader(this.shader_);
      this.shader_ = null;
    }
  }
  this.gl_ = gl;
  if (!goog.isNull(gl)) {
    this.compile();
  }
};


/**
 * @param {WebGLProgram} program Program.
 */
webglmaps.Shader.prototype.setProgram = function(program) {
  goog.array.forEach(this.uniforms_, function(uniform) {
    uniform.setProgram(program);
  });
};


/**
 * @return {string} String.
 */
webglmaps.Shader.prototype.toString = function() {
  return goog.getUid(this).toString();
};
