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

  var layer, tileUrl;
  if (webglmaps.USE_LOCAL_TILESERVER) {
    tileUrl = webglmaps.tileurl.fromTemplate(
        'http://localhost:8000/data/image/0/tiles/{z}/{x}/{y}');
    layer = new webglmaps.Layer(tileUrl, 0, 8);
  } else {
    tileUrl = webglmaps.tileurl.fromTileUrls([
      webglmaps.tileurl.fromTemplate(
          'http://a.tile.openstreetmap.org/{z}/{x}/{y}.png'),
      webglmaps.tileurl.fromTemplate(
          'http://b.tile.openstreetmap.org/{z}/{x}/{y}.png'),
      webglmaps.tileurl.fromTemplate(
          'http://c.tile.openstreetmap.org/{z}/{x}/{y}.png')
    ]);
    layer = new webglmaps.Layer(tileUrl, 0, 18);
  }
  map.addLayer(layer);
  var mouseNavigation = new webglmaps.MouseNavigation();
  mouseNavigation.setMap(map);

};
goog.exportSymbol('webglmaps.main', webglmaps.main);
