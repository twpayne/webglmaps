To do
=====

User interface
--------------

* Zoom to/from mouse cursor


Functionality
-------------

* Add saturation control fragment shader


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

* Multi-level tile cache (Image and WebGLTexture)

* `TileQueue.reprioritize` should be identify when no prioritization is needed

* Use WebWorkers to manage tile cache


Architecture
------------

* Refactor :-)

* Add ICacheable interface and generic LRU cache


vim: set filetype=markdown spell spelllang=en textwidth=0:
