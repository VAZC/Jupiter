var map;
var stations;
var myLocationMarker;
// var jupiter;
var defaultCenterLatLng = {
    lat: 25.047833423462535,
    lng: 121.51709318161011
};

var mapStyles = [{
    "featureType": "all",
    "elementType": "geometry",
    "stylers": [{
        "saturation": -100
    }, {
        "lightness": -8
    }, {
        "gamma": 1.18
    }]
}, {
   "featureType": "water",
   "elementType": "geometry",
   "stylers": [
     { "Hue": "#739CFF"},
     { "saturation": 30 }
     ]
}, {
    "featureType": "road.highway",
    "elementType": "all",
    "stylers": [{
        "Visibility": "off"
    }]
}];


function main() {
    console.log("centerLatLng");
    getLocation();
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(initMap, getLocationFail);
    } else {
        console.log("Geolocation is not support at this browser.");
    }
}

function getLocationFail(error) {
    console.log(error);
    initMap(null);
}

function initMap(position) {
    var centerLatLng;
    var infoWindow = new google.maps.InfoWindow({
        content: ""
    });
    if (position) {
        centerLatLng = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        }
    } else {
        centerLatLng = defaultCenterLatLng;
    }

    var styledMapType = new google.maps.StyledMapType(mapStyles, {
        name: "Styled Map"
    });

    map = new google.maps.Map(document.getElementById('map'), {
        center: centerLatLng,
        zoom: 14,
        mapTypeControlOptions: {
            mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
        }
    });
    map.mapTypes.set('map_style', styledMapType);
    map.setMapTypeId('map_style');

    myLocationMarker = new google.maps.Marker({
        position: centerLatLng,
        animation: google.maps.Animation.DROP,
        map: map
    });

    $.when($.get('/taiwan.geo.json'), $.get('/station')).then(function(points, result) {
        result = result[0];

        var oripoint = [];
        var stationsfc = [];
        stations = result;

        for (var i = 0; i < result.length; i++) {
            var rainfall = result[i].min_10;
            var mapData = new google.maps.Data();

            mapData.setStyle({
                icon: getWeatherStyle(rainfall)
            });
            mapData.addListener('click', function(e) {
                console.log(e);
                if (e.feature.getProperty('name')) {
                    var anchor = new google.maps.MVCObject();
                    anchor.set("position", e.latLng);
                    infoWindow.setContent(e.feature.getProperty('name') + '(' + e.feature.getProperty('station_id') + ')');
                    infoWindow.open(map, anchor);
                } else {
                    infoWindow.close();
                }

            });
            var point = turf.point([result[i].lon, result[i].lat], {
                name: result[i].locationName,
                station_id: result[i].stationId
            });
            oripoint.push([result[i].lon, result[i].lat]);

            stationsfc.push(point);
            mapData.addGeoJson(point);
            mapData.setMap(map);

            stations[i].point = point;
            stations[i].mapData = mapData;
        };

        var voronoi = d3.geom.voronoi();
        var vor_polygons = voronoi(oripoint);

        map.data.addGeoJson(points[0]);
        vor_polygons.forEach(function(element, index) {
            var rainfall = result[index].min_10;
            var mapData = new google.maps.Data();

            mapData.setStyle(getWeatherRegionStyle(rainfall));

            mapData.addGeoJson(ArrayToConvex(element));
            mapData.setMap(map);
        });
    });
}

function ArrayToConvex(e) {
    var boundfs = turf.featurecollection([
        turf.point([119.3135, 25.3]),
        turf.point([122.0180, 25.3]),
        turf.point([122.0180, 21.89]),
        turf.point([119.3135, 21.89])
    ]);
    var bound = turf.convex(boundfs);

    var tps = [];
    for (var i = 0; i < e.length; i++) {
        var p = e[i];
        tps.push(turf.point(p));
    }
    var fc = turf.featurecollection(tps);
    var convex = turf.convex(fc);
    return turf.intersect(bound, convex);
}

var weather10MinLevels = [
    {
        level: 1, interval: 0, color: '#FFFFFF'
    }, {
        level: 2, interval: 1, color: '#C8D6E1'
    }, {
        level: 3, interval: 2, color: '#89C0DA'
    }, {
        level: 4, interval: 3, color: '#65D97D'
    }, {
        level: 5, interval: 4, color: '#98FF72'
    }, {
        level: 6, interval: 6, color: '#DBF977'
    }, {
        level: 7, interval: 8, color: '#F2B950'
    }, {
        level: 8, interval: 10, color: '#D96941'
    }, {
        level: 9, interval: 12, color: '#CF323A'
    }, {
        level: 10, interval: 14, color: '#9F0909'
    }, {
        level: 11, interval: 16, color: '#9E0A38'
    }, {
        level: 12, interval: 18, color: '#A41441'
}];

function getWeather10MinLevel(rainfall) {
    var level = 1;
    if (rainfall < 0)
        return level;

    for (var i = 0; i < weather10MinLevels.length; ++i) {
        if (rainfall < weather10MinLevels[i].interval) {
            level = i;
            return level;
        }
    }

    level = weather10MinLevels.length;
    return level;
}

var DEFAULT_FILLCOLOR = '#888888';
var DEFAULT_STROKECOLOR = '#666666';

function getWeatherStyle(rainfall) {
    var level = getWeather10MinLevel(rainfall);
    var index = level - 1;

    style = {
        path: google.maps.SymbolPath.CIRCLE,
        fillOpacity: 0.8,
        fillColor: weather10MinLevels[index].color,
        strokeOpacity: 0.5,
        strokeColor: weather10MinLevels[index].color,
        scale: 6
    };

    return style;
}

function getWeatherRegionStyle(rainfall) {

    var level = getWeather10MinLevel(rainfall);
    var index = level - 1;
    style = {
        fillOpacity: (level == 1) ? 0 : 0.8,
        fillColor: weather10MinLevels[index].color,
        strokeWeight: 0
    };

    return style;
}
