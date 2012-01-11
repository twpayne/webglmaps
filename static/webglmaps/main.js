goog.provide('webglmaps.main');

goog.require('goog.color');
goog.require('goog.debug.errorHandlerWeakDep');
goog.require('webglmaps.Map');
goog.require('webglmaps.MouseNavigation');
goog.require('webglmaps.TileLayer');
goog.require('webglmaps.TileUrl');


/**
 * @typedef {Object}
 */
goog.debug.ErrorHandler = goog.debug.errorHandlerWeakDep;


/**
 * @define {boolean} Use local tileserver.
 */
webglmaps.USE_LOCAL_TILESERVER = false;


/**
 * @param {HTMLCanvasElement} canvas Canvas.
 */
webglmaps.main = function(canvas) {

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  var bgColor = goog.color.hexToRgb('#fff');
  var map = new webglmaps.Map(canvas, 256, bgColor);

  var tileLayer, tileUrl;
  if (webglmaps.USE_LOCAL_TILESERVER) {
    tileUrl = webglmaps.tileurl.fromTemplate(
        'http://localhost:8000/data/image/0/tiles/{z}/{x}/{y}');
    tileLayer = new webglmaps.TileLayer(tileUrl);
  } else {
    tileUrl = webglmaps.tileurl.fromTileUrls([
      webglmaps.tileurl.fromTemplate(
          'http://a.tile.openstreetmap.org/{z}/{x}/{y}.png'),
      webglmaps.tileurl.fromTemplate(
          'http://b.tile.openstreetmap.org/{z}/{x}/{y}.png'),
      webglmaps.tileurl.fromTemplate(
          'http://c.tile.openstreetmap.org/{z}/{x}/{y}.png')
    ]);
    tileLayer = new webglmaps.TileLayer(tileUrl, 0, 18);
  }
  map.addTileLayer(tileLayer);
  var mouseNavigation = new webglmaps.MouseNavigation();
  mouseNavigation.setMap(map);

};
goog.exportSymbol('webglmaps.main', webglmaps.main);
