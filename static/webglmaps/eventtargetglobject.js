goog.provide('webglmaps.EventTargetGLObject');

goog.require('goog.events.EventTarget');
goog.require('webglmaps.IGLObject');



/**
 * @constructor
 * @extends {goog.events.EventTarget}
 * @implements {webglmaps.IGLObject}
 */
webglmaps.EventTargetGLObject = function() {

  goog.base(this);

  /**
   * @protected
   * @type {WebGLRenderingContext}
   */
  this.gl = null;

};
goog.inherits(webglmaps.EventTargetGLObject, goog.events.EventTarget);


/**
 * @inheritDoc
 */
webglmaps.EventTargetGLObject.prototype.disposeInternal = function() {
  this.setGL(null);
  goog.base(this, 'disposeInternal');
};


/**
 * @inheritDoc
 */
webglmaps.EventTargetGLObject.prototype.getGL = function() {
  goog.asserts.assert(!goog.isNull(this.gl));
  return this.gl;
};


/**
 * @inheritDoc
 */
webglmaps.EventTargetGLObject.prototype.setGL = function(gl) {
  this.gl = gl;
};


/**
 * @inheritDoc
 */
webglmaps.EventTargetGLObject.prototype.unsafeGetGL = function() {
  return this.gl;
};

