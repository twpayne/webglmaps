goog.provide('webglmaps.projection.SphericalMercator');

goog.require('webglmaps.Projection');



/**
 * @constructor
 * @extends {webglmaps.Projection}
 * @protected
 */
webglmaps.projection.SphericalMercatorImpl = function() {
  goog.base(this);
};
goog.inherits(
    webglmaps.projection.SphericalMercatorImpl, webglmaps.Projection);


/**
 * @const
 * @type {number}
 */
webglmaps.projection.SphericalMercatorImpl.ORIGIN_SHIFT = Math.PI * 6378137;


/**
 * @inheritDoc
 */
webglmaps.projection.SphericalMercatorImpl.prototype.fromWgs84 =
    function(coordinates) {
  var originShift = webglmaps.projection.SphericalMercatorImpl.ORIGIN_SHIFT;
  var lon = coordinates[0];
  var lat = coordinates[1];
  var mx, my;
  mx = lon * originShift / 180;
  my = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180);
  my = my * originShift / 180;
  // FIXME remove hacky to-world transformation that follows
  mx = (mx + originShift) / (2 * originShift);
  my = (my + originShift) / (2 * originShift);
  return [mx, my];
};


/**
 * @inheritDoc
 */
webglmaps.projection.SphericalMercatorImpl.prototype.toWgs84 =
    function(coordinates) {
  var originShift = webglmaps.projection.SphericalMercatorImpl.ORIGIN_SHIFT;
  var mx = coordinates[0];
  var my = coordinates[1];
  // FIXME remove hacky from-world transformation that follows
  mx = 2 * originShift * mx - originShift;
  my = 2 * originShift * my - originShift;
  var lon = (mx / originShift) * 180;
  var lat = (my / originShift) * 180;
  lat = 180 / Math.PI *
      (2 * Math.atan(Math.exp(lat * Math.PI / 180)) - Math.PI / 2);
  return [lon, lat];
};


/**
 * @const
 * @type {webglmaps.projection.SphericalMercatorImpl}
 */
webglmaps.projection.SphericalMercator =
    new webglmaps.projection.SphericalMercatorImpl();
