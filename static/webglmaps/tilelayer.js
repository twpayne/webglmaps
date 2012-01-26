goog.provide('webglmaps.TileLayer');

goog.require('goog.dispose');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.object');
goog.require('goog.webgl');
goog.require('webglmaps.EventTargetGLObject');
goog.require('webglmaps.Framebuffer');
goog.require('webglmaps.LayerHelper');
goog.require('webglmaps.Tile');
goog.require('webglmaps.TileLayerHelper');
goog.require('webglmaps.TileUrl');
goog.require('webglmaps.shader.Fragment');
goog.require('webglmaps.shader.Vertex');
goog.require('webglmaps.transitions');


/**
 * @const
 * @type {number}
 */
webglmaps.TILE_FADE_IN_PERIOD = 100;


/**
 * @const
 * @type {webglmaps.transitions.TransitionFn}
 */
webglmaps.TILE_FADE_IN_TRANSITION = webglmaps.transitions.splat;



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
 * @type {number|undefined}
 */
webglmaps.TileLayerOptions.prototype.tileSize;


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
 * @extends {webglmaps.EventTargetGLObject}
 * @param {webglmaps.TileUrl} tileUrl Tile URL.
 * @param {webglmaps.TileLayerOptions|Object=} opt_options Options.
 */
webglmaps.TileLayer = function(tileUrl, opt_options) {

  goog.base(this);

  var options = /** @type {webglmaps.TileLayerOptions} */ (opt_options || {});

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
  this.interimTiles_ = options.interimTiles || false; // FIXME true

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
   * @type {number}
   */
  this.tileSize_ = options.tileSize || 256;

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

  /**
   * @private
   * @type {webglmaps.Framebuffer}
   */
  this.framebuffer_ = new webglmaps.Framebuffer(this.tileSize_);

};
goog.inherits(webglmaps.TileLayer, webglmaps.EventTargetGLObject);


/**
 * @protected
 */
webglmaps.TileLayer.prototype.dispatchChangeEvent = function() {
  this.dispatchEvent(new goog.events.Event(goog.events.EventType.CHANGE));
};


/**
 * @param {webglmaps.TileCoord} tileCoord Tile coord.
 * @private
 * @return {webglmaps.Tile} Tile.
 */
webglmaps.TileLayer.prototype.findInterimTile_ = function(tileCoord) {
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
 * @return {webglmaps.Framebuffer} Framebuffer.
 */
webglmaps.TileLayer.prototype.getFramebuffer = function() {
  return this.framebuffer_;
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
 * @private
 * @return {webglmaps.Tile} Tile.
 */
webglmaps.TileLayer.prototype.getTile_ = function(tileCoord, tileQueue) {
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
    tile.setGL(this.gl);
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
 * @param {webglmaps.LayerHelper} layerHelper Layer helper.
 * @param {webglmaps.TileLayerHelper} tileLayerHelper Tile layer helper.
 * @return {boolean} Animate?
 */
webglmaps.TileLayer.prototype.render = function(layerHelper, tileLayerHelper) {
  layerHelper.setShaders(this.fragmentShader_, this.vertexShader_);
  var tileBounds = tileLayerHelper.getTileBounds();
  this.setUsedTime(layerHelper.getTime());
  var maxDimension = Math.max(tileBounds.getWidth(), tileBounds.getHeight());
  var n = 1;
  // FIXME use a better methood for finding next power of two
  while (n < maxDimension) {
    n *= 2;
  }
  this.n_ = n;
  this.framebuffer_.setSize(n * this.tileSize_);
  this.framebuffer_.bind();
  if (this.interimTiles_) {
    return this.renderWithInterimTiles_(layerHelper, tileLayerHelper);
  } else {
    return this.renderWithoutInterimTiles_(layerHelper, tileLayerHelper);
  }
};


/**
 * @param {webglmaps.LayerHelper} layerHelper Layer helper.
 * @param {webglmaps.TileLayerHelper} tileLayerHelper Tile layer helper.
 * @return {boolean} Animate?
 * @private
 */
webglmaps.TileLayer.prototype.renderWithInterimTiles_ =
    function(layerHelper, tileLayerHelper) {
  goog.asserts.assert(false);
  return false;
};


/**
 * @param {webglmaps.LayerHelper} layerHelper Layer helper.
 * @param {webglmaps.TileLayerHelper} tileLayerHelper Tile layer helper.
 * @return {boolean} Animate?
 * @private
 */
webglmaps.TileLayer.prototype.renderWithoutInterimTiles_ =
    function(layerHelper, tileLayerHelper) {
  var gl = this.getGL();
  var animate = false;
  var program = layerHelper.getProgram();
  var tileQueue = tileLayerHelper.getTileQueue();
  var time = layerHelper.getTime();
  var tileBounds = tileLayerHelper.getTileBounds();
  tileBounds.forEach(function(tileCoord, i, j) {
    var tile = this.getTile_(tileCoord, tileQueue);
    if (!goog.isNull(tile)) {
      tile.setUsedTime(time);
      if (tile.isLoaded()) {
        var alpha;
        var timeSinceFirstUsed = time - tile.getFirstUsedTime();
        if (timeSinceFirstUsed < webglmaps.TILE_FADE_IN_PERIOD) {
          alpha = webglmaps.TILE_FADE_IN_TRANSITION(
              0, 1, timeSinceFirstUsed / webglmaps.TILE_FADE_IN_PERIOD);
          animate = true;
        } else {
          alpha = 1;
        }
        tile.texture.bind();
        tileLayerHelper.bindTileVertices(this.n_, i, j);
        program.position.pointer(2, goog.webgl.FLOAT, false, 16, 0);
        program.texCoord.pointer(2, goog.webgl.FLOAT, false, 16, 8);
        gl.activeTexture(goog.webgl.TEXTURE0);
        program.textureUniform.set1i(0);
        program.alphaUniform.set1f(alpha);
        gl.drawArrays(goog.webgl.TRIANGLE_STRIP, 0, 4);
      }
    }
  }, this);
  return animate;
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
  goog.disposeAll(goog.object.getValues(this.tiles_));
  this.tiles_ = {};
  goog.base(this, 'setGL', gl);
  this.framebuffer_.setGL(gl);
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
