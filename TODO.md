To do
=====

User interface
--------------

* Zoom to/from mouse cursor


Functionality
-------------

* Per-layer shaders

* Add saturation control fragment shader

* Dynamic shader switching

* Vertex shader special effects


Portability
-----------

* Handle loss of GL context


Quality
-------

* Fix tile seams (requires careful design of blending between image tiles and clear color)

* Fix precision problems at high zoom levels (might require different projections at different zoom levels)

* `Layer.findInterimTile` should also search lower down the pyramid for small zoom level differences

* Fix white flash observed when loading JPEG tiles


Performance
-----------

* Add view frustum culling

* Cut up interim tiles

* Use arrays for tile coords (like `goog.vec.Vec3`)

* Implement and use `goog.vec.Vec2`

* Request animation frame earlier in `Map.render_` (


Back end
--------

* Expire LRU tiles

* Multi-level tile cache (Image and WebGLTexture)

* `TileQueue.reprioritize` should be identify 

* Use WebWorkers to manage tile cache


Architecture
------------

* Refactor :-)


Open questions
--------------

* Should vertex buffers be managed by the map?


vim: set filetype=markdown spell spelllang=en textwidth=0:
