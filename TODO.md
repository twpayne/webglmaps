To do
=====

User interface
--------------

* Zoom to/from mouse cursor

* Fix shaky pan when animating


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

* Add view frustum culling (needs to take into account vertex shader transformations)

* Cut up interim tiles


Back end
--------

* Add ICacheable interface and generic LRU cache

* Multi-level tile cache (Image and WebGLTexture)

* Use WebWorkers to manage tile cache


Architecture
------------

* Render tiles to intermediate texture (render buffer) with wrapping and then draw with single call

* Refactor maps, layers and controls


vim: set filetype=markdown spell spelllang=en textwidth=0:
