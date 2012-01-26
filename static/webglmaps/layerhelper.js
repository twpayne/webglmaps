goog.provide('webglmaps.LayerHelper');

goog.require('webglmaps.GLObject');
goog.require('webglmaps.Program');
goog.require('webglmaps.ProgramCache');



/**
 * @constructor
 * @extends {webglmaps.GLObject}
 */
webglmaps.LayerHelper = function() {

  goog.base(this);

  /**
   * @private
   * @type {number}
   */
  this.time_ = 0;

  /**
   * @private
   * @type {webglmaps.ProgramCache}
   */
  this.programCache_ = new webglmaps.ProgramCache();

  /**
   * @private
   * @type {webglmaps.Program}
   */
  this.program_ = null;

  /**
   * @private
   * @type {webglmaps.shader.Fragment}
   */
  this.defaultFragmentShader_ = new webglmaps.shader.fragment.Default();

  /**
   * @private
   * @type {webglmaps.shader.Vertex}
   */
  this.defaultVertexShader_ = new webglmaps.shader.vertex.Default();

};
goog.inherits(webglmaps.LayerHelper, webglmaps.GLObject);


/**
 * @return {webglmaps.Program} Program.
 */
webglmaps.LayerHelper.prototype.getProgram = function() {
  return this.program_;
};


/**
 * @return {number} Time.
 */
webglmaps.LayerHelper.prototype.getTime = function() {
  return this.time_;
};


/**
 * @inheritDoc
 */
webglmaps.LayerHelper.prototype.setGL = function(gl) {
  goog.base(this, 'setGL', gl);
  this.defaultFragmentShader_.setGL(gl);
  this.defaultVertexShader_.setGL(gl);
  this.programCache_.setGL(gl);
};


/**
 * @param {goog.vec.Mat4.Float32} positionToViewportMatrix
 *     Position to viewport matrix.
 */
webglmaps.LayerHelper.prototype.setPositionToViewportMatrix =
    function(positionToViewportMatrix) {
  this.positionToViewportMatrix_ = positionToViewportMatrix;
};


/**
 * @param {webglmaps.shader.Fragment} fragmentShader Fragment shader.
 * @param {webglmaps.shader.Vertex} vertexShader Vertex shader.
 */
webglmaps.LayerHelper.prototype.setShaders =
    function(fragmentShader, vertexShader) {
  var gl = this.getGL();
  if (goog.isNull(fragmentShader)) {
    fragmentShader = this.defaultFragmentShader_;
  }
  if (goog.isNull(vertexShader)) {
    vertexShader = this.defaultVertexShader_;
  }
  var program = this.programCache_.get(fragmentShader, vertexShader);
  if (program != this.program_) {
    if (program.unsafeGetGL() != gl) {
      program.setGL(gl);
    }
    program.use();
    this.program_ = program;
  }
  program.timeUniform.set1f(this.time_);
  program.mvpMatrixUniform.setMatrix4fv(false, this.positionToViewportMatrix_);
  fragmentShader.setUniforms();
  vertexShader.setUniforms();
};


/**
 * @param {number} time Time.
 */
webglmaps.LayerHelper.prototype.setTime = function(time) {
  this.time = time;
};
