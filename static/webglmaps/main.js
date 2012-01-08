goog.require('goog.color');
goog.require('goog.debug.errorHandlerWeakDep');
goog.require('webglmaps.Layer');
goog.require('webglmaps.Map');
goog.require('webglmaps.MouseNavigation');
goog.require('webglmaps.TileUrl');

goog.provide('webglmaps.main');


/**
 * @typedef {Object}
 */
goog.debug.ErrorHandler = goog.debug.errorHandlerWeakDep;


/**
 * @param {HTMLCanvasElement} canvas Canvas.
 */
webglmaps.main = function(canvas) {

  var bgColor = goog.color.hexToRgb(goog.DEBUG ? '#f00' : '#fff');
  var map = new webglmaps.Map(canvas, 256, bgColor);

  var zoom = 2;
  var tileUrl = webglmaps.tileurl.fromTemplate(
      'http://localhost:8000/data/image/0/tiles/{z}/{x}/{y}');
  var layer = new webglmaps.Layer(tileUrl);
  layer.populate(zoom);
  map.addLayer(layer);
  map.setZoom(zoom);
  var mouseNavigation = new webglmaps.MouseNavigation();
  mouseNavigation.setMap(map);

};
goog.exportSymbol('webglmaps.main', webglmaps.main);
