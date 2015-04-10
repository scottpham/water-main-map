$(document).ready(function() {

    $('#button').click(function() {
        if (screenfull.enabled) {
            screenfull.toggle();
            console.log("Screenfull not enabled, request sent");
        } else {
            alert("Sorry, full screen isn't allowed by your browser.")
            console.log("Screenfull not enabled");
        }
    });

    $("#geocoder").geocodify({
        //configure
        onSelect: function(data) {
            regionBias: 'US'
            var lat = data.geometry.location.k,
                lon = data.geometry.location.D;
            // change view and zoom
            map.setView([lat, lon], 17);

            updatePipes();
            // add marker
            //check to see if a marker already exists
            if (typeof(marker) === 'undefined') {
                //make a new marker
                marker = new L.marker([lat, lon]);
                marker.addTo(map);
            } else {
                //otherwise, reset the old marker
                marker.setLatLng([lat, lon]);
            }
        }
    });
});


//colors for map
var colors = colorbrewer.Purples[7];
//pointLocations is a global var with geojson dat
var mapLayer = L.geoJson(pointLocations, {
    onEachFeature: onEachPoint
        // ,
        // pointToLayer: L.mapbox.marker.style
});

//sets map to east bay
var map = L.map('map', {
    scrollWheelZoom: false
        // ,
        // layers: [mapLayer] (this happens in a function updatePipes() )
}).setView([37.80995, -122.26938], 16);



L.tileLayer('http://api.tiles.mapbox.com/v4/nbclocal.l391gdl1/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibmJjbG9jYWwiLCJhIjoiS3RIUzNQOCJ9.le_LAljPneLpb7tBcYbQXQ', {
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.'
}).addTo(map);

function updatePipes() {

        $('.leaflet-marker-pane img').not(':first').remove();

        // get boundaries of map
        var bounds = map.getBounds();
        var SE = [(bounds.getSouthEast()).lat, (bounds.getSouthEast()).lng];
        var SW = [(bounds.getSouthWest()).lat, (bounds.getSouthWest()).lng];
        var NE = [(bounds.getNorthEast()).lat, (bounds.getNorthEast()).lng];
        var NW = [(bounds.getNorthWest()).lat, (bounds.getNorthWest()).lng];

        var polygon = turf.polygon([
            [
                [SE[0], SE[1]],
                [SW[0], SW[1]],
                [NE[0], NE[1]],
                [NW[0], NW[1]],
                [SE[0], SE[1]]
            ]
        ]);

        var boxCoords = [NW[0], NW[1], SE[0], SE[1]];

        // variable is a feature collection of points that are within bounds
        var within = turf.featurecollection(pointLocations.features.filter(function(points) {
            var geom = points.geometry.coordinates;

            if (geom[0] < boxCoords[3] && geom[0] > boxCoords[1] && geom[1] < boxCoords[0] && geom[1] > boxCoords[2]) {
                return true;
            }
        }));

        //create a mapbox layer out of pints that are within bounds
        var thisLayer = L.geoJson(within, {
            onEachFeature: onEachPoint
        });

        // actually add layer
        thisLayer.addTo(map);
    }
    // this function draws the points
updatePipes();

//bind click function to layer
function onEachPoint(feature, layer) {
    layer.on({
        mouseover: clickToControl
    });


    feature.properties['marker-size'] = 'small';
    //color logic goes here

    var age = feature.properties['age'];

    switch (true) {
        case age > 100:
            feature.properties["marker-color"] = colors[6];
            break;
        case age > 80:
            feature.properties['marker-color'] = colors[5];
            break;
        case age > 60:
            feature.properties['marker-color'] = colors[4];
            break;
        case age > 40:
            feature.properties['marker-color'] = colors[3];
            break;
        case age > 20:
            feature.properties['marker-color'] = colors[2];
            break;
        default:
            feature.properties['marker-color'] = colors[1];
    }

    //layerstyles won't work without this
    layer.setIcon(L.mapbox.marker.icon(feature.properties));
}

// reset points when state changes:
map.on('dragend moveend', function(e) {
    // var center = map.getCenter();
    // marker.setLatLng(center);
    updatePipes();
});
map.on('zoomend', function(e) {
    updatePipes();
});


//begin control code//
var info = L.control();

info.onAdd = function(map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

//listeners

//sends click event to update control
function clickToControl(e) {
    // console.log(e.target.feature);
    info.update(e.target);
}

// Cribbed from http://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
function numberWithCommas(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

//updating the control
info.update = function(data) {

    // var buttons = '<div id="slide-control" class="buttons btn-group btn-group-justified"> <a class="btn btn-primary"><span class="glyphicon glyphicon-chevron-up"> </span></a> </div></div>';

    var buttons = "</div>"

    var placeholder = '<div><h4><strong>Hover over a pin for more info.</strong></h4></p>';

    // var priority = data.feature.properties.Priority;

    // console.log(priority);

    this._div.innerHTML = (data ? ('<div class="target-info"><p><strong>Location: </strong>' + data.feature.properties.address + 
        '</p><p><strong>Leak Date: </strong>' + 
        data.feature.properties['finish_date'] + 
        '</p><p><strong>Pipe Material: </strong>' + 
        data.feature.properties['material'] + 
        '</p><p class="leak-text"><strong>Date Built:  </strong><div class="priority" style="background-color:' + 
        data.feature.properties["marker-color"] + '"><span class="priority-text">' + 
        data.feature.properties['year_installed'] + '</span>' +
         buttons) : placeholder + buttons);


    //have to put this function here or won't render right
    $(document).ready(function() {
        $("#slide-control").click(function() {
            $(".target-info").slideToggle("fast").toggleClass("hidden");
            $(this).find('span').toggleClass("glyphicon-chevron-down");
        });
    });
};

info.addTo(map);

// helper function
function findlocation(e) {
    console.log("The lat and long is " + e.latlng);
}

//instantiate helper finder function
map.on('click', findlocation);