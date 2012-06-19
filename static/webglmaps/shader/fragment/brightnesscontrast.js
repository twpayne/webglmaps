goog.provide('webglmaps.shader.fragment.BrightnessContrast');

goog.require('goog.math');
goog.require('webglmaps.Uniform');
goog.require('webglmaps.shader.Fragment');



/**
 * @constructor
 * @extends {webglmaps.shader.Fragment}
 * @param {number=} opt_brightness Brightness.
 * @param {number=} opt_contrast Contrast.
 * @see https://github.com/evanw/glfx.js
 */
webglmaps.shader.fragment.BrightnessContrast =
    function(opt_brightness, opt_contrast) {

  /**
   * @private
   * @type {webglmaps.Uniform}
   */
  this.brightnessUniform_ = new webglmaps.Uniform('uBrightness');

  /**
   * @private
   * @type {webglmaps.Uniform}
   */
  this.contrastUniform_ = new webglmaps.Uniform('uContrast');

  goog.base(this, [
    'precision mediump float;',
    '',
    'uniform float uAlpha;',
    'uniform float uBrightness;',
    'uniform float uContrast;',
    'uniform sampler2D uTexture;',
    'uniform float uTime;',
    '',
    'varying vec2 vTexCoord;',
    '',
    'void main() {',
    '  vec4 color = texture2D(uTexture, vTexCoord);',
    '',
    '  color.rgb += uBrightness;',
    '  if (uContrast > 0.0) {',
    '    color.rgb = (color.rgb - 0.5) / (1.0 - uContrast) + 0.5;',
    '  } else {',
    '    color.rgb = (color.rgb - 0.5) * (1.0 + uContrast) + 0.5;',
    '  }',
    '',
    '  gl_FragColor = vec4(color.rgb, uAlpha);',
    '}'
  ].join('\n'), [
    this.brightnessUniform_,
    this.contrastUniform_
  ]);

  /**
   * @private
   * @type {number}
   */
  this.brightness_ = opt_brightness || 0;

  /**
   * @private
   * @type {number}
   */
  this.contrast_ = opt_contrast || 0;

};
goog.inherits(
    webglmaps.shader.fragment.BrightnessContrast, webglmaps.shader.Fragment);


/**
 * @return {number} Brightness.
 */
webglmaps.shader.fragment.BrightnessContrast.prototype.getBrightness =
    function() {
  return this.brightness_;
};


/**
 * @return {number} Contrast.
 */
webglmaps.shader.fragment.BrightnessContrast.prototype.getContrast =
    function() {
  return this.contrast_;
};


/**
 * @inheritDoc
 */
webglmaps.shader.fragment.BrightnessContrast.prototype.isAnimated =
    function() {
  return true;
};


/**
 * @param {number} brightness Brightness.
 */
webglmaps.shader.fragment.BrightnessContrast.prototype.setBrightness =
    function(brightness) {
  this.brightness_ = brightness;
};


/**
 * @param {number} contrast Contrast.
 */
webglmaps.shader.fragment.BrightnessContrast.prototype.setContrast =
    function(contrast) {
  this.contrast_ = contrast;
};


/**
 * @inheritDoc
 */
webglmaps.shader.fragment.BrightnessContrast.prototype.setUniforms =
    function() {
  this.brightnessUniform_.set1f(this.brightness_);
  this.contrastUniform_.set1f(this.contrast_);
};
