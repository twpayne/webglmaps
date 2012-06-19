goog.provide('webglmaps.feature.Point');
goog.provide('webglmaps.geojson');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('webglmaps.projection.SphericalMercator');



/**
 * @constructor
 * @param {Array.<number>} coordinates Coordinates.
 * @param {Object} properties Properties.
 */
webglmaps.feature.Point = function(coordinates, properties) {

  /**
   * @type {Array.<number>}
   */
  this.coordinates = coordinates;

  /**
   * @type {Object}
   */
  this.properties = properties;

};


/**
 * @param {GeoJSONFeatureCollection} geojson GeoJSON.
 * @return {Array.<webglmaps.feature.Point>} Point features.
 */
webglmaps.geojson.getPointFeatures = function(geojson) {
  var result = [];
  goog.asserts.assert(geojson.type == 'FeatureCollection');
  goog.array.forEach(geojson.features, function(feature) {
    if (feature.geometry.type == 'Point') {
      var wgs84Coordinates = feature.geometry.coordinates;
      result.push(new webglmaps.feature.Point(
          webglmaps.projection.SphericalMercator.fromWgs84(wgs84Coordinates),
          feature.properties));
    }
  });
  return result;
};
