goog.provide('webglmaps.shader.vertex.Default');

goog.require('webglmaps.shader.Vertex');



/**
 * @constructor
 * @extends {webglmaps.shader.Vertex}
 */
webglmaps.shader.vertex.Default = function() {

  goog.base(this, [
    'attribute vec2 aPosition;',
    'attribute vec2 aTexCoord;',
    '',
    'uniform mat4 uMVPMatrix;',
    '',
    'varying vec2 vTexCoord;',
    '',
    'void main(void) {',
    '  gl_Position = uMVPMatrix * vec4(aPosition, 0.0, 1.0);',
    '  vTexCoord = aTexCoord;',
    '}'
  ].join('\n'));

};
goog.inherits(webglmaps.shader.vertex.Default, webglmaps.shader.Vertex);
