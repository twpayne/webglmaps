goog.require('goog.dispose');
goog.require('goog.events');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');
goog.require('goog.math.Box');
goog.require('webglmaps.Program');
goog.require('webglmaps.Tile');
goog.require('webglmaps.TileCoord');
goog.require('webglmaps.TileUrl');

goog.provide('webglmaps.Layer');



/**
 * @constructor
 * @extends {goog.events.EventTarget}
 * @param {webglmaps.TileUrl} tileUrl Tile URL.
 * @param {number=} opt_minZ Min Z.
 * @param {number=} opt_maxZ Max Z.
 */
webglmaps.Layer = function(tileUrl, opt_minZ, opt_maxZ) {

  goog.base(this);

  /**
   * @type {WebGLRenderingContext}
   * @private
   */
  this.gl_ = null;

  /**
   * @type {Object.<number, ?number>}
   * @private
   */
  this.tileChangeListeners_ = {};

  /**
   * @private
   * @type {webglmaps.TileUrl}
   */
  this.tileUrl_ = tileUrl;

  /**
   * @private
   * @type {?number}
   */
  this.minZ_ = opt_minZ || null;

  /**
   * @private
   * @type {?number}
   */
  this.maxZ_ = opt_maxZ || null;

  /**
   * @private
   * @type {Object.<string, webglmaps.Tile>}
   */
  this.tiles_ = {};

};
goog.inherits(webglmaps.Layer, goog.events.EventTarget);


/**
 * @protected
 */
webglmaps.Layer.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
  goog.disposeAll(goog.object.getValues(this.tiles_));
  this.tiles_ = null;
};


/**
 * @param {webglmaps.TileCoord} tileCoord Tile coord.
 * @return {webglmaps.Tile} Tile.
 */
webglmaps.Layer.prototype.getTile = function(tileCoord) {
  if (!goog.isNull(this.minZ_) && tileCoord.z < this.minZ_) {
    return null;
  }
  if (!goog.isNull(this.maxZ_) && tileCoord.z > this.maxZ_) {
    return null;
  }
  var key = tileCoord.toString();
  if (goog.object.containsKey(this.tiles_, key)) {
    return this.tiles_[key];
  }
  var tile = new webglmaps.Tile(tileCoord, this.tileUrl_(tileCoord));
  tile.setGL(this.gl_);
  this.tileChangeListeners_[goog.getUid(tile)] = goog.events.listen(
      tile, goog.events.EventType.CHANGE, this.handleTileChange, false, this);
  this.tiles_[key] = tile;
  return tile;
};


/**
 * @param {webglmaps.TileCoord} tileCoord Tile coord.
 * @return {webglmaps.Tile} Tile.
 */
webglmaps.Layer.prototype.findInterimTile = function(tileCoord) {
  tileCoord = tileCoord.clone();
  var key, tile, tileLoadingState;
  while (tileCoord.z >= this.minZ_) {
    tileCoord.z -= 1;
    tileCoord.x = Math.floor(tileCoord.x / 2);
    tileCoord.y = Math.floor(tileCoord.y / 2);
    key = tileCoord.toString();
    if (goog.object.containsKey(this.tiles_, key)) {
      tile = this.tiles_[key];
      tileLoadingState = tile.getLoadingState();
      if (tileLoadingState == webglmaps.TileLoadingState.FADING_IN ||
          tileLoadingState == webglmaps.TileLoadingState.COMPLETE) {
        return tile;
      }
    }
  }
  return null;
};


/**
 * @param {webglmaps.Tile} tile Tile.
 */
webglmaps.Layer.prototype.handleTileChange = function(tile) {
  this.dispatchEvent(new goog.events.Event(goog.events.EventType.CHANGE, this));
};


/**
 * @param {number} time Time.
 * @param {webglmaps.Program} program Program.
 * @param {number} z Z.
 * @param {goog.math.Box} box Box.
 * @return {boolean} Animate?
 */
webglmaps.Layer.prototype.render = function(time, program, z, box) {
  /** @type {Object.<number, Object.<string, webglmaps.Tile>>} */
  var tilesToRender = {};
  var interimTile, zKey, tile, tileCoord, tileLoadingState, x, y;
  for (x = box.left; x <= box.right; ++x) {
    for (y = box.bottom; y <= box.top; ++y) {
      tileCoord = new webglmaps.TileCoord(z, x, y);
      tile = this.getTile(tileCoord);
      if (goog.isNull(tile)) {
        tileLoadingState = webglmaps.TileLoadingState.ERROR;
      } else {
        tileLoadingState = tile.getLoadingState();
      }
      if (tileLoadingState == webglmaps.TileLoadingState.FADING_IN ||
          tileLoadingState == webglmaps.TileLoadingState.COMPLETE) {
        zKey = tile.tileCoord.z.toString();
        if (!goog.object.containsKey(tilesToRender, zKey)) {
          tilesToRender[zKey] = {};
        }
        tilesToRender[zKey][tileCoord.toString()] = tile;
      }
      if (tileLoadingState == webglmaps.TileLoadingState.WAITING ||
          tileLoadingState == webglmaps.TileLoadingState.FADING_IN ||
          tileLoadingState == webglmaps.TileLoadingState.ERROR) {
        interimTile = this.findInterimTile(tileCoord);
        if (!goog.isNull(interimTile)) {
          zKey = interimTile.tileCoord.z.toString();
          if (!goog.object.containsKey(tilesToRender, zKey)) {
            tilesToRender[zKey] = {};
          }
          tilesToRender[zKey][interimTile.tileCoord.toString()] = interimTile;
        }
      }
    }
  }
  var tileZs = goog.object.getKeys(tilesToRender);
  goog.array.sort(tileZs, Number);
  var animate = false;
  goog.array.forEachRight(tileZs, function(tileZ) {
    goog.object.forEach(tilesToRender[tileZ], function(tile) {
      animate = tile.render(time, program, z) || animate;
    });
  });
  return animate;
};


/**
 * @param {WebGLRenderingContext} gl WebGL rendering context.
 */
webglmaps.Layer.prototype.setGL = function(gl) {
  this.gl_ = gl;
  goog.object.forEach(this.tiles_, function(tile) {
    tile.setGL(gl);
  });
};
