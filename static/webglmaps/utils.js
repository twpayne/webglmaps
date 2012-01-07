goog.provide('webglmaps.utils');


/**
 * @param {function()} callback Callback.
 * @param {Element} element Element.
 * @private
 */
webglmaps.utils.requestAnimationFrame_ = function(callback, element) {
  window.setTimeout(callback, 1000 / 60);
};


/**
 * @type {function(function(), Element)}
 */
webglmaps.utils.requestAnimationFrame =
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    webglmaps.utils.requestAnimationFrame_;
