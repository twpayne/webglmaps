goog.provide('webglmaps.main');

goog.require('goog.array');
goog.require('goog.color');
goog.require('goog.debug.errorHandlerWeakDep');
goog.require('goog.events');
goog.require('goog.events.KeyEvent');
goog.require('goog.events.KeyHandler');
goog.require('goog.events.KeyHandler.EventType');
goog.require('webglmaps.Map');
goog.require('webglmaps.MouseNavigation');
goog.require('webglmaps.TileLayer');
goog.require('webglmaps.TileUrl');
goog.require('webglmaps.shader.fragment.ColorHalftone');
goog.require('webglmaps.shader.fragment.Grayscale');
goog.require('webglmaps.shader.fragment.HexagonalPixelate');
goog.require('webglmaps.shader.fragment.Invert');


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
    tileLayer = new webglmaps.TileLayer(tileUrl, {
      maxZ: 18
    });
  }
  map.addTileLayer(tileLayer);
  var mouseNavigation = new webglmaps.MouseNavigation();
  mouseNavigation.setMap(map);

  var fragmentShaders = [
    null,
    new webglmaps.shader.fragment.Invert(),
    new webglmaps.shader.fragment.Grayscale(),
    new webglmaps.shader.fragment.HexagonalPixelate(),
    new webglmaps.shader.fragment.ColorHalftone()
  ];
  goog.events.listen(
      new goog.events.KeyHandler(document),
      goog.events.KeyHandler.EventType.KEY,
      /**
       * @param {goog.events.KeyEvent} event Event.
       */
      function(event) {
        window.console.log(event.charCode);
        if (event.charCode == 102) {
          var fragmentShader = tileLayer.getFragmentShader();
          var index = goog.array.indexOf(fragmentShaders, fragmentShader);
          index = goog.math.modulo(index + 1, fragmentShaders.length);
          fragmentShader = fragmentShaders[index];
          tileLayer.setFragmentShader(fragmentShader);
        }
      });

};
goog.exportSymbol('webglmaps.main', webglmaps.main);
