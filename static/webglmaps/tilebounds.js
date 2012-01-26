goog.provide('webglmaps.TileBounds');

goog.require('goog.asserts');
goog.require('webglmaps.TileCoord');



/**
 * @constructor
 * @param {number} z Z.
 * @param {number} x0 X0.
 * @param {number} y0 Y0.
 * @param {number} x1 X1.
 * @param {number} y1 Y1.
 */
webglmaps.TileBounds = function(z, x0, y0, x1, y1) {

  /**
   * @type {number}
   */
  this.z = z;

  /**
   * @type {number}
   */
  this.x0 = x0;

  /**
   * @type {number}
   */
  this.y0 = y0;

  /**
   * @type {number}
   */
  this.x1 = x1;

  /*
   * @type {number}
   */
  this.y1 = y1;

};


/**
 * @param {function(this: T, webglmaps.TileCoord, number, number)} callback
 *     Callback.
 * @param {T=} opt_obj Object.
 * @template T
 */
webglmaps.TileBounds.prototype.forEach = function(callback, opt_obj) {
  var tileCoord = new webglmaps.TileCoord(this.z, 0, 0);
  var x0 = this.x0, y0 = this.y0, x1 = this.x1, y1 = this.y1, i, j;
  var x, y;
  for (x = x0, i = 0; x <= x1; ++x, ++i) {
    tileCoord.x = x;
    for (y = y0, j = 0; y <= y1; ++y, ++j) {
      tileCoord.y = y;
      callback.call(opt_obj, tileCoord, i, j);
      goog.asserts.assert(tileCoord.z == this.z);
      goog.asserts.assert(tileCoord.x == x);
      goog.asserts.assert(tileCoord.y == y);
    }
  }
};


/**
 * @return {number} Height.
 */
webglmaps.TileBounds.prototype.getHeight = function() {
  return this.y1 - this.y0 + 1;
};


/**
 * @return {number} Width.
 */
webglmaps.TileBounds.prototype.getWidth = function() {
  return this.x1 - this.x0 + 1;
};
