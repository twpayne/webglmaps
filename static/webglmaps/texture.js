goog.provide('webglmaps.Texture');

goog.require('goog.asserts');
goog.require('goog.Disposable');



/**
 * @constructor
 * @extends {goog.Disposable}
 * @param {Image} image Image.
 */
webglmaps.Texture = function(image) {

  goog.base(this);

  /**
   * @private
   * @type {WebGLRenderingContext}
   */
  this.gl_ = null;

  /**
   * @private
   * @type {WebGLTexture}
   */
  this.texture_ = null;

  /**
   * @private
   * @type {Image}
   */
  this.image_ = image;

};
goog.inherits(webglmaps.Texture, goog.Disposable);


/**
 * @return {WebGLTexture} Texture.
 */
webglmaps.Texture.prototype.bindAndGet = function() {
  var gl = this.gl_;
  goog.asserts.assert(!goog.isNull(gl));
  if (goog.isNull(this.texture_)) {
    var image = this.image_;
    if (!image.complete) {
      return null;
    }
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    this.texture_ = texture;
  } else {
    gl.bindTexture(gl.TEXTURE_2D, this.texture_);
  }
  return this.texture_;
};


/**
 * @protected
 */
webglmaps.Texture.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
  this.setGL(null);
};


/**
 * @return {Image} Image.
 */
webglmaps.Texture.prototype.getImage = function() {
  return this.image_;
};


/**
 * @param {WebGLRenderingContext} gl GL.
 */
webglmaps.Texture.prototype.setGL = function(gl) {
  if (!goog.isNull(this.gl_)) {
    if (!goog.isNull(this.texture_)) {
      this.gl_.deleteTexture(this.texture_);
      this.texture_ = null;
    }
  }
  this.gl_ = gl;
};
