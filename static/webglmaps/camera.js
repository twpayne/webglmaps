goog.provide('webglmaps.Camera');

goog.require('goog.vec.Mat4');
goog.require('goog.vec.Vec3');



/**
 * @constructor
 */
webglmaps.Camera = function() {

  /**
   * @private
   * @type {goog.vec.Vec3.Float32}
   */
  this.center_ = goog.vec.Vec3.createFloat32FromValues(0.5, 0.5, 0);

  /**
   * @private
   * @type {number}
   */
  this.zoom_ = 0;

  /**
   * @private
   * @type {number}
   */
  this.rotation_ = 0;

  /**
   * @private
   * @type {goog.vec.Mat4.Float32}
   */
  this.matrix_ = goog.vec.Mat4.createFloat32();

  /**
   * @private
   * @type {boolean}
   */
  this.matrixNeedsUpdate_ = true;

  /**
   * @private
   * @type {boolean}
   */
  this.dirty_ = true;

};


/**
 * @param {goog.vec.Vec3.Float32=} opt_result Result.
 * @return {!goog.vec.Vec3.Float32} Center.
 */
webglmaps.Camera.prototype.getCenter = function(opt_result) {
  if (goog.isDefAndNotNull(opt_result)) {
    goog.vec.Vec3.setFromArray(opt_result, this.center_);
    return opt_result;
  } else {
    return goog.vec.Vec3.cloneFloat32(this.center_);
  }
};


/**
 * @return {number} Rotation.
 */
webglmaps.Camera.prototype.getRotation = function() {
  return this.rotation_;
};


/**
 * @return {goog.vec.Mat4.Float32} Matrix.
 */
webglmaps.Camera.prototype.getMatrix = function() {
  if (this.matrixNeedsUpdate_) {
    var m = this.matrix_;
    goog.vec.Mat4.makeIdentity(m);
    goog.vec.Mat4.scale(m, Math.pow(2, this.zoom_), Math.pow(2, this.zoom_), 1);
    goog.vec.Mat4.rotate(m, this.rotation_, 0, 0, 1);
    goog.vec.Mat4.translate(m, -this.center_[0], -this.center_[1], 0);
    this.matrixNeedsUpdate_ = false;
  }
  return this.matrix_;
};


/**
 * @return {number} Tile zoom.
 */
webglmaps.Camera.prototype.getTileZoom = function() {
  return Math.ceil(this.zoom_ - 0.5);
};


/**
 * @return {number} Rotation.
 */
webglmaps.Camera.prototype.getZoom = function() {
  return this.zoom_;
};


/**
 * @return {boolean} Is dirty?
 */
webglmaps.Camera.prototype.isDirty = function() {
  return this.dirty_;
};


/**
 * @param {goog.vec.Vec3.AnyType} center Center.
 */
webglmaps.Camera.prototype.setCenter = function(center) {
  if (!goog.vec.Vec3.equals(this.center_, center)) {
    goog.vec.Vec3.setFromArray(this.center_, center);
    this.dirty_ = true;
    this.matrixNeedsUpdate_ = true;
  }
};


/**
 * @param {boolean} dirty Dirty.
 */
webglmaps.Camera.prototype.setDirty = function(dirty) {
  this.dirty_ = dirty;
};


/**
 * @param {number} rotation Rotation.
 */
webglmaps.Camera.prototype.setRotation = function(rotation) {
  if (this.rotation_ != rotation) {
    this.rotation_ = rotation;
    this.dirty_ = true;
    this.matrixNeedsUpdate_ = true;
  }
};


/**
 * @param {number} zoom Zoom.
 */
webglmaps.Camera.prototype.setZoom = function(zoom) {
  zoom = Math.max(zoom, 0);
  if (this.zoom_ != zoom) {
    this.zoom_ = zoom;
    this.dirty_ = true;
    this.matrixNeedsUpdate_ = true;
  }
};
