goog.provide('webglmaps.ProgramCache');

goog.require('goog.Disposable');
goog.require('goog.object');
goog.require('webglmaps.Program');
goog.require('webglmaps.shader.Fragment');
goog.require('webglmaps.shader.Vertex');



/**
 * @constructor
 * @extends {goog.Disposable}
 */
webglmaps.ProgramCache = function() {

  goog.base(this);

  /**
   * @private
   * @type {Object.<webglmaps.shader.Fragment, Object.<webglmaps.shader.Vertex, webglmaps.Program>>}
   */
  this.programss_ = {};

};
goog.inherits(webglmaps.ProgramCache, goog.Disposable);


/**
 * @protected
 */
webglmaps.ProgramCache.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
  goog.object.forEach(this.programss_, function(programs) {
    goog.disposeAll(goog.object.getValues(programs));
  });
  this.programss_ = {};
};


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
