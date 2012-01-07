goog.require('goog.asserts');
goog.require('goog.debug');
goog.require('goog.debug.Logger');
goog.require('goog.dom');
goog.require('webglmaps.TileCoord');
goog.require('webglmaps.TileUrl');
goog.require('webglmaps.utils');

goog.provide('webglmaps.Map');


/**
 * @const
 * @type {string}
 */
webglmaps.FRAGMENT_SHADER_SOURCE = [
  'precision mediump float;',
  '',
  'uniform sampler2D t_reflectance;',
  '',
  'varying vec2 v_texcoord;',
  '',
  'void main(void) {',
  '  gl_FragColor = texture2D(t_reflectance, v_texcoord);',
  '}'
].join('\n');


/**
 * @const
 * @type {string}
 */
webglmaps.VERTEX_SHADER_SOURCE = [
  'attribute vec2 a_vertex;',
  'attribute vec2 a_texcoord;',
  '',
  'uniform mat4 mvp_matrix;',
  '',
  'varying vec2 v_texcoord;',
  '',
  'void main(void) {',
  '  gl_Position = mvp_matrix * vec4(a_vertex, 0.0, 1.0);',
  '  v_texcoord = a_texcoord;',
  '}'
].join('\n');



/**
 * @constructor
 * @param {Element} element Element.
 * @param {webglmaps.TileUrl} tileUrl Tile URL.
 */
webglmaps.Map = function(element, tileUrl) {

  /**
   * @private
   */
  this.logger_ = goog.debug.Logger.getLogger('webglmaps.Map');

  var gl = element.getContext('experimental-webgl', {
    'alpha': false,
    'depth': false,
    'antialias': true,
    'stencil': false,
    'preserveDrawingBuffer': false
  });
  goog.asserts.assert(!goog.isNull(gl));

  if (goog.DEBUG) {
    this.logger_.info('gl.RENDERER = ' + gl.getParameter(gl.RENDERER));
    this.logger_.info('gl.SHADING_LANGUAGE_VERSION = ' +
        gl.getParameter(gl.SHADING_LANGUAGE_VERSION));
    this.logger_.info('gl.VENDOR = ' + gl.getParameter(gl.VENDOR));
    this.logger_.info('gl.VERSION = ' + gl.getParameter(gl.VERSION));
  }

  gl.clearColor(0, 0, 0, 1);
  gl.disable(gl.DEPTH_TEST);
  gl.disable(gl.SCISSOR_TEST);
  if (goog.DEBUG) {
    gl.frontFace(gl.CCW);
    gl.cullFace(gl.BACK);
    gl.enable(gl.CULL_FACE);
  } else {
    gl.disable(gl.CULL_FACE);
  }

  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, webglmaps.FRAGMENT_SHADER_SOURCE);
  gl.compileShader(fragmentShader);
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    this.logger_.severe(gl.getShaderInfoLog(fragmentShader));
    goog.asserts.assert(
        gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS));
  }

  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, webglmaps.VERTEX_SHADER_SOURCE);
  gl.compileShader(vertexShader);
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    this.logger_.severe(gl.getShaderInfoLog(vertexShader));
    goog.asserts.assert(
        gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS));
  }

  var shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, fragmentShader);
  gl.attachShader(shaderProgram, vertexShader);
  gl.linkProgram(shaderProgram);
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    this.logger_.severe(gl.getProgramInfoLog(shaderProgram));
    goog.asserts.assert(gl.getProgramParameter(shaderProgram, gl.LINK_STATUS));
  }

  gl.useProgram(shaderProgram);

  this.vertexLocation_ =
      gl.getAttribLocation(shaderProgram, 'a_vertex');
  gl.enableVertexAttribArray(this.vertexLocation_);

  this.texCoordLocation_ =
      gl.getAttribLocation(shaderProgram, 'a_texcoord');
  gl.enableVertexAttribArray(this.texCoordLocation_);

  this.mvpMatrixLocation_ =
      gl.getUniformLocation(shaderProgram, 'mvp_matrix');

  this.reflectanceLocation_ =
      gl.getUniformLocation(shaderProgram, 't_reflectance');

  this.vertexBuffer_ = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer_);
  var vertices = [
    0, 0,
    256, 0,
    0, 256,
    256, 256
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  this.texCoordBuffer_ = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer_);
  var texCoords = [
    0, 1,
    1, 1,
    0, 0,
    1, 0
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

  this.texture_ = gl.createTexture();
  var image = new Image();
  image.crossOrigin = '';
  image.onload =
      goog.bind(this.onTextureImageLoad_, this, this.texture_, image);
  var tileCoord = new webglmaps.TileCoord(0, 0, 0);
  image.src = tileUrl(tileCoord);

  /**
   * @private
   * @type {WebGLRenderingContext}
   */
  this.gl_ = gl;

  this.render_();

};


/**
 * @private
 */
webglmaps.Map.prototype.animate_ = function() {
  webglmaps.utils.requestAnimationFrame(
      goog.bind(this.animate_, this), this.gl_.canvas);
  this.render_();
};


/**
 * @param {WebGLTexture} texture Texture.
 * @param {Image} image Image.
 * @private
 */
webglmaps.Map.prototype.onTextureImageLoad_ = function(texture, image) {
  if (goog.DEBUG) {
    this.logger_.info(image.src);
  }
  var gl = this.gl_;
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.bindTexture(gl.TEXTURE_2D, null);
  this.render_();
};


/**
 * @private
 */
webglmaps.Map.prototype.render_ = function() {

  var gl = this.gl_;

  gl.clear(gl.COLOR_BUFFER_BIT);

  var mvpMatrix = [
    2 / gl.drawingBufferWidth, 0, 0, 0,
    0, 2 / gl.drawingBufferHeight, 0, 0,
    0, 0, 1, 0,
    -1, -1, 0, 1
  ];
  gl.uniformMatrix4fv(
      this.mvpMatrixLocation_, false, new Float32Array(mvpMatrix));

  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer_);
  gl.vertexAttribPointer(this.vertexLocation_, 2, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer_);
  gl.vertexAttribPointer(this.texCoordLocation_, 2, gl.FLOAT, false, 0, 0);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, this.texture_);
  gl.uniform1i(this.reflectanceLocation_, 0);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

};
