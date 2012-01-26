goog.provide('webglmaps.TileVertices');

goog.require('goog.webgl');
goog.require('webglmaps.ArrayBuffer');



/**
 * @constructor
 * @param {WebGLRenderingContext} gl GL.
 * @extends {webglmaps.ArrayBuffer}
 * @param {webglmaps.TileCoord} tileCoord Tile coord.
 */
webglmaps.TileVertices = function(gl, tileCoord) {

  goog.base(this, gl);

  var n = 1 << tileCoord.z;
  var x = tileCoord.x, y = n - tileCoord.y - 1;
  var vertices = [
    x / n, y / n, 0, 1,
    (x + 1) / n, y / n, 1, 1,
    x / n, (y + 1) / n, 0, 0,
    (x + 1) / n, (y + 1) / n, 1, 0
  ];
  this.data(new Float32Array(vertices), goog.webgl.STATIC_DRAW);

};
goog.inherits(webglmaps.TileVertices, webglmaps.ArrayBuffer);
