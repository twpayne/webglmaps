goog.provide('webglmaps.TileLayer');

goog.require('goog.dispose');
goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');
goog.require('goog.object');
goog.require('webglmaps.Tile');



/**
 * @constructor
 * @extends {goog.events.EventTarget}
 * @param {webglmaps.TileUrl} tileUrl Tile URL.
 * @param {number=} opt_minZ Min Z.
 * @param {number=} opt_maxZ Max Z.
 */
webglmaps.TileLayer = function(tileUrl, opt_minZ, opt_maxZ) {

  goog.base(this);

  /**
   * @private
   * @type {WebGLRenderingContext}
   */
  this.gl_ = null;

  /**
   * @private
   * @type {number}
   */
  this.lastUsedTime_ = 0;

  /**
   * @private
   * @type {webglmaps.TileUrl}
   */
  this.tileUrl_ = tileUrl;

  /**
   * @private
   * @type {?number}
   */
  this.minZ_ = opt_minZ || 0;

  /**
   * @private
   * @type {?number}
   */
  this.maxZ_ = opt_maxZ || null;

  /**
   * @private
   * @type {string}
   */
  this.crossDomain_ = '';

  /**
   * @private
   * @type {Object.<string, webglmaps.Tile>}
   */
  this.tiles_ = {};

  /**
   * @private
   * @type {boolean}
   */
  this.renderWithInterimTiles_ = true;

};
goog.inherits(webglmaps.TileLayer, goog.events.EventTarget);


/**
 * @protected
 */
webglmaps.TileLayer.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
  goog.disposeAll(goog.object.getValues(this.tiles_));
  this.tiles_ = {};
};


/**
 * @param {webglmaps.TileCoord} tileCoord Tile coord.
 * @return {webglmaps.Tile} Tile.
 */
webglmaps.TileLayer.prototype.findInterimTile = function(tileCoord) {
  tileCoord = tileCoord.clone();
  var key, tile;
  while (tileCoord.z >= this.minZ_) {
    tileCoord.z -= 1;
    tileCoord.x = Math.floor(tileCoord.x / 2);
    tileCoord.y = Math.floor(tileCoord.y / 2);
    key = tileCoord.toString();
    if (goog.object.containsKey(this.tiles_, key)) {
      tile = /** @type {webglmaps.Tile} */ goog.object.get(this.tiles_, key);
      if (tile.isLoaded()) {
        return tile;
      }
    }
  }
  return null;
};


/**
 * @return {number} Last used time.
 */
webglmaps.TileLayer.prototype.getLastUsedTime = function() {
  return this.lastUsedTime_;
};


/**
 * @return {boolean} Render with interim tiles.
 */
webglmaps.TileLayer.prototype.getRenderInterimTiles = function() {
  return this.renderWithInterimTiles_;
};


/**
 * @param {webglmaps.TileCoord} tileCoord Tile coord.
 * @param {webglmaps.TileQueue} tileQueue Tile queue.
 * @return {webglmaps.Tile} Tile.
 */
webglmaps.TileLayer.prototype.getTile = function(tileCoord, tileQueue) {
  if (!goog.isNull(this.minZ_) && tileCoord.z < this.minZ_) {
    return null;
  }
  if (!goog.isNull(this.maxZ_) && tileCoord.z > this.maxZ_) {
    return null;
  }
  var key = tileCoord.toString(), tile;
  if (goog.object.containsKey(this.tiles_, key)) {
    tile = /** @type {webglmaps.Tile} */ goog.object.get(this.tiles_, key);
  } else {
    tile = new webglmaps.Tile(
        tileCoord.clone(), this.tileUrl_(tileCoord), this.crossDomain_);
    goog.events.listenOnce(
        tile, goog.events.EventType.CHANGE, this.handleTileChange, false, this);
    goog.events.listenOnce(
        tile, goog.events.EventType.DROP, this.handleTileDrop, false, this);
    tile.setGL(this.gl_);
    goog.object.add(this.tiles_, key, tile);
    tileQueue.enqueue(tile);
  }
  return tile;
};


/**
 * @param {goog.events.Event} event Event.
 */
webglmaps.TileLayer.prototype.handleTileChange = function(event) {
  var tile = /** @type {webglmaps.Tile} */ event.target;
  if (tile.getLastUsedTime() == this.lastUsedTime_) {
    this.dispatchEvent(new goog.events.Event(goog.events.EventType.CHANGE));
  }
};


/**
 * @param {goog.events.Event} event Event.
 */
webglmaps.TileLayer.prototype.handleTileDrop = function(event) {
  var tile = /** @type {webglmaps.Tile} */ event.target;
  var key = tile.tileCoord.toString();
  goog.asserts.assert(goog.object.containsKey(this.tiles_, key));
  goog.object.remove(this.tiles_, key);
  goog.dispose(tile);
};


/**
 * @param {WebGLRenderingContext} gl GL.
 */
webglmaps.TileLayer.prototype.setGL = function(gl) {
  this.gl_ = gl;
  goog.object.forEach(this.tiles_, function(tile) {
    tile.setGL(gl);
  });
};


/**
 * @param {number} usedTime Used time.
 */
webglmaps.TileLayer.prototype.setUsedTime = function(usedTime) {
  this.lastUsedTime_ = usedTime;
};
