goog.provide('webglmaps.Texture');

goog.require('goog.asserts');
goog.require('webglmaps.GLObject');



/**
 * @constructor
 * @extends {webglmaps.GLObject}
 * @param {Image} image Image.
 */
webglmaps.Texture = function(image) {

  goog.base(this);

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
goog.inherits(webglmaps.Texture, webglmaps.GLObject);


/**
 */
webglmaps.Texture.prototype.bind = function() {
  var gl = this.getGL();
  if (goog.isNull(this.texture_)) {
    var texture = gl.createTexture();
    gl.bindTexture(goog.webgl.TEXTURE_2D, texture);
    gl.texImage2D(goog.webgl.TEXTURE_2D, 0, goog.webgl.RGBA, goog.webgl.RGBA,
        goog.webgl.UNSIGNED_BYTE, this.image_);
    gl.texParameteri(goog.webgl.TEXTURE_2D, goog.webgl.TEXTURE_MAG_FILTER,
        goog.webgl.LINEAR);
    gl.texParameteri(goog.webgl.TEXTURE_2D, goog.webgl.TEXTURE_MIN_FILTER,
        goog.webgl.LINEAR);
    this.texture_ = texture;
  } else {
    gl.bindTexture(goog.webgl.TEXTURE_2D, this.texture_);
  }
};


/**
 * @inheritDoc
 */
webglmaps.Texture.prototype.setGL = function(gl) {
  if (!goog.isNull(this.gl)) {
    if (!goog.isNull(this.texture_)) {
      this.gl.deleteTexture(this.texture_);
      this.texture_ = null;
    }
  }
  goog.base(this, 'setGL', gl);
};
