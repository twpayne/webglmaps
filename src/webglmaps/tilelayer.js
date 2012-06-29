goog.provide('webglmaps.TileLayer');

goog.require('goog.dispose');
goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');
goog.require('goog.object');
goog.require('webglmaps.Tile');
goog.require('webglmaps.TileUrl');
goog.require('webglmaps.shader.Fragment');
goog.require('webglmaps.shader.Vertex');



/**
 * @constructor
 */
webglmaps.TileLayerOptions = function() {
};


/**
 * @type {string|undefined}
 */
webglmaps.TileLayerOptions.prototype.crossDomain;


/**
 * @type {webglmaps.shader.Fragment|undefined}
 */
webglmaps.TileLayerOptions.prototype.fragmentShader;


/**
 * @type {boolean|undefined}
 */
webglmaps.TileLayerOptions.prototype.interimTiles;


/**
 * @type {?number}
 */
webglmaps.TileLayerOptions.prototype.maxZ;


/**
 * @type {number|undefined}
 */
webglmaps.TileLayerOptions.prototype.minZ;


/**
 * @type {webglmaps.shader.Vertex|undefined}
 */
webglmaps.TileLayerOptions.prototype.vertexShader;


/**
 * @type {boolean}
 */
webglmaps.TileLayerOptions.prototype.visible;



/**
 * @constructor
 * @extends {goog.events.EventTarget}
 * @param {webglmaps.TileUrl} tileUrl Tile URL.
 * @param {webglmaps.TileLayerOptions|Object=} opt_options Options.
 */
webglmaps.TileLayer = function(tileUrl, opt_options) {

  goog.base(this);

  var options = /** @type {webglmaps.TileLayerOptions} */ (opt_options || {});

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
   * @type {webglmaps.TileUrl}
   */
  this.tileUrl_ = tileUrl;

  /**
   * @private
   * @type {string}
   */
  this.crossDomain_ = options.crossDomain || '';

  /**
   * @private
   * @type {webglmaps.shader.Fragment}
   */
  this.fragmentShader_ = options.fragmentShader || null;

  /**
   * @private
   * @type {boolean}
   */
  this.interimTiles_ = options.interimTiles || true;

  /**
   * @private
   * @type {?number}
   */
  this.maxZ_ = options.maxZ || null;

  /**
   * @private
   * @type {?number}
   */
  this.minZ_ = options.minZ || 0;

  /**
   * @private
   * @type {webglmaps.shader.Vertex}
   */
  this.vertexShader_ = options.vertexShader || null;

  /**
   * @private
   * @type {boolean}
   */
  this.visible_ = goog.isDef(options.visible) ? options.visible : true;

  /**
   * @private
   * @type {Object.<webglmaps.TileCoord, webglmaps.Tile>}
   */
  this.tiles_ = {};

};
goog.inherits(webglmaps.TileLayer, goog.events.EventTarget);


/**
 * @protected
 */
webglmaps.TileLayer.prototype.dispatchChangeEvent = function() {
  this.dispatchEvent(new goog.events.Event(goog.events.EventType.CHANGE));
};


/**
 * @protected
 */
webglmaps.TileLayer.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
  goog.disposeAll(goog.object.getValues(this.tiles_));
  this.tiles_ = {};
};


/**
 * @param {webglmaps.TileCoord} tileCoord Tile coord.
 * @return {webglmaps.Tile} Tile.
 */
webglmaps.TileLayer.prototype.findInterimTile = function(tileCoord) {
  tileCoord = tileCoord.clone();
  var tile;
  while (tileCoord.z >= this.minZ_) {
    tileCoord.z -= 1;
    tileCoord.x = Math.floor(tileCoord.x / 2);
    tileCoord.y = Math.floor(tileCoord.y / 2);
    if (tileCoord in this.tiles_) {
      tile = this.tiles_[tileCoord];
      if (tile.isLoaded()) {
        return tile;
      }
    }
  }
  return null;
};


/**
 * @return {webglmaps.shader.Fragment} Fragment shader.
 */
webglmaps.TileLayer.prototype.getFragmentShader = function() {
  return this.fragmentShader_;
};


