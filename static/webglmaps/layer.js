goog.require('goog.dispose');
goog.require('goog.events');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');
goog.require('webglmaps.Program');
goog.require('webglmaps.Tile');
goog.require('webglmaps.TileCoord');
goog.require('webglmaps.TileUrl');

goog.provide('webglmaps.Layer');



/**
 * @constructor
 * @extends {goog.events.EventTarget}
 * @param {webglmaps.TileUrl} tileUrl Tile URL.
 */
webglmaps.Layer = function(tileUrl) {

  goog.base(this);

  /**
   * @type {WebGLRenderingContext}
   * @private
   */
  this.gl_ = null;

  /**
   * @type {Object.<number, ?number>}
   * @private
   */
  this.tileChangeListeners_ = {};

  /**
   * @private
   * @type {webglmaps.TileUrl}
   */
  this.tileUrl_ = tileUrl;

  /**
   * @private
   * @type {Object.<string, webglmaps.Tile>}
   */
  this.tiles_ = {};

};
goog.inherits(webglmaps.Layer, goog.events.EventTarget);


/**
 * @protected
 */
webglmaps.Layer.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
  goog.disposeAll(goog.object.getValues(this.tiles_));
  this.tiles_ = null;
};


/**
 * @param {webglmaps.TileCoord} tileCoord Tile coord.
 * @return {webglmaps.Tile} Tile.
 */
webglmaps.Layer.prototype.getTile = function(tileCoord) {
  var key = tileCoord.toString();
  if (goog.object.containsKey(this.tiles_, key)) {
    return this.tiles_[key];
  }
  var tile = new webglmaps.Tile(tileCoord, this.tileUrl_(tileCoord));
  this.tileChangeListeners_[goog.getUid(tile)] = goog.events.listen(
      tile, goog.events.EventType.CHANGE, goog.bind(this.onTileChange_, this));
  this.tiles_[key] = tile;
  return tile;
};


/**
 * @param {webglmaps.Tile} tile Tile.
 * @private
 */
webglmaps.Layer.prototype.onTileChange_ = function(tile) {
  this.dispatchEvent(new goog.events.Event(goog.events.EventType.CHANGE, this));
};


/**
 * @param {number} z Z.
 */
webglmaps.Layer.prototype.populate = function(z) {
  var n = 1 << z;
  var tileCoord, x, y;
  for (x = 0; x < n; ++x) {
    for (y = 0; y < n; ++y) {
      this.getTile(new webglmaps.TileCoord(z, x, y));
    }
  }
};


/**
 * @param {number} time Time.
 * @param {webglmaps.Program} program Program.
 * @return {boolean} Dirty?
 */
webglmaps.Layer.prototype.render = function(time, program) {
  var dirty = false;
  goog.object.forEach(this.tiles_, function(tile) {
    dirty = tile.render(time, program) || dirty;
  }, this);
  return dirty;
};


/**
 * @param {WebGLRenderingContext} gl WebGL rendering context.
 */
webglmaps.Layer.prototype.setGL = function(gl) {
  this.gl_ = gl;
  goog.object.forEach(this.tiles_, function(tile) {
    tile.setGL(gl);
  });
};
