goog.provide('webglmaps.GLObject');

goog.require('goog.Disposable');
goog.require('goog.asserts');



/**
 * @constructor
 * @extends {goog.Disposable}
 * @implements {webglmaps.IGLObject}
 */
webglmaps.GLObject = function() {

  /**
   * @protected
   * @type {WebGLRenderingContext}
   */
  this.gl = null;

};
goog.inherits(webglmaps.GLObject, goog.Disposable);


/**
 * @inheritDoc
 */
webglmaps.GLObject.prototype.disposeInternal = function() {
  this.setGL(null);
  goog.base(this, 'disposeInternal');
};


/**
 * @inheritDoc
 */
webglmaps.GLObject.prototype.getGL = function() {
  goog.asserts.assert(!goog.isNull(this.gl));
  return this.gl;
};


/**
 * @inheritDoc
 */
webglmaps.GLObject.prototype.setGL = function(gl) {
  this.gl = gl;
};


/**
 * @inheritDoc
 */
webglmaps.GLObject.prototype.unsafeGetGL = function() {
  return this.gl;
};
