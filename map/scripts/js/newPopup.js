let map;

window.onload = function() {
    map = L.map('map').setView([51.505, -0.09], 13);

    map.on('click', function(e) {
        let popup = L.popup()
            .setLatLng(e.latlng)
            .setContent(document.getElementById('mapPopup').innerHTML)
            .openOn(map);
    });

    document.getElementById('addNote').addEventListener('click', function() {
        let note = document.getElementById('mapNote').value;
        localStorage.setItem('mapNote', note);
    });
};