goog.require('goog.dispose');
goog.require('goog.events');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');
goog.require('webglmaps.Program');
goog.require('webglmaps.Tile');
goog.require('webglmaps.TileCoord');
goog.require('webglmaps.TileQueue');
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
   * @private
   * @type {number}
   */
  this.lastFrameIndex_ = 0;

  /**
   * @type {webglmaps.TileQueue}
   * @private
   */
  this.tileQueue_ = null;

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

  /**
   * @private
   * @type {boolean}
   */
  this.interimTiles_ = true;

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
    return (/** @type {webglmaps.Tile} */
        goog.object.get(this.tiles_, key));
  }
  var tile = new webglmaps.Tile(
      tileCoord, this.tileUrl_(tileCoord), this.tileQueue_);
  tile.setGL(this.gl_);
  goog.events.listen(
      tile, goog.events.EventType.DROP, this.handleTileDrop, false, this);
  goog.events.listen(
      tile, goog.events.EventType.CHANGE, this.handleTileChange, false, this);
  goog.object.add(this.tiles_, key, tile);
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
      tile = /** @type {webglmaps.Tile} */
          goog.object.get(this.tiles_, key);
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
 * @param {goog.events.Event} event Event.
 */
webglmaps.Layer.prototype.handleTileChange = function(event) {
  var tile = /** @type {webglmaps.Tile} */ event.target;
  if (tile.getLastFrameIndex() == this.lastFrameIndex_) {
    this.dispatchEvent(new goog.events.Event(goog.events.EventType.CHANGE));
  }
};


/**
 * @param {goog.events.Event} event Event.
 */
webglmaps.Layer.prototype.handleTileDrop = function(event) {
  var tile = (/** @type {webglmaps.Tile} */ event.target);
  var key = tile.tileCoord.toString();
  goog.asserts.assert(goog.object.containsKey(this.tiles_, key));
  goog.object.remove(this.tiles_, key);
  goog.dispose(tile);
};


/**
 * @param {number} frameIndex Frame index.
 * @param {number} time Time.
 * @param {webglmaps.Program} program Program.
 * @param {number} tileZoom Tile zoom.
 * @param {number} x0 X0.
 * @param {number} y0 Y0.
 * @param {number} x1 X1.
 * @param {number} y1 Y1.
 * @return {boolean} Animate?
 */
webglmaps.Layer.prototype.render = function(
    frameIndex, time, program, tileZoom, x0, y0, x1, y1) {
  this.lastFrameIndex_ = frameIndex;
  var animate = false;
  var tile, tileCoord, tileLoadingState, x, y;
  if (this.interimTiles_) {
    /** @type {Object.<string, Object.<string, webglmaps.Tile>>} */
    var tilesToRender = {};
    var interimTile, zKey;
    for (x = x0; x <= x1; ++x) {
      for (y = y0; y <= y1; ++y) {
        tileCoord = new webglmaps.TileCoord(tileZoom, x, y);
        tile = this.getTile(tileCoord);
        if (goog.isNull(tile)) {
          tileLoadingState = webglmaps.TileLoadingState.ERROR;
        } else {
          zKey = tile.tileCoord.z.toString();
          if (!goog.object.containsKey(tilesToRender, zKey)) {
            tilesToRender[zKey] = {};
          }
          tilesToRender[zKey][tileCoord.toString()] = tile;
          tileLoadingState = tile.getLoadingState();
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
    var tileZooms = goog.object.getKeys(tilesToRender);
    goog.array.sort(tileZooms, Number);
    goog.array.forEachRight(tileZooms, function(tileZoom) {
      goog.object.forEach(tilesToRender[tileZoom], function(tile) {
        animate = tile.render(frameIndex, time, program, tileZoom) || animate;
      });
    });
  } else {
    for (x = x0; x <= x1; ++x) {
      for (y = y0; y <= y1; ++y) {
        tileCoord = new webglmaps.TileCoord(tileZoom, x, y);
        tile = this.getTile(tileCoord);
        if (!goog.isNull(tile)) {
          tileLoadingState = tile.getLoadingState();
          if (tileLoadingState == webglmaps.TileLoadingState.FADING_IN ||
              tileLoadingState == webglmaps.TileLoadingState.COMPLETE) {
            animate = tile.render(frameIndex, time, program, tileZoom) ||
                animate;
          }
        }
      }
    }
  }
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


/**
 * @param {webglmaps.TileQueue} tileQueue Tile queue.
 */
webglmaps.Layer.prototype.setTileQueue = function(tileQueue) {
  this.tileQueue_ = tileQueue;
};
