goog.require('goog.structs.PriorityQueue');

goog.provide('webglmaps.TileQueue');



/**
 * @constructor
 * @param {webglmaps.Map} map Map.
 * @param {number=} opt_n N.
 */
webglmaps.TileQueue = function(map, opt_n) {

  /**
   * @private
   * @type {webglmaps.Map}
   */
  this.map_ = map;

  /**
   * @private
   * @type {number}
   */
  this.i_ = 0;

  /**
   * @private
   * @type {number}
   */
  this.n_ = opt_n || 16;

  /**
   * @private
   * @type {goog.structs.PriorityQueue}
   */
  this.queue_ = new goog.structs.PriorityQueue();

};


/**
 * @param {webglmaps.Tile} tile Tile.
 * @param {Image} image Image.
 */
webglmaps.TileQueue.prototype.handleTileImageError = function(tile, image) {
  --this.i_;
  this.update();
};


/**
 * @param {webglmaps.Tile} tile Tile.
 * @param {Image} image Image.
 */
webglmaps.TileQueue.prototype.handleTileImageLoad = function(tile, image) {
  --this.i_;
  this.update();
};


/**
 * @param {webglmaps.Tile} tile Tile.
 */
webglmaps.TileQueue.prototype.enqueue = function(tile) {
  var priority = this.getPriority(tile);
  if (goog.isNull(priority)) {
    tile.dispatchEvent(new goog.events.Event(goog.events.EventType.DROP, tile));
  } else {
    this.queue_.enqueue(priority, tile);
  }
};


/**
 * @param {webglmaps.Tile} tile Tile.
 * @return {?number} Priority.
 */
webglmaps.TileQueue.prototype.getPriority = function(tile) {
  if (goog.isNull(this.map_)) {
    return 0;
  }
  var delta = goog.vec.Vec3.clone(tile.tileCoord.getCenter());
  goog.vec.Vec3.subtract(delta, this.map_.getCenter(), delta);
  var magnitudeSquared = goog.vec.Vec3.magnitudeSquared(delta);
  var mapZoom = Math.ceil(this.map_.getZoom() - 0.5);
  if (tile.tileCoord.z == mapZoom) {
    return magnitudeSquared;
  } else if (tile.tileCoord.z < mapZoom) {
    return mapZoom - tile.tileCoord.z + magnitudeSquared;
  } else {
    return Infinity;
  }
};


/**
 */
webglmaps.TileQueue.prototype.reprioritize = function() {
  if (!this.queue_.isEmpty()) {
    var queue = this.queue_;
    this.queue_ = new goog.structs.PriorityQueue();
    var priority, tile;
    while (!queue.isEmpty()) {
      tile = /** @type {webglmaps.Tile} */ queue.remove();
      this.enqueue(tile);
    }
  }
};


/**
 */
webglmaps.TileQueue.prototype.update = function() {
  var image, tile;
  while (this.i_ < this.n_) {
    tile = this.queue_.remove();
    if (!goog.isDef(tile)) {
      break;
    }
    tile.image.src = tile.src;
    goog.events.listen(tile.image, goog.events.EventType.ERROR,
        goog.partial(this.handleTileImageError, tile), false, this);
    goog.events.listen(tile.image, goog.events.EventType.ERROR,
        tile.handleImageError, false, tile);
    goog.events.listen(tile.image, goog.events.EventType.LOAD,
        goog.partial(this.handleTileImageLoad, tile), false, this);
    goog.events.listen(tile.image, goog.events.EventType.LOAD,
        tile.handleImageLoad, false, tile);
    ++this.i_;
  }
};
