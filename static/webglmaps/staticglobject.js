goog.provide('webglmaps.StaticGLObject');

goog.require('goog.Disposable');



/**
 * @constructor
 * @extends {goog.Disposable}
 * @param {WebGLRenderingContext} gl GL.
 */
webglmaps.StaticGLObject = function(gl) {

  goog.asserts.assert(!goog.isNull(gl));

  /**
   * @protected
   * @type {WebGLRenderingContext}
   */
  this.gl = gl;

};
goog.inherits(webglmaps.StaticGLObject, goog.Disposable);


/**
 * @inheritDoc
 */
webglmaps.StaticGLObject.prototype.disposeInternal = function() {
  this.gl = null;
  goog.base(this, 'disposeInternal');
};


/**
 * @return {WebGLRenderingContext} GL.
 */
webglmaps.StaticGLObject.prototype.getGL = function() {
  goog.asserts.assert(!goog.isNull(this.gl));
  return this.gl;
};


/**
 * @return {WebGLRenderingContext} GL.
 */
webglmaps.StaticGLObject.prototype.unsafeGetGL = function() {
  return this.gl;
};
