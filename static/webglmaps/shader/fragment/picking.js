goog.provide('webglmaps.shader.fragment.Picking');

goog.require('webglmaps.shader.Fragment');



/**
 * @constructor
 * @extends {webglmaps.shader.Fragment}
 */
webglmaps.shader.fragment.Picking = function() {

  goog.base(this, [
    'precision mediump float;',
    '',
    'varying vec4 vPickingColor;',
    '',
    'void main(void) {',
    '  gl_FragColor = vPickingColor;',
    '}'
  ].join('\n'));

};
goog.inherits(webglmaps.shader.fragment.Picking, webglmaps.shader.Fragment);
