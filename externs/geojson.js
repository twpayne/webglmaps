/*
 *  Copyright (C) 2011  Tom Payne (twpayne@gmail.com)
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */


/**
 * @fileoverview Externs for GeoJSON.
 * @see http://geojson.org/geojson-spec.html
 * @externs
 */



/**
 * @constructor
 */
var GeoJSONCRS = function() {};


/**
 * @type {string}
 */
GeoJSONCRS.prototype.type;


/**
 * @type {Object.<string, *>}
 */
GeoJSONCRS.prototype.properties;



/**
 * @constructor
 */
var GeoJSONGeometry = function() {};


/**
 * @type {string}
 */
GeoJSONGeometry.prototype.type;


/**
 * @type {Array.<number>|Array.<Array.<number>>}
 */
GeoJSONGeometry.prototype.coordinates;



/**
 * @constructor
 */
var GeoJSONFeature = function() {};


/**
 * @type {string}
 */
GeoJSONFeature.prototype.type;


/**
 * @type {GeoJSONGeometry}
 */
GeoJSONFeature.prototype.geometry;


/**
 * @type {Object.<string, *>}
 */
GeoJSONFeature.prototype.properties;



/**
 * @constructor
 */
var GeoJSONFeatureCollection = function() {};


/**
 * @type {string}
 */
GeoJSONFeatureCollection.prototype.type;


/**
 * @type {Array.<GeoJSONFeature>}
 */
GeoJSONFeatureCollection.prototype.features;


/**
 * @type {Array.<number>}
 */
GeoJSONFeatureCollection.prototype.bbox;


/**
 * @type {GeoJSONCRS}
 */
GeoJSONFeatureCollection.prototype.crs;


/**
 * @type {Object.<string, *>}
 */
GeoJSONFeatureCollection.prototype.properties;
