goog.require('goog.Disposable');
goog.require('goog.asserts');
goog.require('goog.debug.Logger');

goog.provide('webglmaps.Program');



/**
 * @constructor
 * @extends {goog.Disposable}
 * @param {WebGLRenderingContext} gl WebGL rendering context.
 */
webglmaps.Program = function(gl) {

  goog.base(this);

  /**
   * @private
   * @type {goog.debug.Logger}
   */
  this.logger_ = goog.debug.Logger.getLogger('webglmaps.Program');

  /**
   * @private
   * @type {WebGLRenderingContext}
   */
  this.gl_ = gl;

  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, webglmaps.Program.FRAGMENT_SHADER_SOURCE);
  gl.compileShader(fragmentShader);
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    this.logger_.severe(gl.getShaderInfoLog(fragmentShader));
    goog.asserts.assert(
        gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS));
  }

  /**
   * @private
   * @type {WebGLShader}
   */
  this.fragmentShader_ = fragmentShader;

  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, webglmaps.Program.VERTEX_SHADER_SOURCE);
  gl.compileShader(vertexShader);
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    this.logger_.severe(gl.getShaderInfoLog(vertexShader));
    goog.asserts.assert(
        gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS));
  }

  /**
   * @private
   * @type {WebGLShader}
   */
  this.vertexShader_ = vertexShader;

  var program = gl.createProgram();
  gl.attachShader(program, fragmentShader);
  gl.attachShader(program, vertexShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    this.logger_.severe(gl.getProgramInfoLog(program));
    goog.asserts.assert(gl.getProgramParameter(program, gl.LINK_STATUS));
  }

  /**
   * @private
   * @type {WebGLProgram}
   */
  this.program_ = program;

  /**
   * @type {number}
   */
  this.aPositionLocation = gl.getAttribLocation(program, 'aPosition');

  /**
   * @type {number}
   */
  this.aTexCoordLocation = gl.getAttribLocation(program, 'aTexCoord');

  /**
   * @type {WebGLUniformLocation}
   */
  this.uMVPMatrixLocation = gl.getUniformLocation(program, 'uMVPMatrix');

  /**
   * @type {WebGLUniformLocation}
   */
  this.uAlphaLocation = gl.getUniformLocation(program, 'uAlpha');

  /**
   * @type {WebGLUniformLocation}
   */
  this.uTextureLocation = gl.getUniformLocation(program, 'uTexture');

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
      gl.deleteShader(this.fragmentShader_);
      this.fragmentShader_ = null;
    }
    if (goog.isDefAndNotNull(this.vertexShader_)) {
      gl.deleteShader(this.vertexShader_);
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
 */
webglmaps.Program.FRAGMENT_SHADER_SOURCE = [
  'precision mediump float;',
  '',
  'uniform float uAlpha;',
  'uniform sampler2D uTexture;',
  '',
  'varying vec2 vTexCoord;',
  '',
  'void main(void) {',
  '  gl_FragColor = texture2D(uTexture, vTexCoord);',
  '  gl_FragColor.a = uAlpha;',
  '}'
].join('\n');


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
