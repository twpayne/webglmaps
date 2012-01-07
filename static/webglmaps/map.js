goog.require('goog.asserts');
goog.require('goog.debug');
goog.require('goog.debug.Logger');
goog.require('goog.dom');

goog.provide('webglmaps.Map');



/**
 * @constructor
 * @param {Element} element Element.
 * @param {Object=} opt_opts Options.
 */
webglmaps.Map = function(element, opt_opts) {

  /**
   * @private
   */
  this.logger_ = goog.debug.Logger.getLogger('webglmaps.Map');

  /**
   * @private
   * @type {Element}
   */
  this.element_ = element;

  var canvas = goog.dom.createElement('canvas');
  this.element_.appendChild(canvas);

  var gl = canvas.getContext('experimental-webgl', {
    'antialias': true,
    'stencil': false,
    'preserveDrawingBuffer': false
  });
  goog.asserts.assert(!goog.isNull(gl));

  this.logger_.info('gl.RENDERER = ' + gl.getParameter(gl.RENDERER));
  this.logger_.info('gl.SHADING_LANGUAGE_VERSION = ' +
      gl.getParameter(gl.SHADING_LANGUAGE_VERSION));
  this.logger_.info('gl.VENDOR = ' + gl.getParameter(gl.VENDOR));
  this.logger_.info('gl.VERSION = ' + gl.getParameter(gl.VERSION));

  /**
   * @private
   * @type {WebGLRenderingContext}
   */
  this.gl_ = gl;

};


/**
 * @return {WebGLRenderingContext} WebGL rendering context.
 */
webglmaps.Map.prototype.getGL = function() {
  return this.gl_;
};
