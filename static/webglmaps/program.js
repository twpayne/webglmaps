goog.provide('webglmaps.Program');

goog.require('goog.Disposable');
goog.require('goog.asserts');
goog.require('goog.webgl');
goog.require('webglmaps.VertexAttrib');
goog.require('webglmaps.shader.Fragment');
goog.require('webglmaps.shader.Vertex');



/**
 * @constructor
 * @extends {goog.Disposable}
 * @param {webglmaps.shader.Fragment} fragmentShader Fragment shader.
 * @param {webglmaps.shader.Vertex} vertexShader Vertex shader.
 */
webglmaps.Program = function(fragmentShader, vertexShader) {

  goog.base(this);

  /**
   * @private
   * @type {WebGLRenderingContext}
   */
  this.gl_ = null;

  /**
   * @private
   * @type {webglmaps.shader.Fragment}
   */
  this.fragmentShader_ = fragmentShader;

  /**
   * @private
   * @type {webglmaps.shader.Vertex}
   */
  this.vertexShader_ = vertexShader;

  /**
   * @private
   * @type {WebGLProgram}
   */
  this.program_ = null;

  /**
   * @type {webglmaps.Uniform}
   */
  this.alphaUniform = new webglmaps.Uniform('uAlpha');

  /**
   * @type {webglmaps.Uniform}
   */
  this.mvpMatrixUniform = new webglmaps.Uniform('uMVPMatrix');

  /**
   * @type {webglmaps.Uniform}
   */
  this.textureUniform = new webglmaps.Uniform('uTexture');

  /**
   * @type {webglmaps.Uniform}
   */
  this.timeUniform = new webglmaps.Uniform('uTime');

  /**
   * @type {webglmaps.VertexAttrib}
   */
  this.position = new webglmaps.VertexAttrib('aPosition');

  /**
   * @type {webglmaps.VertexAttrib}
   */
  this.texCoord = new webglmaps.VertexAttrib('aTexCoord');

};
goog.inherits(webglmaps.Program, goog.Disposable);


/**
 * @protected
 */
webglmaps.Program.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
  this.setGL(null);
};


/**
 * @return {WebGLRenderingContext} GL.
 */
webglmaps.Program.prototype.getGL = function() {
  return this.gl_;
};


/**
 * @return {WebGLProgram} Program.
 */
webglmaps.Program.prototype.getProgram = function() {
  return this.program_;
};


/**
 * @param {WebGLRenderingContext} gl GL.
 */
webglmaps.Program.prototype.setGL = function(gl) {
  if (!goog.isNull(this.gl_)) {
    if (!goog.isNull(this.program_)) {
      gl.deleteProgram(this.program_);
      this.program_ = null;
    }
    this.fragmentShader_.setGL(null);
    this.vertexShader_.setGL(null);
    this.alphaUniform.setGL(null);
    this.mvpMatrixUniform.setGL(null);
    this.textureUniform.setGL(null);
    this.timeUniform.setGL(null);
    this.position.setGL(null);
    this.texCoord.setGL(null);
  }
  this.gl_ = gl;
  if (!goog.isNull(gl)) {
    this.alphaUniform.setGL(gl);
    this.mvpMatrixUniform.setGL(gl);
    this.textureUniform.setGL(gl);
    this.timeUniform.setGL(gl);
    this.position.setGL(gl);
    this.texCoord.setGL(gl);
    this.fragmentShader_.setGL(gl);
    this.vertexShader_.setGL(gl);
    var program = gl.createProgram();
    gl.attachShader(program, this.fragmentShader_.get());
    gl.attachShader(program, this.vertexShader_.get());
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, goog.webgl.LINK_STATUS)) {
      window.console.log(gl.getProgramInfoLog(program));
      goog.asserts.assert(
          gl.getProgramParameter(program, goog.webgl.LINK_STATUS));
    }
    this.alphaUniform.setProgram(program);
    this.mvpMatrixUniform.setProgram(program);
    this.textureUniform.setProgram(program);
    this.timeUniform.setProgram(program);
    this.position.setProgram(program);
    this.texCoord.setProgram(program);
    this.fragmentShader_.setProgram(program);
    this.vertexShader_.setProgram(program);
    this.program_ = program;
  }
};


/**
 */
webglmaps.Program.prototype.use = function() {
  var gl = this.gl_;
  gl.useProgram(this.program_);
  this.position.enableArray();
  this.texCoord.enableArray();
  gl.enable(goog.webgl.BLEND);
  gl.blendFunc(goog.webgl.SRC_ALPHA, goog.webgl.ONE_MINUS_SRC_ALPHA);
};
