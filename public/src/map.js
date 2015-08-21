var map;
var myLocationMarker;
var defaultCenterLatLng = {
    lat: 22.38,
    lng: 120.17
};

function main() {
    console.log("centerLatLng");
    getLocation();
    initMap();
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
}