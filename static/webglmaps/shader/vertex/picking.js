goog.provide('webglmaps.shader.vertex.Picking');

goog.require('webglmaps.shader.Vertex');



/**
 * @constructor
 * @extends {webglmaps.shader.Vertex}
 */
webglmaps.shader.vertex.Picking = function() {

  goog.base(this, [
    'attribute vec2 aPosition;',
    'attribute vec4 aPickingColor;',
    '',
    'uniform mat4 uMVPMatrix;',
    '',
    'varying vec4 vPickingColor;',
    '',
    'void main(void) {',
    '  gl_Position = uMVPMatrix * vec4(aPosition, 0.0, 1.0);',
    '  vPickingColor = aPickingColor;',
    '}'
  ].join('\n'));

};
goog.inherits(webglmaps.shader.vertex.Picking, webglmaps.shader.Vertex);
