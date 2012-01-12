goog.provide('webglmaps.shader.fragment.HueSaturation');

goog.require('webglmaps.shader.Fragment');



/**
 * @constructor
 * @extends {webglmaps.shader.Fragment}
 * @see https://github.com/evanw/glfx.js
 */
webglmaps.shader.fragment.HueSaturation = function() {

  goog.base(this, [
    'precision mediump float;',
    '',
    'uniform float uAlpha;',
    'uniform sampler2D uTexture;',
    'uniform float uTime;',
    '',
    'varying vec2 vTexCoord;',
    '',
    'void main() {',
    '  vec4 color = texture2D(uTexture, vTexCoord);',
    '',
    '  float hue = 0.0;',
    '  float saturation = -sin(uTime / 5000.0);',
    '',
    '  float angle = hue * 3.14159265;',
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
    '  if (saturation > 0.0) {',
    '    color.rgb += (average - color.rgb)',
    '                 * (1.0 - 1.0 / (1.001 - saturation));',
    '  } else {',
    '    color.rgb += (average - color.rgb) * (-saturation);',
    '  }',
    '',
    '  gl_FragColor = vec4(color.rgb, uAlpha);',
    '}'
  ].join('\n'));

};
goog.inherits(
    webglmaps.shader.fragment.HueSaturation, webglmaps.shader.Fragment);


/**
 * @inheritDoc
 */
webglmaps.shader.fragment.HueSaturation.prototype.isAnimated = function() {
  return true;
};
