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

  var layer, tileUrl;
  if (true) {
    tileUrl = webglmaps.tileurl.fromTemplate(
        'http://localhost:8000/data/image/0/tiles/{z}/{x}/{y}');
    layer = new webglmaps.Layer(tileUrl, 0, 8);
  } else {
    tileUrl = webglmaps.tileurl.fromTileUrls([
      webglmaps.tileurl.fromTemplate('http://mt0.google.com' +
          '/vt/lyrs=t@128,r@167000000&hl=en&x={x}&y={y}&z={z}&s=Gali'),
      webglmaps.tileurl.fromTemplate('http://mt1.google.com' +
          '/vt/lyrs=t@128,r@167000000&hl=en&x={x}&y={y}&z={z}&s=Gali'),
      webglmaps.tileurl.fromTemplate('http://mt2.google.com' +
          '/vt/lyrs=t@128,r@167000000&hl=en&x={x}&y={y}&z={z}&s=Gali'),
      webglmaps.tileurl.fromTemplate('http://mt3.google.com' +
          '/vt/lyrs=t@128,r@167000000&hl=en&x={x}&y={y}&z={z}&s=Gali')
    ]);
    layer = new webglmaps.Layer(tileUrl, 0, 16);
  }
  map.addLayer(layer);
  var mouseNavigation = new webglmaps.MouseNavigation();
  mouseNavigation.setMap(map);

};
goog.exportSymbol('webglmaps.main', webglmaps.main);
