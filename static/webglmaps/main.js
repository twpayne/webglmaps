goog.provide('webglmaps.main');

goog.require('goog.array');
goog.require('goog.color');
goog.require('goog.debug.errorHandlerWeakDep');
goog.require('goog.events');
goog.require('goog.events.KeyEvent');
goog.require('goog.events.KeyHandler');
goog.require('goog.events.KeyHandler.EventType');
goog.require('goog.math');
goog.require('webglmaps.Map');
goog.require('webglmaps.MouseNavigation');
goog.require('webglmaps.TileLayer');
goog.require('webglmaps.TileUrl');
goog.require('webglmaps.shader.fragment.BrightnessContrast');
goog.require('webglmaps.shader.fragment.ColorHalftone');
goog.require('webglmaps.shader.fragment.Grayscale');
goog.require('webglmaps.shader.fragment.HexagonalPixelate');
goog.require('webglmaps.shader.fragment.HueSaturation');
goog.require('webglmaps.shader.fragment.Invert');
goog.require('webglmaps.shader.vertex.Stretch');
goog.require('webglmaps.shader.vertex.Wobble');


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

  var tileLayer, tileLayer2 = null, tileUrl;
  if (webglmaps.USE_LOCAL_TILESERVER) {
    tileUrl = webglmaps.tileurl.fromTemplate(
        'http://localhost:8080/tiles/0/tiles/{z}/{x}/{y}');
    tileLayer = new webglmaps.TileLayer(tileUrl);
    var tileUrl2 = webglmaps.tileurl.fromTemplate(
        'http://localhost:8080/tiles/1/tiles/{z}/{x}/{y}');
    tileLayer2 = new webglmaps.TileLayer(tileUrl2, {
      visible: false
    });
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
  if (!goog.isNull(tileLayer2)) {
    map.addTileLayer(tileLayer2);
  }
  var mouseNavigation = new webglmaps.MouseNavigation();
  mouseNavigation.setMap(map);

  var bcFragmentShader = new webglmaps.shader.fragment.BrightnessContrast();
  bcFragmentShader.setBrightness(-0.25);
  bcFragmentShader.setContrast(0.25);
  var hsFragmentShader = new webglmaps.shader.fragment.HueSaturation();
  hsFragmentShader.setHue(-0.5);
  hsFragmentShader.setSaturation(0.5);
  var fragmentShaders = [
    null,
    bcFragmentShader,
    new webglmaps.shader.fragment.Grayscale(),
    new webglmaps.shader.fragment.Invert(),
    hsFragmentShader,
    new webglmaps.shader.fragment.HexagonalPixelate(),
    new webglmaps.shader.fragment.ColorHalftone()
  ];
  var vertexShaders = [
    null,
    new webglmaps.shader.vertex.Stretch(),
    new webglmaps.shader.vertex.Wobble()
  ];
  goog.events.listen(
      new goog.events.KeyHandler(document),
      goog.events.KeyHandler.EventType.KEY,
      /**
       * @param {goog.events.KeyEvent} event Event.
       */
      function(event) {
        var camera, index;
        if (event.charCode == '0'.charCodeAt(0)) {
          if (tileLayer.getFragmentShader() == bcFragmentShader) {
            bcFragmentShader.setBrightness(0);
            bcFragmentShader.setContrast(0);
            map.redraw();
          } else if (tileLayer.getFragmentShader() == hsFragmentShader) {
            hsFragmentShader.setHue(0);
            hsFragmentShader.setSaturation(0);
            map.redraw();
          }
        } else if (event.charCode == 'B'.charCodeAt(0)) {
          if (tileLayer.getFragmentShader() == bcFragmentShader) {
            bcFragmentShader.setBrightness(goog.math.clamp(
                bcFragmentShader.getBrightness() + 0.05, -1, 1));
            map.redraw();
          }
        } else if (event.charCode == 'C'.charCodeAt(0)) {
          if (tileLayer.getFragmentShader() == bcFragmentShader) {
            bcFragmentShader.setContrast(goog.math.clamp(
                bcFragmentShader.getContrast() + 0.05, -1, 1));
            map.redraw();
          }
        } else if (event.charCode == 'H'.charCodeAt(0)) {
          if (tileLayer.getFragmentShader() == hsFragmentShader) {
            hsFragmentShader.setHue(hsFragmentShader.getHue() + 0.05);
            map.redraw();
          }
        } else if (event.charCode == 'S'.charCodeAt(0)) {
          if (tileLayer.getFragmentShader() == hsFragmentShader) {
            hsFragmentShader.setSaturation(goog.math.clamp(
                hsFragmentShader.getSaturation() + 0.05, -1, 1));
            map.redraw();
          }
        } else if (event.charCode == 'b'.charCodeAt(0)) {
          if (tileLayer.getFragmentShader() == bcFragmentShader) {
            bcFragmentShader.setBrightness(goog.math.clamp(
                bcFragmentShader.getBrightness() - 0.05, -1, 1));
            map.redraw();
          }
        } else if (event.charCode == 'c'.charCodeAt(0)) {
          if (tileLayer.getFragmentShader() == bcFragmentShader) {
            bcFragmentShader.setContrast(goog.math.clamp(
                bcFragmentShader.getContrast() - 0.05, -1, 1));
            map.redraw();
          }
        } else if (event.charCode == 'f'.charCodeAt(0)) {
          var fragmentShader = tileLayer.getFragmentShader();
          index = goog.array.indexOf(fragmentShaders, fragmentShader);
          index = goog.math.modulo(index + 1, fragmentShaders.length);
          fragmentShader = fragmentShaders[index];
          tileLayer.setFragmentShader(fragmentShader);
        } else if (event.charCode == 'h'.charCodeAt(0)) {
          if (tileLayer.getFragmentShader() == hsFragmentShader) {
            hsFragmentShader.setHue(hsFragmentShader.getHue() - 0.05);
            map.redraw();
          }
        } else if (event.charCode == 'i'.charCodeAt(0)) {
          tileLayer.setInterimTiles(!tileLayer.getInterimTiles());
        } else if (event.charCode == 'l'.charCodeAt(0)) {
          if (!goog.isNull(tileLayer2)) {
            tileLayer2.setVisible(!tileLayer2.getVisible());
            map.redraw();
          }
        } else if (event.charCode == 'r'.charCodeAt(0)) {
          camera = map.getCamera();
          camera.setRotation(0);
          if (camera.isDirty()) {
            map.redraw();
          }
        } else if (event.charCode == 's'.charCodeAt(0)) {
          if (tileLayer.getFragmentShader() == hsFragmentShader) {
            hsFragmentShader.setSaturation(goog.math.clamp(
                hsFragmentShader.getSaturation() - 0.05, -1, 1));
            map.redraw();
          }
        } else if (event.charCode == 'u'.charCodeAt(0)) {
          camera = map.getCamera();
          camera.setRotation(camera.getRotation() + Math.PI);
          if (camera.isDirty()) {
            map.redraw();
          }
        } else if (event.charCode == 'v'.charCodeAt(0)) {
          var vertexShader = tileLayer.getVertexShader();
          index = goog.array.indexOf(vertexShaders, vertexShader);
          index = goog.math.modulo(index + 1, vertexShaders.length);
          vertexShader = vertexShaders[index];
          tileLayer.setVertexShader(vertexShader);
        }
      });

};
goog.exportSymbol('webglmaps.main', webglmaps.main);
