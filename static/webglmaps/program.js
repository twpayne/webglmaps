goog.provide('webglmaps.Program');

goog.require('goog.Disposable');
goog.require('goog.asserts');
goog.require('webglmaps.shader.Fragment');
goog.require('webglmaps.shader.Vertex');
goog.require('webglmaps.shader.fragment.Default');
goog.require('webglmaps.shader.vertex.Default');



/**
 * @constructor
 * @extends {goog.Disposable}
 * @param {WebGLRenderingContext} gl GL.
 * @param {webglmaps.shader.Fragment=} opt_fragmentShader Fragment shader.
 * @param {webglmaps.shader.Vertex=} opt_vertexShader Vertex shader.
 */
webglmaps.Program = function(gl, opt_fragmentShader, opt_vertexShader) {

  goog.base(this);

  /**
   * @private
   * @type {WebGLRenderingContext}
   */
  this.gl_ = gl;

  /**
   * @private
   * @type {webglmaps.shader.Fragment}
   */
  this.fragmentShader_ =
      opt_fragmentShader || new webglmaps.shader.fragment.Default();
  this.fragmentShader_.setGL(gl);

  /**
   * @private
   * @type {webglmaps.shader.Vertex}
   */
  this.vertexShader_ =
      opt_vertexShader || new webglmaps.shader.vertex.Default();
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
