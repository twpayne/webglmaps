goog.provide('webglmaps.PointLayer');

goog.require('goog.Uri');
goog.require('goog.Uri.QueryData');
goog.require('goog.events.Event');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');
goog.require('goog.net.EventType');
goog.require('goog.net.XhrIo');
goog.require('webglmaps.ArrayBuffer');
goog.require('webglmaps.feature.Point');
goog.require('webglmaps.geojson');



/**
 * @constructor
 * @extends {goog.events.EventTarget}
 * @param {string} url URL.
 */
webglmaps.PointLayer = function(url) {

  goog.base(this);

  /**
   * @private
   * @type {WebGLRenderingContext}
   */
  this.gl_ = null;

  /**
   * @private
   * @type {number}
   */
  this.lastUsedTime_ = 0;

  /**
   * @private
   * @type {webglmaps.shader.Fragment}
   */
  this.fragmentShader_ = null;

  /**
   * @private
   * @type {webglmaps.shader.Vertex}
   */
  this.vertexShader_ = null;

  /**
   * @private
   * @type {boolean}
   */
  this.visible_ = true;

  /**
   * @private
   * @type {goog.Uri}
   */
  this.uri_ = new goog.Uri(url);

  /**
   * @private
   * @type {goog.net.XhrIo}
   */
  this.xhrio_ = null;

  /**
   * @private
   * @type {Array.<webglmaps.feature.Point>}
   */
  this.features_ = [];

  /**
   * @private
   * @type {webglmaps.ArrayBuffer}
   */
  this.arrayBuffer_ = null;

};
goog.inherits(webglmaps.PointLayer, goog.events.EventTarget);


/**
 */
webglmaps.PointLayer.prototype.bind = function() {
  var gl = this.gl_;
  goog.asserts.assert(!goog.isNull(gl));
  if (goog.isNull(this.arrayBuffer_)) {
    this.arrayBuffer_ = new webglmaps.ArrayBuffer(gl);
    var verticies = [];
    goog.array.forEach(this.features_, function(feature) {
      var size = 0.0000001;
      verticies.push(
          feature.coordinates[0] - size,
          feature.coordinates[1] - size,
          feature.coordinates[0] + size,
          feature.coordinates[1] - size,
          feature.coordinates[0] - size,
          feature.coordinates[1] + size,
          feature.coordinates[0] - size,
          feature.coordinates[1] + size,
          feature.coordinates[0] + size,
          feature.coordinates[1] - size,
          feature.coordinates[0] + size,
          feature.coordinates[1] + size);
    });
    this.arrayBuffer_.data(new Float32Array(verticies), goog.webgl.STATIC_DRAW);
  } else {
    this.arrayBuffer_.bind();
  }
};


/**
 * @protected
 */
webglmaps.PointLayer.prototype.dispatchChangeEvent = function() {
  this.dispatchEvent(new goog.events.Event(goog.events.EventType.CHANGE));
};


/**
 * @return {Array.<webglmaps.feature.Point>} Features.
 */
webglmaps.PointLayer.prototype.getFeatures = function() {
  return this.features_;
};


/**
 * @return {webglmaps.shader.Fragment} Fragment shader.
 */
webglmaps.PointLayer.prototype.getFragmentShader = function() {
  return this.fragmentShader_;
};


/**
 * @return {number} Last used time.
 */
webglmaps.PointLayer.prototype.getLastUsedTime = function() {
  return this.lastUsedTime_;
};


/**
 * @return {webglmaps.shader.Vertex} Vertex shader.
 */
webglmaps.PointLayer.prototype.getVertexShader = function() {
  return this.vertexShader_;
};


/**
 * @return {boolean} Visible.
 */
webglmaps.PointLayer.prototype.getVisible = function() {
  return this.visible_;
};


/**
 * @private
 */
webglmaps.PointLayer.prototype.onComplete_ = function() {
  if (this.xhrio_.getLastErrorCode() == goog.net.ErrorCode.NO_ERROR) {
    var responseJson = this.xhrio_.getResponseJson();
    if (goog.isDefAndNotNull(responseJson)) {
      this.features_ = webglmaps.geojson.getPointFeatures(
          (/** @type {GeoJSONFeatureCollection} */ responseJson));
      window.console.log('loaded ' + this.features_.length + ' points');
      if (!goog.isNull(this.arrayBuffer_)) {
        goog.dispose(this.arrayBuffer_);
        this.arrayBuffer_ = null;
      }
    }
    this.dispatchChangeEvent();
  }
};


/**
 * @param {number} zoom Zoom.
 * @param {Array.<number>} bbox Bounding box.
 */
webglmaps.PointLayer.prototype.request = function(zoom, bbox) {
  if (!goog.isNull(this.xhrio_) && this.xhrio_.isActive()) {
    this.xhrio_.abort();
    if (this.xhrio_.isActive()) { // FIXME why does this happen?
      this.xhrio_ = null;
    }
  }
  if (goog.isNull(this.xhrio_)) {
    this.xhrio_ = new goog.net.XhrIo();
    goog.events.listen(this.xhrio_, goog.net.EventType.COMPLETE,
        this.onComplete_, false, this);
  }
  var queryData = new goog.Uri.QueryData();
  queryData.set('zoom', zoom);
  queryData.set('bbox', bbox.join(','));
  this.uri_.setQueryData(queryData);
  this.xhrio_.send(this.uri_.toString());
  window.console.log(this.uri_.toString());
};


/**
 * @param {webglmaps.shader.Fragment} fragmentShader Fragment shader.
 */
webglmaps.PointLayer.prototype.setFragmentShader = function(fragmentShader) {
  this.fragmentShader_ = fragmentShader;
  this.dispatchChangeEvent();
};


/**
 * @param {WebGLRenderingContext} gl GL.
 */
webglmaps.PointLayer.prototype.setGL = function(gl) {
  this.gl_ = gl;
  if (!goog.isNull(this.arrayBuffer_)) {
    goog.dispose(this.arrayBuffer_);
    this.arrayBuffer_ = null;
  }
};


/**
 * @param {number} usedTime Used time.
 */
webglmaps.PointLayer.prototype.setUsedTime = function(usedTime) {
  this.lastUsedTime_ = usedTime;
};


/**
 * @param {webglmaps.shader.Vertex} vertexShader Vertex shader.
 */
webglmaps.PointLayer.prototype.setVertexShader = function(vertexShader) {
  this.vertexShader_ = vertexShader;
  this.dispatchChangeEvent();
};


/**
 * @param {boolean} visible Visible.
 */
webglmaps.PointLayer.prototype.setVisible = function(visible) {
  this.visible_ = visible;
};
