// dailygraphic colors
var colors = {
    'red1': '#6C2315', 'red2': '#A23520', 'red3': '#D8472B', 'red4': '#E27560', 'red5': '#ECA395', 'red6': '#F5D1CA',
    'orange1': '#714616', 'orange2': '#AA6A21', 'orange3': '#E38D2C', 'orange4': '#EAAA61', 'orange5': '#F1C696', 'orange6': '#F8E2CA',
    'yellow1': '#77631B', 'yellow2': '#B39429', 'yellow3': '#EFC637', 'yellow4': '#F3D469', 'yellow5': '#F7E39B', 'yellow6': '#FBF1CD',
    'teal1': '#0B403F', 'teal2': '#11605E', 'teal3': '#17807E', 'teal4': '#51A09E', 'teal5': '#8BC0BF', 'teal6': '#C5DFDF',
    'blue1': '#28556F', 'blue2': '#3D7FA6', 'blue3': '#51AADE', 'blue4': '#7DBFE6', 'blue5': '#A8D5EF', 'blue6': '#D3EAF7'
};


//pointLocations is a global var with geojson dat
var mapLayer= L.geoJson(pointLocations, {
  style: pointLayerStyle,
  onEachFeature: onEachPoint,
  pointToLayer: function(feature,latlng){
    return L.marker(latlng, null); //null options.  used style instead
  }
});

//sets map to mountain view
var map = L.map('map', {
	scrollWheelZoom: false,
	layers: [mapLayer]
	}).setView([37.78, -122], 10);

L.tileLayer('http://api.tiles.mapbox.com/v4/nbclocal.l391gdl1/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibmJjbG9jYWwiLCJhIjoiS3RIUzNQOCJ9.le_LAljPneLpb7tBcYbQXQ', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.'
}).addTo(map);

//size function
//function getSize(d){
//	return d > 50520229 ? 30 :
//		d > 4994335.25 ? 25 :
//		d > 1797653 ? 20 :
//		d > 1101964.25 ? 15 :
//		10;	
//}


//layer style
function pointLayerStyle(feature) {
  return {
    radius: 6,
    fillColor: colors.orange3,
    color:"black",
    weight: 1.2,
    opacity: 1,
    fillOpacity: 0.8
  };
}

//bind click function to layer
function onEachPoint(feature, layer) {
	layer.on({
		click: clickToControl
	});
}

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
	var layer = e.target;
	// mapLayer.setStyle({color: "black"});
	// e.target.popup
	// layer.setStyle({color: "red", radius: 8, fillOpacity: 1}); //highlight color
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

	var buttons = '<div id="slide-control" class="buttons btn-group btn-group-justified"> <a class="slide-up btn btn-primary"><span class="glyphicon glyphicon-chevron-up"> </span></a> <a class="slide-down btn btn-primary"> <span class="glyphicon glyphicon-chevron-down"></span></a> </div>';
	var placeholder = '<div class="target-info"><h4><strong>Each dot is a well. Click for more info.</strong></h4></div>';

	var name = "feature.properties.operator";

	var url = "feature.properties.url";

	this._div.innerHTML = (data ? ('<div class="target-info"><p>This well is disposing its waste water into a clean aquifer protected by the EPA.</p><p> It is operated by ' + data[name] + ".</p><p>Check the Department of Conservation's " + '"Well Finder" has <a href="' + data[url] + '" target="_blank">for more info on this well.</a></p></div>' + buttons ) : placeholder + buttons);



	//have to put this function here or won't render right
	$(document).ready(function(){
		$(".slide-up").click(function(){
			$(".target-info").slideUp("slow");
		});

		$(".slide-down").click(function(){
			$(".target-info").slideDown("slow");
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

