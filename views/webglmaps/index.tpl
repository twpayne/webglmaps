<!doctype html>
<html>
  <head>
%if debug:
    <link rel="stylesheet" href="static/webglmaps/webglmaps.css"/>
%else:
    <style>
%include webglmaps/css
    </style>
%end
    <meta http-equiv="content-type" content="text/html; charset=utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=Edge,chrome=1">
    <meta name="viewport" content="width=device-width, height=device-height, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no">
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
