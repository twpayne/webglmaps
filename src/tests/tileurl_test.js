goog.require('goog.functions');
goog.require('goog.testing.jsunit');
goog.require('webglmaps.TileCoord');
goog.require('webglmaps.tileurl');

function testFromTemplate() {
  var tileUrl = webglmaps.tileurl.fromTemplate('{z}/{x}/{y}');
  var tileCoord = new webglmaps.TileCoord(1, 2, 3);
  assertEquals(tileUrl(tileCoord), '1/2/3');
}

function testFromTileUrls() {
  var tileUrls = [
    goog.functions.constant('a'),
    goog.functions.constant('b'),
    goog.functions.constant('c')
  ];
  var tileUrl = webglmaps.tileurl.fromTileUrls(tileUrls);
  assertEquals(tileUrl(new webglmaps.TileCoord(1, 0, 0)), 'a');
  assertEquals(tileUrl(new webglmaps.TileCoord(1, 0, 1)), 'b');
  assertEquals(tileUrl(new webglmaps.TileCoord(1, 1, 0)), 'c');
  assertEquals(tileUrl(new webglmaps.TileCoord(1, 1, 1)), 'a');
}
