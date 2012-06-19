goog.provide('webglmaps.Projection');



/**
 * @constructor
 */
webglmaps.Projection = function() {
};


/**
 * @param {Array.<number>} coordinates Coordinates.
 * @return {Array.<number>} Coordinates.
 */
webglmaps.Projection.prototype.fromWgs84 = goog.abstractMethod;
