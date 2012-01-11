goog.provide('webglmaps.shader.fragment.Invert');

goog.require('webglmaps.shader.Fragment');



/**
 * @constructor
 * @extends {webglmaps.shader.Fragment}
 */
webglmaps.shader.fragment.Invert = function() {

  goog.base(this, [
    'precision mediump float;',
    '',
    'uniform float uAlpha;',
    'uniform sampler2D uTexture;',
    '',
    'varying vec2 vTexCoord;',
    '',
    'void main(void) {',
    '  gl_FragColor = vec4(1.0 - vec3(texture2D(uTexture, vTexCoord)),',
    '                      uAlpha);',
    '}'
  ].join('\n'));

};
goog.inherits(webglmaps.shader.fragment.Invert, webglmaps.shader.Fragment);
