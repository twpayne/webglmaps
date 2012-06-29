WebGL Maps
==========

Version 0.1
Copyright &copy; Tom Payne, 2012


Quick Start
-----------

For a live demo, go to <http://dev.camptocamp.com/files/tpayne/webglmaps.html>.

The following controls are available:

* Mouse drag: pan.

* Mouse wheel: zoom in/out.

* Shift+mouse drag mouse: rotate.

* `u`: flip map upside down.

* `r`: reset rotation.

* `i`: toggle interim tiles on or off.

* `f`: cycle fragment shader (image processing effects).  Available effects are: none, brightness/contrast, grayscale, invert, hue/saturation, hexagonalize, pop art.  While on the hue/saturation effect you can use `h`/`H` to decrease/increase hue, `s`/`S` to decrease/increase saturation, and `0` to reset the hue and saturation to their default values.  Similarly `b`/`B` and `c`/`C` change brightness and contrast when on that shader, `0` resets.

* `v`: cycle vertex shader (transformation effects).  Available effects are: none, simple stretch, and wobble.


Introduction
------------

WebGL Maps is a weekend proof-of-concept project for learning WebGL and demonstrating WebGL's application to web mapping.

To get started run `make`.  This will download the dependencies and build everything for you.  Then open `webglmaps.html` in your web browser.


Developer's Guide
-----------------

WebGL Maps development happens at <https://github.com/twpayne/webglmaps>.


### Dependencies

WebGL Maps depends on the [Closure Library](http://code.google.com/closure/library/), and is designed to be built with the [Closure Compiler](http://code.google.com/closure/compiler).

Code should be written according to the [Google JavaScript Style Guide](http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml) and checked with the [Closure Linter](http://code.google.com/closure/utilities/).

### Building

The project is built with [GNU Make](http://www.gnu.org/software/make/) and the [Plovr](http://plovr.com) build tool.  Several useful targets are defined:

* `make all` (the default) downloads the dependencies, builds everything, and runs `gjslint` on the source code.

* `make lint` just runs `gjslint` on the source code.

* `make webglmaps.js` runs the minimum necessary to run WebGL Maps in compiled mode.  This invokes the Closure Compiler, which can take some time to run.

* `make serve` runs the Plovr server, necessary for development and debugging.

### Development

It is usually faster and easier to develop with the uncompiled version.  Start the Plovr server with `make serve` and then open `webglmaps-debug.html`.

During development you should regularly run `make lint` to invoke the linter.  Warnings from the compiler or linter should be considered as errors and fixed before committing.

### Unit tests

Unit tests are current run through the browser.  Navigate to <http://localhost:9810/> and click on "Test runner".


Useful links
------------

* Check that your web browser is compatible with WebGL: <http://get.webgl.org>.

* WebGL specification: <http://www.khronos.org/registry/webgl/specs/latest/>


Licence
=======

WebGL Maps - 2D maps with WebGL prototype
Copyright (C) 2012 Tom Payne <twpayne@gmail.com>

This program is free software: you can redistribute it and/or modify it under
the terms of the GNU Affero General Public License as published by the Free
Software Foundation, either version 3 of the License, or (at your option) any
later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE.  See the GNU Affero General Public License for more
details.

You should have received a copy of the GNU Affero General Public License along
with this program.  If not, see <http://www.gnu.org/licenses/>.


vim: set spell spelllang=en textwidth=0:
