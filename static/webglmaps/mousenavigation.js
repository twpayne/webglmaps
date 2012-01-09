goog.require('goog.events.BrowserEvent');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventType');
goog.require('goog.events.MouseWheelEvent');
goog.require('goog.events.MouseWheelHandler');
goog.require('goog.math');
goog.require('goog.vec.Vec3');

goog.provide('webglmaps.MouseNavigation');


/**
 * @enum {number}
 */
webglmaps.MouseNavigationState = {
  NONE: 0,
  PANNING: 1
};



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
   * @type {number}
   */
  this.rotationStep_ = Math.PI / 180;

  /**
   * @private
   * @type {number}
   */
  this.zoomStep_ = 0.25;

  /**
   * @private
   * @type {webglmaps.MouseNavigationState}
   */
  this.state_ = webglmaps.MouseNavigationState.NONE;

};
goog.inherits(webglmaps.MouseNavigation, goog.events.EventHandler);


/**
 * @param {goog.events.BrowserEvent} event Event.
 */
webglmaps.MouseNavigation.prototype.handleMouseDown = function(event) {
  if (event.isMouseActionButton()) {
    this.state_ = webglmaps.MouseNavigationState.PANNING;
    goog.vec.Vec3.setFromValues(
        this.previousPosition_, event.clientX, event.clientY, 0);
    this.map_.fromElementPixelToPosition(
        this.previousPosition_, this.previousPosition_);
  }
};


/**
 * @param {goog.events.BrowserEvent} event Event.
 */
webglmaps.MouseNavigation.prototype.handleMouseMove = function(event) {
  if (this.state_ == webglmaps.MouseNavigationState.PANNING) {
    event.preventDefault();
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
  if (this.state_ != webglmaps.MouseNavigationState.NONE) {
    event.preventDefault();
    this.state_ = webglmaps.MouseNavigationState.NONE;
  }
};


/**
 * @param {goog.events.BrowserEvent} event Event.
 */
webglmaps.MouseNavigation.prototype.handleMouseUp = function(event) {
  if (this.state_ != webglmaps.MouseNavigationState.NONE) {
    event.preventDefault();
    this.state_ = webglmaps.MouseNavigationState.NONE;
  }
};


/**
 * @param {goog.events.MouseWheelEvent} event Event.
 */
webglmaps.MouseNavigation.prototype.handleMouseWheel = function(event) {
  event.preventDefault();
  if (event.deltaX !== 0) {
    var rotation = this.map_.getRotation();
    rotation -= goog.math.sign(event.deltaX) * this.rotationStep_;
    this.map_.setRotation(rotation);
  }
  if (event.deltaY !== 0) {
    var zoom = this.map_.getZoom();
    zoom -= goog.math.sign(event.deltaY) * this.zoomStep_;
    this.map_.setZoom(zoom);
  }
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
    this.listen(
        new goog.events.MouseWheelHandler(element),
        goog.events.MouseWheelHandler.EventType.MOUSEWHEEL,
        this.handleMouseWheel);
  }
};
