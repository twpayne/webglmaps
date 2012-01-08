#!/usr/bin/env python

from glob import glob
import os.path
import re

import bottle


@bottle.route('/')
@bottle.view('index')
def index():
    return dict(debug=bottle.request.GET.get('debug'))


@bottle.route('/static/<path:re:.*>')
def static(path):
    return bottle.static_file(path, root=os.path.join(os.path.dirname(__file__), 'static'))


@bottle.route('/tests')
@bottle.view('tests/index')
def test_index():
    tests = dict((re.match(r'\b(\w+)_test.html', os.path.basename(filename)).group(1), filename) for filename in glob(os.path.join(os.path.dirname(__file__), 'static', 'tests', '*_test.html')))
    return dict(tests=tests)


@bottle.route('/webglmaps')
@bottle.view('webglmaps/index')
def webglmaps_index():
    return dict(debug=bottle.request.GET.get('debug'))


if __name__ == '__main__':
    bottle.DEBUG = True
    bottle.run(reloader=True, server='tornado')
