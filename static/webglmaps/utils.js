goog.provide('webglmaps.utils');


/**
 * @type {function(function(), Element)}
 */
webglmaps.utils.requestAnimationFrame = (function() {
  return window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      function(callback, element) {
        window.setTimeout(callback, 1000 / 60);
      };
})();
