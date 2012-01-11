goog.provide('webglmaps.shader.fragment.ColorHalftone');

goog.require('webglmaps.shader.Fragment');



/**
 * @constructor
 * @extends {webglmaps.shader.Fragment}
 */
webglmaps.shader.fragment.ColorHalftone = function() {

  goog.base(this, [
    'precision mediump float;',
    '',
    'uniform float uAlpha;',
    'uniform sampler2D uTexture;',
    '',
    'varying vec2 vTexCoord;',
    '',
    'const vec2 center = vec2(0.5, 0.5);',
    'const float angle = 0.0;',
    'const float scale = 0.5;',
    'const vec2 texSize = vec2(256.0, 256.0);',
    '',
    'float pattern(float angle) {',
    '    float s = sin(angle), c = cos(angle);',
    '    vec2 tex = vTexCoord * texSize - center;',
    '    vec2 point = vec2(',
    '        c * tex.x - s * tex.y,',
    '        s * tex.x + c * tex.y',
    '    ) * scale;',
    '    return (sin(point.x) * sin(point.y)) * 4.0;',
    '}',
    '',
    'void main() {',
    '    vec4 color = texture2D(uTexture, vTexCoord);',
    '    vec3 cmy = 1.0 - color.rgb;',
    '    float k = min(cmy.x, min(cmy.y, cmy.z));',
    '    cmy = (cmy - k) / (1.0 - k);',
    '    cmy = clamp(cmy * 10.0 - 3.0 + vec3(pattern(angle + 0.26179),',
    '                                        pattern(angle + 1.30899), ',
    '                                        pattern(angle)), 0.0, 1.0);',
    '    k = clamp(k * 10.0 - 5.0 + pattern(angle + 0.78539), 0.0, 1.0);',
    '    gl_FragColor = vec4(1.0 - cmy - k, uAlpha);',
    '}'
  ].join('\n'));

};
goog.inherits(
    webglmaps.shader.fragment.ColorHalftone, webglmaps.shader.Fragment);
