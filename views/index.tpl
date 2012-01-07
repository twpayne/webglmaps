<!doctype html>
<html>
	<head>
		<title>WebGL Maps</title>
	</head>
	<body>
		<ul>
			<li><a href="webglmaps{{ '?debug=1' if debug else '' }}">WebGL Maps</a></li>
%if debug:
			<li><a href="tests">Unit tests</a></li>
%end
		</ul>
	</body>
</html>
