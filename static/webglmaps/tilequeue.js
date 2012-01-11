goog.provide('webglmaps.TileQueue');

goog.require('goog.events');
goog.require('goog.events.EventType');



/**
 * @constructor
 */
webglmaps.TileQueue = function() {
};


/**
 * @param {webglmaps.Tile} tile Tile.
 */
webglmaps.TileQueue.prototype.enqueue = goog.abstractMethod;


/**
 */
webglmaps.TileQueue.prototype.reprioritize = function() {
};
