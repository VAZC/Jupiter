var map;
var myLocationMarker;
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
        for (var i = 0; i < result.length; i++) {
            console.log(result[i]);
            var point = turf.point([result[i].lon, result[i].lat]);
            map.data.addGeoJson(point);
        };
    });
}
