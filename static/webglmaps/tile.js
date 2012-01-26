goog.provide('webglmaps.Tile');

goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('webglmaps.EventTargetGLObject');
goog.require('webglmaps.Texture');
goog.require('webglmaps.TileCoord');



/**
 * @constructor
 * @extends {webglmaps.EventTargetGLObject}
 * @param {webglmaps.TileCoord} tileCoord Tile coord.
 * @param {string} src Source.
 * @param {string=} opt_crossOrigin Cross origin.
 */
webglmaps.Tile = function(tileCoord, src, opt_crossOrigin) {

  goog.base(this);

  /**
   * @type {webglmaps.TileCoord}
   */
  this.tileCoord = tileCoord;

  /**
   * @type {string}
   */
  this.src = src;

  var image = new Image();
  if (goog.isDef(opt_crossOrigin)) {
    image.crossOrigin = opt_crossOrigin;
  }

  /**
   * @type {Image}
   */
  this.image = image;

  /**
   * @private
   * @type {boolean}
   */
  this.loaded_ = false;

  goog.events.listenOnce(image, goog.events.EventType.LOAD,
      this.handleImageLoad, false, this);

  /**
   * @type {webglmaps.Texture}
   */
  this.texture = new webglmaps.Texture(image);

  /**
   * @private
   * @type {number}
   */
  this.firstUsedTime_ = 0;

  /**
   * @private
   * @type {number}
   */
  this.lastUsedTime_ = 0;

};
goog.inherits(webglmaps.Tile, webglmaps.EventTargetGLObject);


/**
 * @return {number} First used time.
 */
webglmaps.Tile.prototype.getFirstUsedTime = function() {
  return this.firstUsedTime_;
};


/**
 * @return {number} Last used time.
 */
webglmaps.Tile.prototype.getLastUsedTime = function() {
  return this.lastUsedTime_;
};


/**
 * @param {goog.events.BrowserEvent} event Event.
 */
webglmaps.Tile.prototype.handleImageLoad = function(event) {
  this.loaded_ = true;
  this.dispatchEvent(new goog.events.Event(goog.events.EventType.CHANGE));
};


/**
 * @return {boolean} Is loaded?
 */
webglmaps.Tile.prototype.isLoaded = function() {
  return this.loaded_;
};


/**
 * @param {WebGLRenderingContext} gl GL.
 */
webglmaps.Tile.prototype.setGL = function(gl) {
  goog.base(this, 'setGL', gl);
  this.texture.setGL(gl);
};


/**
 * @param {number} usedTime Used time.
 */
webglmaps.Tile.prototype.setUsedTime = function(usedTime) {
  if (this.firstUsedTime_ === 0) {
    this.firstUsedTime_ = usedTime;
  }
  this.lastUsedTime_ = usedTime;
};
