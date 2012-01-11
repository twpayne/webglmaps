goog.provide('webglmaps.shader.Fragment');

goog.require('goog.asserts');
goog.require('webglmaps.Shader');



/**
 * @constructor
 * @extends {webglmaps.Shader}
 * @param {string} source Source.
 * @param {Array.<webglmaps.Uniform>=} opt_uniforms Uniforms.
 */
webglmaps.shader.Fragment = function(source, opt_uniforms) {
  goog.base(this, source, opt_uniforms);
};
goog.inherits(webglmaps.shader.Fragment, webglmaps.Shader);


/**
 * @protected
 * @return {WebGLShader} Shader.
 */
webglmaps.shader.Fragment.prototype.create = function() {
  var gl = this.gl_;
  goog.asserts.assert(!goog.isNull(gl));
  return gl.createShader(gl.FRAGMENT_SHADER);
};
