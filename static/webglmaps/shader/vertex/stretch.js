goog.provide('webglmaps.shader.vertex.Stretch');

goog.require('webglmaps.shader.Vertex');



/**
 * @constructor
 * @extends {webglmaps.shader.Vertex}
 */
webglmaps.shader.vertex.Stretch = function() {

  goog.base(this, [
    'attribute vec2 aPosition;',
    'attribute vec2 aTexCoord;',
    '',
    'uniform mat4 uMVPMatrix;',
    '',
    'varying vec2 vTexCoord;',
    '',
    'void main(void) {',
    '  float x = (aPosition.x - 0.5)',
    '            * (1.0 - 0.5 * (aPosition.y - 0.5)) + 0.5;',
    '  gl_Position = uMVPMatrix * vec4(x, aPosition.y, 0.0, 1.0);',
    '  vTexCoord = aTexCoord;',
    '}'
  ].join('\n'));

};
goog.inherits(webglmaps.shader.vertex.Stretch, webglmaps.shader.Vertex);
