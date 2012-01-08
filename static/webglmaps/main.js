goog.require('goog.color');
goog.require('goog.debug.Console');
goog.require('goog.debug.LogManager');
goog.require('goog.debug.Logger');
goog.require('goog.debug.Logger.Level');
goog.require('goog.debug.errorHandlerWeakDep');
goog.require('webglmaps.Layer');
goog.require('webglmaps.Map');
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

  if (!goog.debug.Console.instance) {
    goog.debug.Console.instance = new goog.debug.Console();
  }
  goog.debug.Console.instance.setCapturing(true);

  if (goog.DEBUG) {
    goog.debug.LogManager.getRoot().setLevel(goog.debug.Logger.Level.ALL);
  }

  var bgColor = goog.color.hexToRgb('#fff');
  var map = new webglmaps.Map(canvas, 256, bgColor);

  var tileUrl = webglmaps.tileurl.fromTemplate(
      'http://localhost:8000/data/image/0/tiles/{z}/{x}/{y}');
  var layer = new webglmaps.Layer(tileUrl);
  layer.populate(1);
  map.addLayer(layer);

};
goog.exportSymbol('webglmaps.main', webglmaps.main);
