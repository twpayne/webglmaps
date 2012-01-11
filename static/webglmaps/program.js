goog.provide('webglmaps.Program');

goog.require('goog.Disposable');
goog.require('goog.asserts');
goog.require('webglmaps.FragmentShader');
goog.require('webglmaps.VertexShader');



/**
 * @constructor
 * @extends {goog.Disposable}
 * @param {WebGLRenderingContext} gl WebGL rendering context.
 */
webglmaps.Program = function(gl) {

  goog.base(this);

  /**
   * @private
   * @type {WebGLRenderingContext}
   */
  this.gl_ = gl;

  /**
   * @private
   * @type {webglmaps.FragmentShader}
   */
  this.fragmentShader_ =
      new webglmaps.FragmentShader(webglmaps.Program.FRAGMENT_SHADER_SOURCE);
  this.fragmentShader_.setGL(gl);

  /**
   * @private
   * @type {webglmaps.VertexShader}
   */
  this.vertexShader_ =
      new webglmaps.VertexShader(webglmaps.Program.VERTEX_SHADER_SOURCE);
  this.vertexShader_.setGL(gl);

  var program = gl.createProgram();
  gl.attachShader(program, this.fragmentShader_.get());
  gl.attachShader(program, this.vertexShader_.get());
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    window.console.log(gl.getProgramInfoLog(program));
    goog.asserts.assert(gl.getProgramParameter(program, gl.LINK_STATUS));
  }

  /**
   * @private
   * @type {WebGLProgram}
   */
  this.program_ = program;

  /**
   * @type {webglmaps.Uniform}
   */
  this.alphaUniform = new webglmaps.Uniform('uAlpha');
  this.alphaUniform.setGL(gl);
  this.alphaUniform.setProgram(program);

  /**
   * @type {webglmaps.Uniform}
   */
  this.mvpMatrixUniform = new webglmaps.Uniform('uMVPMatrix');
  this.mvpMatrixUniform.setGL(gl);
  this.mvpMatrixUniform.setProgram(program);

  /**
   * @type {webglmaps.Uniform}
   */
  this.textureUniform = new webglmaps.Uniform('uTexture');
  this.textureUniform.setGL(gl);
  this.textureUniform.setProgram(program);

  /**
   * @type {number}
   */
  this.aPositionLocation = gl.getAttribLocation(program, 'aPosition');

  /**
   * @type {number}
   */
  this.aTexCoordLocation = gl.getAttribLocation(program, 'aTexCoord');

};
goog.inherits(webglmaps.Program, goog.Disposable);


/**
 * @protected
 */
webglmaps.Program.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
  var gl = this.gl_;
  if (goog.isDefAndNotNull(gl)) {
    if (goog.isDefAndNotNull(this.program_)) {
      gl.deleteProgram(this.program_);
      this.program_ = null;
    }
    if (goog.isDefAndNotNull(this.fragmentShader_)) {
      this.fragmentShader_.setGL(null);
      this.fragmentShader_ = null;
    }
    if (goog.isDefAndNotNull(this.vertexShader_)) {
      this.vertexShader_.setGL(null);
      this.vertexShader_ = null;
    }
    this.gl_ = null;
  }
};


/**
 */
webglmaps.Program.prototype.use = function() {
  var gl = this.gl_;
  gl.useProgram(this.program_);
  gl.enableVertexAttribArray(this.aPositionLocation);
  gl.enableVertexAttribArray(this.aTexCoordLocation);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
};


/**
 * @const
 * @type {string}
 * https://github.com/evanw/glfx.js
 */
webglmaps.Program.COLOR_HALFTONE_FRAGMENT_SHADER_SOURCE = [
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
].join('\n');


/**
 * @const
 * @type {string}
 */
webglmaps.Program.DEFAULT_FRAGMENT_SHADER_SOURCE = [
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
].join('\n');


/**
 * @const
 * @type {string}
 */
webglmaps.Program.GRAYSCALE_FRAGMENT_SHADER_SOURCE = [
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
].join('\n');


/**
 * @const
 * @type {string}
 * https://github.com/evanw/glfx.js
 */
webglmaps.Program.HEXAGONAL_PIXELATE_FRAGMENT_SHADER_SOURCE = [
  'precision mediump float;',
  '',
  'uniform float uAlpha;',
  'uniform sampler2D uTexture;',
  '',
  'varying vec2 vTexCoord;',
  '',
  'const vec2 center = vec2(0.5, 0.5);',
  'const float scale = 8.0;',
  'const vec2 texSize = vec2(256.0, 256.0);',
  '',
  'void main() {',
  '    vec2 tex = (vTexCoord * texSize - center) / scale;',
  '    tex.y /= 0.866025404;',
  '    tex.x -= tex.y * 0.5;',
  '    ',
  '    vec2 a;',
  '    if (tex.x + tex.y - floor(tex.x) - floor(tex.y) < 1.0)',
  '       a = vec2(floor(tex.x), floor(tex.y));',
  '    else a = vec2(ceil(tex.x), ceil(tex.y));',
  '    vec2 b = vec2(ceil(tex.x), floor(tex.y));',
  '    vec2 c = vec2(floor(tex.x), ceil(tex.y));',
  '    ',
  '    vec3 TEX = vec3(tex.x, tex.y, 1.0 - tex.x - tex.y);',
  '    vec3 A = vec3(a.x, a.y, 1.0 - a.x - a.y);',
  '    vec3 B = vec3(b.x, b.y, 1.0 - b.x - b.y);',
  '    vec3 C = vec3(c.x, c.y, 1.0 - c.x - c.y);',
  '    ',
  '    float alen = length(TEX - A);',
  '    float blen = length(TEX - B);',
  '    float clen = length(TEX - C);',
  '    ',
  '    vec2 choice;',
  '    if (alen < blen) {',
  '        if (alen < clen) choice = a;',
  '        else choice = c;',
  '    } else {',
  '        if (blen < clen) choice = b;',
  '        else choice = c;',
  '    }',
  '    ',
  '    choice.x += choice.y * 0.5;',
  '    choice.y *= 0.866025404;',
  '    choice *= scale / texSize;',
  '    gl_FragColor = vec4(vec3(texture2D(uTexture,',
  '                                       choice + center / texSize)),',
  '                        uAlpha);',
  '}'
].join('\n');


/**
 * @const
 * @type {string}
 */
webglmaps.Program.INVERT_FRAGMENT_SHADER_SOURCE = [
  'precision mediump float;',
  '',
  'uniform float uAlpha;',
  'uniform sampler2D uTexture;',
  '',
  'varying vec2 vTexCoord;',
  '',
  'void main(void) {',
  '  gl_FragColor = vec4(1.0 - vec3(texture2D(uTexture, vTexCoord)), uAlpha);',
  '}'
].join('\n');


/**
 * @type {string}
 */
webglmaps.Program.FRAGMENT_SHADER_SOURCE =
    webglmaps.Program.DEFAULT_FRAGMENT_SHADER_SOURCE;


/**
 * @const
 * @type {string}
 */
webglmaps.Program.VERTEX_SHADER_SOURCE = [
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
].join('\n');
