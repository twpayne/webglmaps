goog.provide('webglmaps.IGLObject');



/**
 * @interface
 */
webglmaps.IGLObject = function() {};


/**
 * @return {WebGLRenderingContext} GL.
 */
webglmaps.IGLObject.prototype.getGL;


/**
 * @param {WebGLRenderingContext} gl GL.
 */
webglmaps.IGLObject.prototype.setGL = function(gl) {};


/**
 * @return {WebGLRenderingContext} GL.
 */
webglmaps.IGLObject.prototype.unsafeGetGL;
