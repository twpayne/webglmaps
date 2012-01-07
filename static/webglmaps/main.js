goog.require('goog.debug.Console');
goog.require('goog.debug.LogManager');
goog.require('goog.debug.Logger');
goog.require('goog.debug.Logger.Level');
goog.require('webglmaps.Map');

goog.provide('webglmaps.main');


/**
 * @param {Element} element Element.
 */
webglmaps.main = function(element) {

  if (!goog.debug.Console.instance) {
    goog.debug.Console.instance = new goog.debug.Console();
  }
  goog.debug.Console.instance.setCapturing(true);

  if (goog.DEBUG) {
    goog.debug.LogManager.getRoot().setLevel(goog.debug.Logger.Level.ALL);
  }

  var map = new webglmaps.Map(element, {});

};
goog.exportSymbol('webglmaps.main', webglmaps.main);
