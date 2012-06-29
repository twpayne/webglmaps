goog.provide('webglmaps.shader.Vertex');

goog.require('goog.asserts');
goog.require('webglmaps.Shader');



/**
 * @constructor
 * @extends {webglmaps.Shader}
 * @param {string} source Source.
 * @param {Array.<webglmaps.Uniform>=} opt_uniforms Uniforms.
 */
webglmaps.shader.Vertex = function(source, opt_uniforms) {
  goog.base(this, source, opt_uniforms);
};
goog.inherits(webglmaps.shader.Vertex, webglmaps.Shader);


/**
 * @protected
 * @return {WebGLShader} Shader.
 */
webglmaps.shader.Vertex.prototype.create = function() {
  var gl = this.gl_;
  goog.asserts.assert(!goog.isNull(gl));
  return gl.createShader(goog.webgl.VERTEX_SHADER);
};
