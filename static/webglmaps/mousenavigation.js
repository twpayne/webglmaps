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
  PANNING: 1,
  ROTATING: 2
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
   * @type {Element}
   */
  this.element_ = null;

  /**
   * @private
   * @type {number}
   */
  this.initialRotation_ = 0;

  /**
   * @private
   * @type {goog.vec.Vec3.Type}
   */
  this.previousPixel_ = goog.vec.Vec3.create();

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
   * @type {number}
   */
  this.zoomPeriod_ = 250;

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
  if (!event.isMouseActionButton()) {
    return;
  }
  if (event.shiftKey) {
    this.state_ = webglmaps.MouseNavigationState.ROTATING;
    var angle = Math.atan2(
        this.element_.height / 2 - event.clientY,
        event.clientX - this.element_.width / 2);
    this.initialRotation_ = this.map_.getRotation() - angle;
  } else {
    this.state_ = webglmaps.MouseNavigationState.PANNING;
  }
  event.preventDefault();
  goog.vec.Vec3.setFromValues(
      this.previousPixel_, event.clientX, event.clientY, 0);
  this.map_.fromElementPixelToPosition(
      this.previousPixel_, this.previousPosition_);
};


/**
 * @param {goog.events.BrowserEvent} event Event.
 */
webglmaps.MouseNavigation.prototype.handleMouseMove = function(event) {
  if (this.state_ == webglmaps.MouseNavigationState.NONE) {
    return;
  }
  event.preventDefault();
  var pixel = goog.vec.Vec3.createFromValues(
      event.clientX, event.clientY, 0);
  var position = goog.vec.Vec3.create();
  this.map_.fromElementPixelToPosition(pixel, position);
  if (this.state_ == webglmaps.MouseNavigationState.PANNING) {
    var center = this.map_.getCenter();
    goog.vec.Vec3.subtract(center, position, center);
    goog.vec.Vec3.add(center, this.previousPosition_, center);
    this.map_.setCenter(center);
  } else if (this.state_ == webglmaps.MouseNavigationState.ROTATING) {
    var angle = Math.atan2(
        this.element_.height / 2 - event.clientY,
        event.clientX - this.element_.width / 2);
    this.map_.setRotation(this.initialRotation_ + angle);
  }
  goog.vec.Vec3.setFromArray(this.previousPixel_, pixel);
  this.map_.fromElementPixelToPosition(pixel, this.previousPosition_);
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
  if (event.deltaY !== 0) {
    var zoom = this.map_.getTargetZoom();
    zoom -= goog.math.sign(event.deltaY) * this.zoomStep_;
    this.map_.setZoom(zoom, this.zoomPeriod_);
  }
};


/**
 * @param {webglmaps.Map} map Map.
 */
webglmaps.MouseNavigation.prototype.setMap = function(map) {
  this.removeAll();
  this.map_ = map;
  if (goog.isNull(this.map_)) {
    this.element_ = null;
  } else {
    this.element_ = map.getElement();
    this.listen(
        this.element_, goog.events.EventType.MOUSEDOWN, this.handleMouseDown);
    this.listen(
        this.element_, goog.events.EventType.MOUSEMOVE, this.handleMouseMove);
    this.listen(
        this.element_, goog.events.EventType.MOUSEOUT, this.handleMouseOut);
    this.listen(
        this.element_, goog.events.EventType.MOUSEUP, this.handleMouseUp);
    this.listen(
        new goog.events.MouseWheelHandler(this.element_),
        goog.events.MouseWheelHandler.EventType.MOUSEWHEEL,
        this.handleMouseWheel);
  }
};
