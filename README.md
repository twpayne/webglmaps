WebGL Maps
==========

Version 0.1
Copyright &copy; Tom Payne, 2011


Quick Start
-----------

WebGL Maps is a weekend proof-of-concept project for learning WebGL and
demonstrating WebGL's application to web mapping.

To get started:

1. Edit the template in `static/webglmaps/main.js` to point to a suitable tile
   server.  The default configuration points to a TileCloud server running on
   port 8000 on `localhost`.

2. Run `make`.  This will build everything for you.

3. Make sure that you have [Bottle](http://bottlepy.org) and
   [Tornado](http://www.tornadoweb.org/) installed.  Create a `virtualenv` now
   if you haven't already.

4. Run `./main.py` and browse to <http://localhost:8080/?debug=1>.
