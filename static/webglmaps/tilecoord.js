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
 * @return {number} Hash.
 */
webglmaps.TileCoord.prototype.hash = function() {
  return (this.x << this.z) + this.y;
};
