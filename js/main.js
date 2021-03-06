$(document).ready(function() {

  $("#geocoder").geocodify({
    //configure
    onSelect: function(data) {
      var lat = data.geometry.location.A,
        lon = data.geometry.location.F,
        newLocation = [lat, lon];

      // console.log(newLocation);
      // change view and zoom

      map.setView(newLocation, 15);

      // call pipe loading function
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
    },
    regionBias: "US"
  });
});

// SLIDER
$('#slider').noUiSlider({
  start: [2010, 2014],
  step: 1,
  orientation: "vertical",
  connect: true,
  range: {
    'min': 2010,
    'max': 2014
  }
});

$('#slider').noUiSlider_pips({
  mode: 'steps'
});

// set globals
var range,
  lower,
  upper;

function getSliderVals() {
  range = $('#slider').val();
  lower = range[0];
  upper = range[1];
  console.log(range);
}

getSliderVals();

$('#slider').on({
  'change': function() {
    getSliderVals();
    updatePipes();
  }
});

//colors for map
var colors = colorbrewer.Purples[7];
//pointLocations is a global var with geojson dat

//sets map to east bay
var map = L.map('map', {
  scrollWheelZoom: false,
  minZoom: 14
}).setView([37.80995, -122.26938], 15);

L.tileLayer('http://tile.stamen.com/terrain/{z}/{x}/{y}.jpg', {
  attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.'
}).addTo(map);

// FULLSCREEN
L.control.fullscreen().addTo(map);

// Repopulates map with points
function updatePipes() {

  $('.leaflet-marker-pane img').not(':first').remove();
  // remove shadow left by locating marker
  $('.leaflet-shadow-pane img').remove();

  // get boundaries of map
  var bounds = map.getBounds();
  var SE = [(bounds.getSouthEast()).lat, (bounds.getSouthEast()).lng];
  var SW = [(bounds.getSouthWest()).lat, (bounds.getSouthWest()).lng];
  var NE = [(bounds.getNorthEast()).lat, (bounds.getNorthEast()).lng];
  var NW = [(bounds.getNorthWest()).lat, (bounds.getNorthWest()).lng];

  // create bounding box
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

  //create a mapbox layer out of points that are within bounds
  var thisLayer = L.geoJson(within, {
    filter: myFilter,
    onEachFeature: onEachPoint
  });

  // actually add layer
  thisLayer.addTo(map);
}
// this function draws the points
updatePipes();

// My filter
function myFilter(feature) {
  if (feature.properties.year >= lower && feature.properties.year <= upper) {
    return true;
  } else {
    return false;
  }
}

//bind click function to layer
function onEachPoint(feature, layer) {
  layer.on({
    mouseover: hoverToControl,
    click: clickToControl
  });

  feature.properties['marker-size'] = 'small';
  //color logic goes here

  var age = feature.properties.age;

  switch (true) {
    // Color by age
    case age == "Unknown":
      feature.properties["marker-color"] = "#898989";
      feature.properties.year_installed = "Unknown";
      break;
    case age > 100:
      feature.properties['marker-color'] = colors[6];
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

// get center data
function getCenter() {
  var center = map.getCenter();
  var zoom = map.getZoom();
  console.log("setView([" + center.lat + ", " + center.lng + "], " + zoom + ")");
}

// reset points when state changes:
map.on('moveend', function(e) {
  getCenter();
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

//sends hover event to update control
function hoverToControl(e) {
  info.update(e.target);
}

function clickToControl(e) {
  console.log(e.target.feature.properties);
}

//updating the control
info.update = function(data) {

  var buttons = "</div>";

  var placeholder = '<div><h4><strong>Hover over a pin for more info.</strong></h4></p>';

  this._div.innerHTML = (data ? ('<div class="target-info"><p><strong>Location: </strong></p><p>' + data.feature.properties.address +
    '</p><p><strong>Leak Date: </strong></p>' +
    data.feature.properties['finish_date'] +
    '</p><p><strong>Pipe Material: </strong></p>' +
    data.feature.properties['material'] +
    '</p><p class="leak-text"><strong>Date Built: </strong><div class="priority" style="background-color:' +
    data.feature.properties["marker-color"] +
    '"><span class="priority-text">' +
    data.feature.properties['year_installed'] + '</span></div>' +
    buttons) : placeholder + buttons);
};

info.addTo(map);

// helper function
function findlocation(e) {
  console.log("The lat and long is " + e.latlng);
}

//instantiate helper finder function
map.on('click', findlocation);
