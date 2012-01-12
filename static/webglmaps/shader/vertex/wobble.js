goog.provide('webglmaps.shader.vertex.Wobble');

goog.require('webglmaps.shader.Vertex');



/**
 * @constructor
 * @extends {webglmaps.shader.Vertex}
 */
webglmaps.shader.vertex.Wobble = function() {

  goog.base(this, [
    'attribute vec2 aPosition;',
    'attribute vec2 aTexCoord;',
    '',
    'uniform mat4 uMVPMatrix;',
    'uniform float uTime;',
    '',
    'varying vec2 vTexCoord;',
    '',
    'const float pi = 3.14159265358979323846264;',
    'const float amplitude = 0.1;',
    'const float period = 1000.0;',
    '',
    'void main(void) {',
    '  float theta = uTime / period;',
    '  float phase = 2.0 * pi * aPosition.y;',
    '  float x = aPosition.x + amplitude * cos(theta + phase);',
    '  gl_Position = uMVPMatrix * vec4(x, aPosition.y, 0.0, 1.0);',
    '  vTexCoord = aTexCoord;',
    '}'
  ].join('\n'));

};
goog.inherits(webglmaps.shader.vertex.Wobble, webglmaps.shader.Vertex);


/**
 * @inheritDoc
 */
webglmaps.shader.vertex.Wobble.prototype.isAnimated = function() {
  return true;
};
