WebGL Maps
==========

Version 0.1
Copyright &copy; Tom Payne, 2012


Quick Start
-----------

WebGL Maps is a weekend proof-of-concept project for learning WebGL and demonstrating WebGL's application to web mapping.

To get started:

1. Create and activate a [virtualenv](http://pypi.python.org/pypi/virtualenv):

        virtualenv .
        . bin/activate

2. Install the Python dependencies:

        pip install bottle tornado

3. Run `make`.  This will download the JavaScript dependencies and build everything for you.

4. Run `./main.py` and browse to <http://localhost:8080/webglmaps>.


Developer's Guide
-----------------

WebGL Maps development happens at <https://github.com/twpayne/webglmaps>.


### Dependencies

WebGL Maps depends on the [Closure Library](http://code.google.com/closure/library/), and is designed to be built with the [Closure Compiler](http://code.google.com/closure/compiler).

Code should be written according to the [Google JavaScript Style Guide](http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml) and checked with the [Closure Linter](http://code.google.com/closure/utilities/).

The development web server uses [Bottle](http://bottlepy.org) and [Tornado](http://www.tornadoweb.org/).

### Building

The project is built with [GNU Make](http://www.gnu.org/software/make/).  Several useful targets are defined:

* `make all` (the default) downloads the JavaScript dependencies, builds everything, and runs `gjslint` on the source code.

* `make lint` just runs `gjslint` on the source code.

* `make debug` runs the minimum necessary to run WebGL Maps in non-compiled mode.  This is necessary when you modify `goog.require` or `goog.provide` statements.

* `make compiled` runs the minimum necessary to run WebGL Maps in compiled mode.  This invokes the Closure Compiler, which can take some time to run.

* `make update` updates the all the Closure dependencies (compiler, library and linter) to their very latest versions.  WebGL Maps should not depend on any specific version of these dependencies, so this should be safe to run at any time.

### Development

It is usually faster and easier to develop with the uncompiled version.  This version is served by the development server at <http://localhost:8080/webglmaps?debug=1>.  Normally, there is no need to re-run `make`, the development server reloads JavaScript and template files automatically.  However, if you modify `goog.require` or `goog.provides` statements then you should run `make debug` to ensure that `static/webglmaps/deps.js` is up-to-date.

During development you should regularly run `make` to invoke the compiler and linter.  Warnings from the compiler or linter should be considered as errors and fixed before committing.

### Unit tests

Unit tests are current run through the browser.  Navigate to <http://localhost:8080/tests?debug=1>.  The list of tests is calculated automatically by scanning the contents of the `static/tests` directory.


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
