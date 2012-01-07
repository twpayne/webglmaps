<!doctype html>
<html>
        <head>
                <title>WebGL Maps Unit Tests</title>
        </head>
        <body>
                <ul>
%for key in sorted(tests.keys()):
                        <li><a href="{{ tests[key] }}">{{ key }}</a></li>
%end
                </ul>
        </body>
</html>
