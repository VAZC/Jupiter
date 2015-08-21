var map;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 25.1348,
            lng: 121.7321
        },
        zoom: 8
    });
}