/**
 * @return {number} Last used time.
 */
webglmaps.TileLayer.prototype.getLastUsedTime = function() {
  return this.lastUsedTime_;
};


/**
 * @return {boolean} Interim tiles.
 */
webglmaps.TileLayer.prototype.getInterimTiles = function() {
  return this.interimTiles_;
};


/**
 * @param {webglmaps.TileCoord} tileCoord Tile coord.
 * @param {webglmaps.TileQueue} tileQueue Tile queue.
 * @return {webglmaps.Tile} Tile.
 */
webglmaps.TileLayer.prototype.getTile = function(tileCoord, tileQueue) {
  if (!goog.isNull(this.minZ_) && tileCoord.z < this.minZ_) {
    return null;
  }
  if (!goog.isNull(this.maxZ_) && tileCoord.z > this.maxZ_) {
    return null;
  }
  var tile;
  if (tileCoord in this.tiles_) {
    tile = this.tiles_[tileCoord];
  } else {
    tile = new webglmaps.Tile(
        tileCoord.clone(), this.tileUrl_(tileCoord), this.crossDomain_);
    goog.events.listenOnce(
        tile, goog.events.EventType.CHANGE, this.handleTileChange, false, this);
    goog.events.listenOnce(
        tile, goog.events.EventType.DROP, this.handleTileDrop, false, this);
    tile.setGL(this.gl_);
    goog.asserts.assert(!(tileCoord in this.tiles_));
    this.tiles_[tileCoord] = tile;
    tileQueue.enqueue(tile);
  }
  return tile;
};


/**
 * @return {webglmaps.shader.Vertex} Vertex shader.
 */
webglmaps.TileLayer.prototype.getVertexShader = function() {
  return this.vertexShader_;
};


/**
 * @return {boolean} Visible.
 */
webglmaps.TileLayer.prototype.getVisible = function() {
  return this.visible_;
};


/**
 * @param {goog.events.Event} event Event.
 */
webglmaps.TileLayer.prototype.handleTileChange = function(event) {
  var tile = /** @type {webglmaps.Tile} */ event.target;
  if (tile.getLastUsedTime() == this.lastUsedTime_) {
    this.dispatchChangeEvent();
  }
};


/**
 * @param {goog.events.Event} event Event.
 */
webglmaps.TileLayer.prototype.handleTileDrop = function(event) {
  var tile = /** @type {webglmaps.Tile} */ event.target;
  goog.asserts.assert(tile.tileCoord in this.tiles_);
  delete this.tiles_[tile.tileCoord];
  goog.dispose(tile);
};


/**
 * @param {webglmaps.shader.Fragment} fragmentShader Fragment shader.
 */
webglmaps.TileLayer.prototype.setFragmentShader = function(fragmentShader) {
  this.fragmentShader_ = fragmentShader;
  this.dispatchChangeEvent();
};


/**
 * @param {WebGLRenderingContext} gl GL.
 */
webglmaps.TileLayer.prototype.setGL = function(gl) {
  this.gl_ = gl;
  goog.object.forEach(this.tiles_, function(tile) {
    tile.setGL(gl);
  });
};


/**
 * @param {boolean} interimTiles Interim tiles.
 */
webglmaps.TileLayer.prototype.setInterimTiles = function(interimTiles) {
  if (this.interimTiles_ != interimTiles) {
    this.interimTiles_ = interimTiles;
    this.dispatchChangeEvent();
  }
};


/**
 * @param {number} usedTime Used time.
 */
webglmaps.TileLayer.prototype.setUsedTime = function(usedTime) {
  this.lastUsedTime_ = usedTime;
};


/**
 * @param {webglmaps.shader.Vertex} vertexShader Vertex shader.
 */
webglmaps.TileLayer.prototype.setVertexShader = function(vertexShader) {
  this.vertexShader_ = vertexShader;
  this.dispatchChangeEvent();
};


/**
 * @param {boolean} visible Visible.
 */
webglmaps.TileLayer.prototype.setVisible = function(visible) {
  this.visible_ = visible;
};
