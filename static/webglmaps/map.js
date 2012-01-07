goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.debug');
goog.require('goog.debug.Logger');
goog.require('goog.dom');
goog.require('webglmaps.Tile');
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
  'uniform sampler2D uTexture;',
  '',
  'varying vec2 vTexCoord;',
  '',
  'void main(void) {',
  '  gl_FragColor = texture2D(uTexture, vTexCoord);',
  '}'
].join('\n');


/**
 * @const
 * @type {string}
 */
webglmaps.VERTEX_SHADER_SOURCE = [
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



/**
 * @constructor
 * @param {HTMLCanvasElement} canvas Canvas.
 * @param {webglmaps.TileUrl} tileUrl Tile URL.
 * @param {number=} opt_tileSize Tile size.
 * @param {Array.<number>=} opt_bgColor Background color.
 */
webglmaps.Map = function(canvas, tileUrl, opt_tileSize, opt_bgColor) {

  /**
   * @private
   * @type {goog.debug.Logger}
   */
  this.logger_ = goog.debug.Logger.getLogger('webglmaps.Map');

  /**
   * @private
   * @type {webglmaps.TileUrl}
   */
  this.tileUrl_ = tileUrl;

  /**
   * @private
   * @type {number}
   */
  this.tileSize_ = opt_tileSize || 1;

  var gl = /** @type {WebGLRenderingContext} */
      (canvas.getContext('experimental-webgl', {
        'alpha': false,
        'depth': false,
        'antialias': true,
        'stencil': false,
        'preserveDrawingBuffer': false
      }));
  goog.asserts.assert(!goog.isNull(gl));

  var clearColor = opt_bgColor || [0, 0, 0];
  gl.clearColor(clearColor[0], clearColor[1], clearColor[2], 1);
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

  this.positionAttribLocation_ =
      gl.getAttribLocation(shaderProgram, 'aPosition');
  gl.enableVertexAttribArray(this.positionAttribLocation_);

  this.texCoordAttribLocation_ =
      gl.getAttribLocation(shaderProgram, 'aTexCoord');
  gl.enableVertexAttribArray(this.texCoordAttribLocation_);

  this.mvpMatrixLocation_ =
      gl.getUniformLocation(shaderProgram, 'uMVPMatrix');

  this.textureAttribLocation_ =
      gl.getUniformLocation(shaderProgram, 'uTexture');

  /**
   * @private
   * @type {Array.<webglmaps.Tile>}
   */
  this.tiles_ = [];
  var z = 2, n = 1 << z, x, y;
  for (x = 0; x < n; ++x) {
    for (y = 0; y < n; ++y) {
      var tileCoord = new webglmaps.TileCoord(z, x, y);
      this.tiles_.push(new webglmaps.Tile(gl, tileCoord, this.tileUrl_));
    }
  }

  /**
   * @private
   * @type {WebGLRenderingContext}
   */
  this.gl_ = gl;

  this.animate_();

};


/**
 * @private
 */
webglmaps.Map.prototype.animate_ = function() {
  window.webkitRequestAnimationFrame(
      goog.bind(this.animate_, this), this.gl_.canvas);
  this.render_();
};


/**
 * @private
 */
webglmaps.Map.prototype.render_ = function() {

  var gl = this.gl_;

  gl.clear(gl.COLOR_BUFFER_BIT);

  var xScale, yScale, xOffset, yOffset;
  if (gl.drawingBufferWidth > gl.drawingBufferHeight) {
    xScale = 2 * gl.drawingBufferHeight / gl.drawingBufferWidth;
    yScale = 2;
    xOffset = -1 + (gl.drawingBufferWidth - gl.drawingBufferHeight) /
        gl.drawingBufferWidth;
    yOffset = -1;
  } else if (gl.drawingBufferWidth == gl.drawingBufferHeight) {
    xScale = 2;
    yScale = 2;
    xOffset = -1;
    yOffset = -1;
  } else {
    xScale = 2;
    yScale = 2 * gl.drawingBufferWidth / gl.drawingBufferHeight;
    xOffset = -1;
    yOffset = -1 + (gl.drawingBufferHeight - gl.drawingBufferWidth) /
        gl.drawingBufferHeight;
  }
  var mvpMatrix = [
    xScale, 0, 0, 0,
    0, yScale, 0, 0,
    0, 0, 1, 0,
    xOffset, yOffset, 0, 1
  ];
  gl.uniformMatrix4fv(
      this.mvpMatrixLocation_, false, new Float32Array(mvpMatrix));

  goog.array.forEach(this.tiles_, function(tile) {
    tile.draw(
        this.positionAttribLocation_,
        this.texCoordAttribLocation_,
        this.textureAttribLocation_);
  }, this);

};
