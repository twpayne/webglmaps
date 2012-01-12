goog.provide('webglmaps.shader.fragment.HueSaturation');

goog.require('goog.math');
goog.require('webglmaps.Uniform');
goog.require('webglmaps.shader.Fragment');



/**
 * @constructor
 * @extends {webglmaps.shader.Fragment}
 * @param {number=} opt_hue Hue.
 * @param {number=} opt_saturation Saturation.
 * @see https://github.com/evanw/glfx.js
 */
webglmaps.shader.fragment.HueSaturation = function(opt_hue, opt_saturation) {

  /**
   * @private
   * @type {webglmaps.Uniform}
   */
  this.hueUniform_ = new webglmaps.Uniform('uHue');

  /**
   * @private
   * @type {webglmaps.Uniform}
   */
  this.saturationUniform_ = new webglmaps.Uniform('uSaturation');

  goog.base(this, [
    'precision mediump float;',
    '',
    'uniform float uAlpha;',
    'uniform float uHue;',
    'uniform float uSaturation;',
    'uniform sampler2D uTexture;',
    'uniform float uTime;',
    '',
    'varying vec2 vTexCoord;',
    '',
    'void main() {',
    '  vec4 color = texture2D(uTexture, vTexCoord);',
    '',
    '  float angle = uHue * 3.14159265;',
    '  float s = sin(angle), c = cos(angle);',
    '  vec3 weights = (vec3(2.0 * c, -sqrt(3.0) * s - c, sqrt(3.0) * s - c)',
    '                  + 1.0) / 3.0;',
    '  float len = length(color.rgb);',
    '  color.rgb = vec3(',
    '    dot(color.rgb, weights.xyz),',
    '    dot(color.rgb, weights.zxy),',
    '    dot(color.rgb, weights.yzx)',
    '  );',
    '  ',
    '  /* saturation adjustment */',
    '  float average = (color.r + color.g + color.b) / 3.0;',
    '  if (uSaturation > 0.0) {',
    '    color.rgb += (average - color.rgb)',
    '                 * (1.0 - 1.0 / (1.001 - uSaturation));',
    '  } else {',
    '    color.rgb += (average - color.rgb) * (-uSaturation);',
    '  }',
    '',
    '  gl_FragColor = vec4(color.rgb, uAlpha);',
    '}'
  ].join('\n'), [
    this.hueUniform_,
    this.saturationUniform_
  ]);

  /**
   * @private
   * @type {number}
   */
  this.hue_ = opt_hue || 0;

  /**
   * @private
   * @type {number}
   */
  this.saturation_ = opt_saturation || 0;

};
goog.inherits(
    webglmaps.shader.fragment.HueSaturation, webglmaps.shader.Fragment);


/**
 * @return {number} Hue.
 */
webglmaps.shader.fragment.HueSaturation.prototype.getHue = function() {
  return this.hue_;
};


/**
 * @return {number} Saturation.
 */
webglmaps.shader.fragment.HueSaturation.prototype.getSaturation = function() {
  return this.saturation_;
};


/**
 * @inheritDoc
 */
webglmaps.shader.fragment.HueSaturation.prototype.isAnimated = function() {
  return true;
};


/**
 * @param {number} hue Hue.
 */
webglmaps.shader.fragment.HueSaturation.prototype.setHue = function(hue) {
  this.hue_ = hue;
};


/**
 * @param {number} saturation Saturation.
 */
webglmaps.shader.fragment.HueSaturation.prototype.setSaturation =
    function(saturation) {
  this.saturation_ = saturation;
};


/**
 * @inheritDoc
 */
webglmaps.shader.fragment.HueSaturation.prototype.setUniforms = function() {
  this.hueUniform_.set1f(this.hue_);
  this.saturationUniform_.set1f(this.saturation_);
};
