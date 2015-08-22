var map;
var stations;
var myLocationMarker;
// var jupiter;
var defaultCenterLatLng = {
    lat: 25.047833423462535,
    lng: 121.51709318161011
};

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
    if (position) {
        centerLatLng = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        }
    } else {
        centerLatLng = defaultCenterLatLng;
    }

    map = new google.maps.Map(document.getElementById('map'), {
        center: centerLatLng,
        zoom: 13
    });

    myLocationMarker = new google.maps.Marker({
        position: centerLatLng,
        animation: google.maps.Animation.DROP,
        map: map
    });

    $.get('/json', function(result) {
        stations = result;
        var stationsfc = [];
        for (var i = 0; i < result.length; i++) {
            var rainfall = result[i].weatherElement.MIN_10;

            var mapData = new google.maps.Data();

            mapData.setStyle({
                icon: getWeatherStyle(rainfall)
            });

            var point = turf.point([result[i].lon, result[i].lat]);
            stationsfc.push(point);
            mapData.addGeoJson(point);
            mapData.setMap(map);

            stations[i].point = point;
            stations[i].mapData = mapData;
        };

        var tin = turf.tin(turf.featurecollection(stationsfc), 'elevation');
        //console.log(tin);
        map.data.addGeoJson(tin);

        // jupiter.setStations(stations);
        // jupiter.calcBound();
    });
}

var weather10MinLevels = [
    {
        level: 1, interval: 0, color: '#FFFFFF'
    }, {
        level: 2, interval: 1, color: '#F2F2F2'
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

// function Jupiter() {
//     // private
//     var that = this;
//     var stations;

//     // public
//     this.setStations = setStations;
//     this.getStations = getStations;
//     this.getFilterGeoStations = getFilterGeoStations;
//     this.calcBound = calcBound;

//     function setStations(s) {
//         stations = s;
//     }

//     function getStations() {
//         return stations;
//     }

//     function getGeoStations(station) {
//         var geoStations = [];

//         for (var i = 0; i < stations.length; i++) {
//             if (!station && station === stations[i])
//                 continue;

//             geoStations.push(stations[i].point);
//         }

//         return geoStations;
//     }

//     function getFilterGeoStations(station) {
//         return getGeoStations(stations.filter(function(obj) {
//             return obj !== station;
//         }));
//     }

//     function calcBound() {
//         for (var i = 0; i < stations.length; i++) {
//             var filterGeoStations = getFilterGeoStations();
//             var current = stations[i];
//             current.nextpoint = turf.nearest(current.point, filterGeoStations);
//         }

        // for (var i = 0; i < stations.length; i++) {
        //     var current = stations[i];
        //     var current.nextpoint = current;
        //     current.nextpoint.dis = Number.MAX_SAFE_INTEGER;

        //     for (var j = 0; j < station.length; j++) {
        //         if (i === j) continue;
        //         var nextpoint = stations[j];

        //         var dis = turf.distance(current.point, nextpoint.point, 'kilometers');
        //         if (dis < current.nextpoint.dis) {
        //             current.nextpoint = nextpoint;
        //             current.nextpoint.dis = dis;
        //         }
        //     }
        // }
//     }

//     function paintBoundArea() {

//     }
// }