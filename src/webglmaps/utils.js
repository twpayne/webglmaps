goog.provide('webglmaps.utils');


/**
 * @see https://cvs.khronos.org/svn/repos/registry/trunk/public/webgl/sdk/demos/common/webgl-utils.js
 * @type {function(function(), Element)}
 */
window.myRequestAnimationFrame = (function() {
  return window.requestAnimationFrame ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame ||
         window.oRequestAnimationFrame ||
         window.msRequestAnimationFrame ||
         function(callback, element) {
           return window.setTimeout(callback, 1000 / 60);
         };
})();
