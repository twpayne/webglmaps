goog.provide('webglmaps.transitions');


/**
 * @typedef {function(number, number, number): number}
 */
webglmaps.transitions.TransitionFn;


/**
 * @param {number} base Base.
 * @param {number} diff Diff.
 * @param {number} delta Delta.
 * @return {number} Value.
 */
webglmaps.transitions.linear = function(base, diff, delta) {
  return base + delta * diff;
};


/**
 * @param {number} base Base.
 * @param {number} diff Diff.
 * @param {number} delta Delta.
 * @return {number} Value.
 */
webglmaps.transitions.pop = function(base, diff, delta) {
  return base + Math.sin(delta * Math.PI / 2) * diff;
};


/**
 * @param {number} base Base.
 * @param {number} diff Diff.
 * @param {number} delta Delta.
 * @return {number} Value.
 */
webglmaps.transitions.swing = function(base, diff, delta) {
  return base + 0.5 * (1 - Math.cos(delta * Math.PI)) * diff;
};
