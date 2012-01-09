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

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  var bgColor = goog.color.hexToRgb('#fff');
  var map = new webglmaps.Map(canvas, 256, bgColor);

  var tileUrl = webglmaps.tileurl.fromTemplate(
      'http://localhost:8000/data/image/0/tiles/{z}/{x}/{y}');
  var layer = new webglmaps.Layer(tileUrl, undefined, 8);
  map.addLayer(layer);
  var mouseNavigation = new webglmaps.MouseNavigation();
  mouseNavigation.setMap(map);

};
goog.exportSymbol('webglmaps.main', webglmaps.main);
