goog.require('goog.events.BrowserEvent');
goog.require('goog.events.EventType');
goog.require('goog.vec.Vec3');

goog.provide('webglmaps.MouseNavigation');



/**
 * @constructor
 * @extends {goog.events.EventHandler}
 */
webglmaps.MouseNavigation = function() {

  goog.base(this, this);

  /**
   * @private
   * @type {webglmaps.Map}
   */
  this.map_ = null;

  /**
   * @private
   * @type {goog.vec.Vec3.Type}
   */
  this.previousPosition_ = goog.vec.Vec3.create();

  /**
   * @private
   * @type {boolean}
   */
  this.mouseDown_ = false;

};
goog.inherits(webglmaps.MouseNavigation, goog.events.EventHandler);


/**
 * @param {goog.events.BrowserEvent} event Event.
 */
webglmaps.MouseNavigation.prototype.handleMouseDown = function(event) {
  this.mouseDown_ = true;
  goog.vec.Vec3.setFromValues(
      this.previousPosition_, event.clientX, event.clientY, 0);
  this.map_.fromElementPixelToPosition(
      this.previousPosition_, this.previousPosition_);
};


/**
 * @param {goog.events.BrowserEvent} event Event.
 */
webglmaps.MouseNavigation.prototype.handleMouseMove = function(event) {
  if (this.mouseDown_) {
    var position = goog.vec.Vec3.createFromValues(
        event.clientX, event.clientY, 0);
    this.map_.fromElementPixelToPosition(position, position);
    var center = this.map_.getCenter();
    goog.vec.Vec3.subtract(center, position, center);
    goog.vec.Vec3.add(center, this.previousPosition_, center);
    this.map_.setCenter(center);
    goog.vec.Vec3.setFromValues(
        this.previousPosition_, event.clientX, event.clientY, 0);
    this.map_.fromElementPixelToPosition(
        this.previousPosition_, this.previousPosition_);
  }
};


/**
 * @param {goog.events.BrowserEvent} event Event.
 */
webglmaps.MouseNavigation.prototype.handleMouseOut = function(event) {
  this.mouseDown_ = false;
};


/**
 * @param {goog.events.BrowserEvent} event Event.
 */
webglmaps.MouseNavigation.prototype.handleMouseUp = function(event) {
  this.mouseDown_ = false;
};


/**
 * @param {webglmaps.Map} map Map.
 */
webglmaps.MouseNavigation.prototype.setMap = function(map) {
  this.removeAll();
  this.map_ = map;
  if (!goog.isNull(this.map_)) {
    var element = map.getElement();
    this.listen(element, goog.events.EventType.MOUSEDOWN, this.handleMouseDown);
    this.listen(element, goog.events.EventType.MOUSEMOVE, this.handleMouseMove);
    this.listen(element, goog.events.EventType.MOUSEOUT, this.handleMouseOut);
    this.listen(element, goog.events.EventType.MOUSEUP, this.handleMouseUp);
  }
};
