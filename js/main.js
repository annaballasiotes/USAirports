// 1. Create a map object.
var mymap = L.map('map', {
    center: [37.75, -95.71],
    zoom: 5,
    maxZoom: 10,
    minZoom: 3,
    detectRetina: true});

// 2. Add a base map.
L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png').addTo(mymap);

// 3. Add airports GeoJSON Data
var airports = null;

// 4. build up a set of colors from colorbrewer's dark2 category
var colors = chroma.scale('Paired').mode('lch').colors(3);

// 5. dynamically append style classes to this page. This style classes will be used for colorize the markers.
for (i = 0; i < 9; i++) {
    $('head').append($("<style> .marker-color-" + (i + 1).toString() +
    " { color: " + colors[i] + "; font-size: 10px; text-shadow: 0 0 3px #ffffff;} </style>"));
}

// Get GeoJSON and put on it on the map when it loads
airports = L.geoJson.ajax("assets/airports.geojson", {
    onEachFeature: function (feature, layer) {
        layer.bindPopup("<b>Airport: </b>" + feature.properties.AIRPT_NAME +
        "<br>Total enplanement (boarded passengers) per year: " + feature.properties.TOT_ENP);
    },
    pointToLayer: function (feature, latlng) {
        var id = 0;
        if (feature.properties.TOT_ENP > 1000000) return L.marker(latlng, {icon: L.divIcon({className: 'fas fa-plane marker-color-3'.toString() })})
        else if (feature.properties.CNTL_TWR == "Y") { id = 1; }
          return L.marker(latlng, {icon: L.divIcon({className: 'fas fa-circle marker-color-' + (id + 1).toString() })})
    },
    attribution: 'Airport Data &copy; USGS | State Boundaries &copy; Mike Bostock | Base Map &copy; CartoDB | Made By Anna Ballasiotes'
}).addTo(mymap);

//State Chloropleth
var states = null;
colors = chroma.scale('Oranges').colors(5);

function setColor(count) {
    var id = 0;
    if (count > 20) { id = 4; }
    else if (count > 15 && count <= 20) { id = 3; }
    else if (count > 10 && count <= 15) { id = 2; }
    else if (count > 5 &&  count <= 10) { id = 1; }
    else  { id = 0; }
    return colors[id];
}

function style(feature) {
    return {
        fillColor: setColor(feature.properties.count),
        fillOpacity: 0.4,
        weight: 2,
        opacity: 1,
        color: '#b4b4b4',
        dashArray: '4'
    };
}

states = L.geoJson.ajax("assets/us-states.geojson", {
    style: style,
    onEachFeature: function(feature, layer) {
        layer.bindPopup("There are " + feature.properties.count + " airports in " + feature.properties.name + ".");
      }
}).addTo(mymap);

// 9. Create Leaflet Control Object for Legend
var legend = L.control({position: 'topright'});

// 10. Function that runs when legend is added to map
legend.onAdd = function () {

    // Create Div Element and Populate it with HTML
    var div = L.DomUtil.create('div', 'legend');
    div.innerHTML += '<b>Airports per State</b><br />';
    div.innerHTML += '<i style="background: ' + colors[4] + '; opacity: 0.5"></i><p>21+</p>';
    div.innerHTML += '<i style="background: ' + colors[3] + '; opacity: 0.5"></i><p>16-20</p>';
    div.innerHTML += '<i style="background: ' + colors[2] + '; opacity: 0.5"></i><p>11-15</p>';
    div.innerHTML += '<i style="background: ' + colors[1] + '; opacity: 0.5"></i><p> 6-10</p>';
    div.innerHTML += '<i style="background: ' + colors[0] + '; opacity: 0.5"></i><p> 0- 5</p>';
    div.innerHTML += '<hr><b>Airports<b><br />';
    div.innerHTML += '<i class="fa fa-circle marker-color-1"></i><p>With No Control Tower</p>';
    div.innerHTML += '<i class="fa fa-circle marker-color-2"></i><p> With Control Tower</p>';
    div.innerHTML += '<i class="fas fa-plane marker-color-3"></i><p> With Control Tower & greater than 1,000,000 passengers</p>';
    // Return the Legend div containing the HTML content
    return div;
};

// 11. Add a legend to map
legend.addTo(mymap);

// 12. Add a scale bar to map
L.control.scale({position: 'bottomleft'}).addTo(mymap);
