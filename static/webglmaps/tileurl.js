goog.provide('webglmaps.TileUrl');
goog.provide('webglmaps.tileurl');

goog.require('goog.math');
goog.require('webglmaps.TileCoord');


/**
 * @typedef {function(webglmaps.TileCoord): string}
 */
webglmaps.TileUrl;


/**
 * @param {string} template Template.
 * @return {webglmaps.TileUrl} Tile URL.
 */
webglmaps.tileurl.fromTemplate = function(template) {
  return goog.partial(function(template, tileCoord) {
    return template.replace(/\{z\}/, tileCoord.z)
                   .replace(/\{x\}/, tileCoord.x)
                   .replace(/\{y\}/, tileCoord.y);
  }, template);
};


/**
 * @param {Array.<webglmaps.TileUrl>} tileUrls Tile URLs.
 * @return {webglmaps.TileUrl} Tile URL.
 */
webglmaps.tileurl.fromTileUrls = function(tileUrls) {
  return goog.partial(function(tileUrls, tileCoord) {
    return tileUrls[goog.math.modulo(tileCoord.hash(),
                                     tileUrls.length)](tileCoord);
  }, tileUrls);
};
