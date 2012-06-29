goog.provide('webglmaps.shader.fragment.Grayscale');

goog.require('webglmaps.shader.Fragment');



/**
 * @constructor
 * @extends {webglmaps.shader.Fragment}
 */
webglmaps.shader.fragment.Grayscale = function() {

  goog.base(this, [
    'precision mediump float;',
    '',
    'uniform float uAlpha;',
    'uniform sampler2D uTexture;',
    '',
    'varying vec2 vTexCoord;',
    '',
    'void main(void) {',
    '  vec4 fragColor = texture2D(uTexture, vTexCoord);',
    '  float luminance = 0.30 * fragColor.r + ',
    '                    0.59 * fragColor.g + ',
    '                    0.11 * fragColor.b;',
    '  gl_FragColor = vec4(luminance, luminance, luminance, uAlpha);',
    '}'
  ].join('\n'));

};
goog.inherits(webglmaps.shader.fragment.Grayscale, webglmaps.shader.Fragment);
