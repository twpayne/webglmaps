goog.provide('webglmaps.tilequeue.Null');

goog.require('webglmaps.Tile');
goog.require('webglmaps.TileQueue');



/**
 * @constructor
 * @extends {webglmaps.TileQueue}
 */
webglmaps.tilequeue.Null = function() {
  goog.base(this);
};
goog.inherits(webglmaps.tilequeue.Null, webglmaps.TileQueue);


/**
 * @param {webglmaps.Tile} tile Tile.
 */
webglmaps.tilequeue.Null.prototype.enqueue = function(tile) {
  tile.image.src = tile.src;
};
