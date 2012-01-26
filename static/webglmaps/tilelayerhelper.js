goog.provide('webglmaps.TileLayerHelper');

goog.require('goog.dispose');
goog.require('goog.webgl');
goog.require('webglmaps.ArrayBuffer');
goog.require('webglmaps.GLObject');
goog.require('webglmaps.Program');
goog.require('webglmaps.TileBounds');
goog.require('webglmaps.TileQueue');



/**
 * @constructor
 * @param {webglmaps.TileQueue} tileQueue Tile queue.
 * @extends {webglmaps.GLObject}
 */
webglmaps.TileLayerHelper = function(tileQueue) {

  /**
   * @private
   * @type {webglmaps.TileBounds}
   */
  this.tileBounds_ = null;

  /**
   * @private
   * @type {webglmaps.TileQueue}
   */
  this.tileQueue_ = tileQueue;

  /**
   * @private
   * @type {Object.<number, Array.<webglmaps.ArrayBuffer>>}
   */
  this.tileVerticess_ = {};

};
goog.inherits(webglmaps.TileLayerHelper, webglmaps.GLObject);


/**
 * @param {number} z Z.
 * @param {number} i I.
 * @param {number} j J.
 */
webglmaps.TileLayerHelper.prototype.bindTileVertices = function(z, i, j) {
  var n = 1 << z;
  var tileVerticess;
  if (z in this.tileVerticess_) {
    tileVerticess = this.tileVerticess_[z];
  } else {
    var gl = this.getGL();
    tileVerticess = new Array(n * n);
    var data = new Float32Array(16);
    var x, y;
    for (x = 0; x < n; ++x) {
      for (y = 0; x < n; ++y) {
        data[4 * 0 + 0] = x / n;
        data[4 * 0 + 1] = y / n;
        data[4 * 0 + 2] = 0;
        data[4 * 0 + 3] = 1;
        data[4 * 1 + 0] = (x + 1) / n;
        data[4 * 1 + 1] = y / n;
        data[4 * 1 + 2] = 1;
        data[4 * 1 + 3] = 1;
        data[4 * 2 + 0] = x / n;
        data[4 * 2 + 1] = (y + 1) / n;
        data[4 * 2 + 2] = 0;
        data[4 * 2 + 3] = 0;
        data[4 * 3 + 0] = (x + 1) / n;
        data[4 * 3 + 1] = (y + 1) / n;
        data[4 * 3 + 2] = 1;
        data[4 * 3 + 3] = 0;
        tileVerticess[n * x + y] =
            new webglmaps.ArrayBuffer(gl, data, goog.webgl.STATIC_DRAW);
      }
    }
    this.tileVerticess_[z] = tileVerticess;
  }
  tileVerticess[n * i + j].bind();
};


/**
 * @return {webglmaps.TileBounds} Tile bounds.
 */
webglmaps.TileLayerHelper.prototype.getTileBounds = function() {
  return this.tileBounds_;
};


/**
 * @return {webglmaps.TileQueue} Tile queue.
 */
webglmaps.TileLayerHelper.prototype.getTileQueue = function() {
  return this.tileQueue_;
};


/**
 * @inheritDoc
 */
webglmaps.TileLayerHelper.prototype.setGL = function(gl) {
  goog.disposeAll(goog.object.getValues(this.tileVerticess_));
  this.tileVerticess_ = {};
  goog.base(this, 'setGL', gl);
};


/**
 * @param {webglmaps.TileBounds} tileBounds Tile bounds.
 */
webglmaps.TileLayerHelper.prototype.setTileBounds = function(tileBounds) {
  this.tileBounds_ = tileBounds;
};
