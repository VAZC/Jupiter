var map;
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

    map.data.setStyle({
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#333333',
            fillOpacity: 0.8,
            strokeColor: '#666666',
            strokeOpacity: 0.5,
            scale: 8
        }
    });

    $.get('/json', function(result) {
        var stations = result;
        var stationsfc = [];
        for (var i = 0; i < result.length; i++) {
            console.log(result[i]);
            var point = turf.point([result[i].lon, result[i].lat]);
            stations[i].point = point;
            stationsfc.push(point);
            map.data.addGeoJson(point);
        };

        var tin = turf.tin(turf.featurecollection(stationsfc), 'elevation');
        console.log(tin);
        map.data.addGeoJson(tin);

        // jupiter.setStations(stations);
        // jupiter.calcBound();
    });
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