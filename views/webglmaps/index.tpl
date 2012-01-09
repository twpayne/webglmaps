<!doctype html>
<html>
  <head>
    <link rel="stylesheet" href="static/webglmaps/webglmaps.css"/>
    <meta http-equiv="content-type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
%if debug:
    <script type="text/javascript" src="static/closure-library/closure/goog/base.js"></script>
    <script type="text/javascript" src="static/webglmaps/deps.js"></script>
    <script type="text/javascript">goog.require('webglmaps.main');</script>
%else:
    <script type="text/javascript">
%include webglmaps/js
    </script>
%end
    <title>WebGL Maps</title>
  </head>
  <body>
    <div id="mapDiv">
      <canvas id="map"></canvas>
    </div>
    <script type="text/javascript">
      webglmaps.main(document.getElementById('map'));
    </script>
  </body>
</html>
