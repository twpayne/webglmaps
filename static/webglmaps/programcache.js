goog.provide('webglmaps.ProgramCache');

goog.require('goog.dispose');
goog.require('goog.object');
goog.require('webglmaps.GLObject');
goog.require('webglmaps.Program');
goog.require('webglmaps.shader.Fragment');
goog.require('webglmaps.shader.Vertex');



/**
 * @constructor
 * @extends {webglmaps.GLObject}
 */
webglmaps.ProgramCache = function() {

  goog.base(this);

  /**
   * @private
   * @type {Object.<webglmaps.shader.Fragment, Object.<webglmaps.shader.Vertex, webglmaps.Program>>}
   */
  this.programss_ = {};

};
goog.inherits(webglmaps.ProgramCache, webglmaps.GLObject);


/**
 * @param {webglmaps.shader.Fragment} fragmentShader Fragment shader.
 * @param {webglmaps.shader.Vertex} vertexShader Vertex shader.
 * @return {webglmaps.Program} Program.
 */
webglmaps.ProgramCache.prototype.get = function(fragmentShader, vertexShader) {
  var program, programs;
  if (fragmentShader in this.programss_) {
    programs = this.programss_[fragmentShader];
  } else {
    programs = {};
    this.programss_[fragmentShader] = programs;
  }
  if (vertexShader in programs) {
    program = programs[vertexShader];
  } else {
    program = new webglmaps.Program(fragmentShader, vertexShader);
    programs[vertexShader] = program;
  }
  return program;
};


/**
 * @inheritDoc
 */
webglmaps.ProgramCache.prototype.setGL = function(gl) {
  goog.object.forEach(this.programss_, function(programs) {
    goog.disposeAll(goog.object.getValues(programs));
  });
  goog.base(this, 'setGL', gl);
};
