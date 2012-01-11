goog.provide('webglmaps.shader.fragment.Default');

goog.require('webglmaps.shader.Fragment');



/**
 * @constructor
 * @extends {webglmaps.shader.Fragment}
 */
webglmaps.shader.fragment.Default = function() {

  goog.base(this, [
    'precision mediump float;',
    '',
    'uniform float uAlpha;',
    'uniform sampler2D uTexture;',
    '',
    'varying vec2 vTexCoord;',
    '',
    'void main(void) {',
    '  gl_FragColor = vec4(vec3(texture2D(uTexture, vTexCoord)), uAlpha);',
    '}'
  ].join('\n'));

};
goog.inherits(webglmaps.shader.fragment.Default, webglmaps.shader.Fragment);
