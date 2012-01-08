goog.provide('webglmaps.TileCoord');



/**
 * @constructor
 * @param {number} z Z.
 * @param {number} x X.
 * @param {number} y Y.
 */
webglmaps.TileCoord = function(z, x, y) {

  /**
   * @type {number}
   */
  this.z = z;

  /**
   * @type {number}
   */
  this.x = x;

  /**
   * @type {number}
   */
  this.y = y;

};


/**
 * @return {webglmaps.TileCoord} Clone.
 */
webglmaps.TileCoord.prototype.clone = function() {
  return new webglmaps.TileCoord(this.z, this.x, this.y);
};


/**
 * @param {goog.vec.Vec3.Vec3Like=} opt_center Center.
 * @return {!goog.vec.Vec3.Vec3Like} Center.
 */
webglmaps.TileCoord.prototype.getCenter = function(opt_center) {
  var n = 1 << this.z;
  if (goog.isDefAndNotNull(opt_center)) {
    goog.vec.Vec3.setFromValues(
        opt_center, (this.x + 0.5) / n, (n - this.y - 0.5) / n, 0);
    return opt_center;
  } else {
    return goog.vec.Vec3.createFromValues(
        (this.x + 0.5) / n, (n - this.y - 0.5) / n, 0);
  }
};


/**
 * @return {number} Hash.
 */
webglmaps.TileCoord.prototype.hash = function() {
  return (this.x << this.z) + this.y;
};


/**
 * @return {string} String.
 */
webglmaps.TileCoord.prototype.toString = function() {
  return [this.z, this.x, this.y].join('/');
};
