goog.provide('webglmaps.TileQueue');

goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.structs.PriorityQueue');
goog.require('goog.vec.Vec3');
goog.require('webglmaps.Camera');



/**
 * @constructor
 * @param {number=} opt_n N.
 */
webglmaps.TileQueue = function(opt_n) {

  /**
   * @private
   * @type {webglmaps.Camera}
   */
  this.camera_ = null;

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
 */
webglmaps.TileQueue.prototype.enqueue = function(tile) {
  var priority = this.getPriority(tile);
  if (goog.isNull(priority)) {
    tile.dispatchEvent(new goog.events.Event(goog.events.EventType.DROP));
  } else {
    this.queue_.enqueue(priority, tile);
  }
};


/**
 * @param {webglmaps.Tile} tile Tile.
 * @return {?number} Priority.
 */
webglmaps.TileQueue.prototype.getPriority = function(tile) {
  if (goog.isNull(this.camera_)) {
    return 0;
  }
  var delta = goog.vec.Vec3.cloneFloat32(tile.tileCoord.getCenter());
  goog.vec.Vec3.subtract(delta, this.camera_.getCenter(), delta);
  var magnitudeSquared = goog.vec.Vec3.magnitudeSquared(delta);
  if (tile.tileCoord.z == this.camera_.getTileZoom()) {
    return magnitudeSquared;
  } else {
    return null;
  }
};


/**
 * @param {goog.events.Event} event Event.
 */
webglmaps.TileQueue.prototype.handleTileImageError = function(event) {
  --this.i_;
  this.update();
};


/**
 * @param {goog.events.Event} event Event.
 */
webglmaps.TileQueue.prototype.handleTileImageLoad = function(event) {
  --this.i_;
  this.update();
};


/**
 */
webglmaps.TileQueue.prototype.reprioritize = function() {
  if (!this.queue_.isEmpty()) {
    var queue = this.queue_;
    this.queue_ = new goog.structs.PriorityQueue();
    while (!queue.isEmpty()) {
      this.enqueue((/** @type {webglmaps.Tile} */ queue.remove()));
    }
  }
};


/**
 * @param {webglmaps.Camera} camera Camera.
 */
webglmaps.TileQueue.prototype.setCamera = function(camera) {
  this.camera_ = camera;
  this.reprioritize();
};


/**
 */
webglmaps.TileQueue.prototype.update = function() {
  var tile;
  while (!this.queue_.isEmpty() && this.i_ < this.n_) {
    tile = /** @type {webglmaps.Tile} */ this.queue_.remove();
    tile.image.src = tile.src;
    goog.events.listen(tile.image, goog.events.EventType.ERROR,
        this.handleTileImageError, false, this);
    goog.events.listen(tile.image, goog.events.EventType.LOAD,
        this.handleTileImageLoad, false, this);
    ++this.i_;
  }
};
