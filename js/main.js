
$(document).ready(function(){


$("#geocoder").geocodify({
    //configure
    onSelect: function(data){
        regionBias: 'US'
        var lat = data.geometry.location.k,
            lon = data.geometry.location.D;
        // change view and zoom
        map.setView([lat,lon], 16);
        // add marker
        //check to see if a marker already exists
        if(typeof(marker) === 'undefined'){
            //make a new marker
            marker = new L.marker([lat, lon]);
            marker.addTo(map);
        }
        else{
            //otherwise, reset the old marker
            marker.setLatLng([lat,lon]);
        }
    }});
});

// dailygraphic colors
var colors = {
    'red1': '#6C2315', 'red2': '#A23520', 'red3': '#D8472B', 'red4': '#E27560', 'red5': '#ECA395', 'red6': '#F5D1CA',
    'orange1': '#714616', 'orange2': '#AA6A21', 'orange3': '#E38D2C', 'orange4': '#EAAA61', 'orange5': '#F1C696', 'orange6': '#F8E2CA',
    'yellow1': '#77631B', 'yellow2': '#B39429', 'yellow3': '#EFC637', 'yellow4': '#F3D469', 'yellow5': '#F7E39B', 'yellow6': '#FBF1CD',
    'teal1': '#0B403F', 'teal2': '#11605E', 'teal3': '#17807E', 'teal4': '#51A09E', 'teal5': '#8BC0BF', 'teal6': '#C5DFDF',
    'blue1': '#28556F', 'blue2': '#3D7FA6', 'blue3': '#51AADE', 'blue4': '#7DBFE6', 'blue5': '#A8D5EF', 'blue6': '#D3EAF7'
};

// //loop over json data
// $.each(pointLocations, function(){
//   $.each(this, function(k,v){
//     // v.properties['marker-color'] = 'maroon';
//     console.log(v.properties.Bldg);
//   });
// });

//pointLocations is a global var with geojson dat
var mapLayer= L.geoJson(pointLocations, {
  onEachFeature: onEachPoint
  // ,
  // pointToLayer: L.mapbox.marker.style
});

//sets map to mountain view
var map = L.map('map', {
	scrollWheelZoom: false,
	layers: [mapLayer]
	}).setView([37.79, -122.21], 14);

L.tileLayer('http://api.tiles.mapbox.com/v4/nbclocal.l391gdl1/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibmJjbG9jYWwiLCJhIjoiS3RIUzNQOCJ9.le_LAljPneLpb7tBcYbQXQ', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.'
}).addTo(map);


//bind click function to layer
function onEachPoint(feature, layer) {
	layer.on({
		mouseover: clickToControl
	});

  var colors = ['#ffffd4', '#fed98e', '#fe9929', '#d95f0e', '#993404'];
  feature.properties['marker-size'] = 'small';
  //color logic goes here

  var age = 2015 - feature.properties['Year Installed'];

  switch (true){
    case age > 100:
      feature.properties["marker-color"] = colors[4];
      break;
    case age > 80: 
      feature.properties['marker-color'] = colors[3];
      break;
    case age > 60: 
      feature.properties['marker-color'] = colors[2];
      break;
    case age > 40: 
      feature.properties['marker-color'] = colors[1];
      break;
    case age > 30: 
      feature.properties['marker-color'] = colors[0];
      break;
  }

  //layerstyles won't work without this
  layer.setIcon(L.mapbox.marker.icon(feature.properties));
}

// mapLayer.setIcon(L.mapbox.marker.icon(feature.properties));
  

//begin control code//
var info = L.control();

info.onAdd = function (map) {
  this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
	this.update();
	return this._div;
};


//listeners

//sends click event to update control
function clickToControl(e) {
	console.log(e.target.feature);
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

  var colors = ['#ffffd4', '#fed98e', '#fe9929', '#d95f0e', '#993404'];

	var buttons = '<div id="slide-control" class="buttons btn-group btn-group-justified"> <a class="btn btn-primary"><span class="glyphicon glyphicon-chevron-up"> </span></a> </div>';

	var placeholder = '<div class="target-info"><h4><strong>Hover over a pin for more info.</strong></h4></div>';

  // var priority = data.feature.properties.Priority;

  // console.log(priority);

	this._div.innerHTML = (data ? ('<div class="target-info"><p><strong>Location: </strong>' + data.feature.properties.Street + ' at ' + data.feature.properties['Cross Street'] + '</p><p><strong>Leak Date: </strong>' + data.feature.properties['Created On'] + '</p><p><strong>Pipe Material: </strong>' + data.feature.properties['Pipe Material'] + '</p><p class="leak-text"><strong>Date Built: </strong><div class="priority" style="background-color:' + colors[data.feature.properties.Priority - 1] + '"><span class="priority-text">' + data.feature.properties['Year Installed'] + '</span></div></p></div>' + buttons ) : placeholder + buttons);


	//have to put this function here or won't render right
	$(document).ready(function(){
		$("#slide-control").click(function(){
			$(".target-info").slideToggle("fast").toggleClass("hidden");
      $(this).find('span').toggleClass("glyphicon-chevron-down", "hidden");
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

