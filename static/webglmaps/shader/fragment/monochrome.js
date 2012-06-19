goog.provide('webglmaps.shader.fragment.Monochrome');

goog.require('webglmaps.Uniform');
goog.require('webglmaps.shader.Fragment');



/**
 * @constructor
 * @extends {webglmaps.shader.Fragment}
 * @param {Array.<number>=} opt_color Color.
 */
webglmaps.shader.fragment.Monochrome = function(opt_color) {

  /**
   * @private
   * @type {webglmaps.Uniform}
   */
  this.colorUniform_ = new webglmaps.Uniform('uColor');

  goog.base(this, [
    'precision mediump float;',
    '',
    'uniform float uAlpha;',
    'uniform vec3 uColor;',
    '',
    'void main(void) {',
    '  gl_FragColor = vec4(uColor, uAlpha);',
    '}'
  ].join('\n'), [
    this.colorUniform_
  ]);

  /**
   * @private
   * @type {Array.<number>}
   */
  this.color_ = opt_color || [1, 0, 0];

};
goog.inherits(webglmaps.shader.fragment.Monochrome, webglmaps.shader.Fragment);


/**
 * @return {Array.<number>} Color.
 */
webglmaps.shader.fragment.Monochrome.prototype.getColor = function() {
  return this.color_;
};


/**
 * @param {Array.<number>} color Color.
 */
webglmaps.shader.fragment.Monochrome.prototype.setColor = function(color) {
  this.color_ = color;
};


/**
 * @inheritDoc
 */
webglmaps.shader.fragment.Monochrome.prototype.setUniforms = function() {
  this.colorUniform_.set3fv(this.color_);
};
