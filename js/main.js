var iconOptions = {
    iconUrl: 'img/gear.svg',
    iconSize: [24, 24]
};

var metroLinesColors = [
	{class:"sok", name: "Сокольническая", color:"#ed1b35"},
	{class:"zam", name: "Замоскворецкая", color:"#44b85c"},
	{class:"arb", name: "Арбатско-Покровская", color:"#0078bf"},
	{class:"fil", name: "Филёвская", color:"#19c1f3"},
	{class:"kol", name: "Кольцевая", color:"#894e35"},
	{class:"kri", name: "Калужско-Рижская", color:"#f58631"},
	{class:"tag", name: "Таганско-Краснопресненская", color:"#8e479c"},
	{class:"kal", name: "Калининско-Солнцевская", color:"#ffcb31"},
	{class:"ser", name: "Серпуховско-Тимирязевская", color:"#a1a2a3"},
	{class:"lub", name: "Люблинско-Дмитровская", color:"#b3d445"},
	{class:"kah", name: "Каховская", color:"#79cdcd"},
	{class:"but", name: "Бутовская", color:"#acbfe1"}
];

var osmTiles = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
	osmAttrib = '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	sputnikTiles = 'http://tiles.maps.sputnik.ru/{z}/{x}/{y}.png',
	sputnikAttrib = '© <a href="http://sputnik.ru">Спутник</a> | © <a href="http://www.openstreetmap.org/copyright">Openstreetmap</a>',
	stamenTiles = 'http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png',
	stamenAttrib = '&copy; Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> | <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors';

queue()
	.defer(d3.json, "data/mowSpots.geojson")
	.defer(d3.json, "data/categories.json")
	.defer(d3.json, "data/mowSpotsRoutes.json")
	.await(ready);

function ready(error, spotsData, categories, routes) {
	if (error) throw error;

	var categoryById = {},
		routesById = {},
		colorByName = {};

	categories.forEach(function(d) {
		categoryById[d.id] = d.name;
	});

	routes.forEach(function(d) {
		routesById[d.id] = d.routes.result;
	});

	metroLinesColors.forEach(function(d) {
		colorByName[d.name] = d.color;
	});

	var	sputnik = L.tileLayer(sputnikTiles, {
		attribution: sputnikAttrib,
		maxZoom: 18,
        minZoom: 11,
        maxBounds: [[55.123, 36.800], [56.200, 38.430]]
	}),
	map = new L.Map('map', {
		center: [55.7501, 37.6687],
		zoom: 11,
		layers: [sputnik]
	});

	var spots = L.geoJson(spotsData, {
		pointToLayer: function (feature, latlng) {
			var name = feature.properties.name,
				markerOptions = {icon: L.icon(iconOptions), title: name};
			return L.marker(latlng, markerOptions);
		},
    	onEachFeature: function (feature, layer) {
    		var name = feature.properties.name,
    			categoriesIds = feature.properties.categories,
    			categoriesNames = categoriesIds.map(function(d) { return ' ' + categoryById[d]; }),
    			routes = routesById[feature.properties.id],
    			shortestRoute = routes[0],
    			popupInfo = 'Спот: ' + name + '</br>'
    					  + 'Стиль:' + categoriesNames.toString() + '</br>'
    					  + 'Удалённость: ' + Math.round(shortestRoute.distance) + 'м';
    			routes.forEach(function(d) {
    				var routeLngLat = decodePath(d.points),
    					routeLatLng = routeLngLat.map(function(d) {return d.reverse(); }),
    					lineName = d.exit.station.line.name,
    					lineColor = colorByName[lineName];

    				var routeLine = L.polyline(routeLatLng, {color: lineColor});
    				routeLine.addTo(map);
    				msg = 'Путь от спота «' + name + '»' + ' до станции метро '
    				+ '«' + d.exit.station.name + '»: ' + Math.round(d.distance) + 'м';
    				routeLine.bindPopup(msg);
    			});

    	    layer.bindPopup(popupInfo);
    	    feature.layer = layer; // for fuse-search
    	}
	});

	// Add fuse search control
	var options = {
	    position: 'topright',
	    title: 'Поиск',
	    placeholder: 'Название спота',
	    maxResultLength: 7,
	    threshold: 0.2,
	    showInvisibleFeatures: false,
	    showResultFct: function(feature, container) {
	        var props = feature.properties,
	            name = L.DomUtil.create('b', null, container);
	        name.innerHTML = props.name;
	
	        container.appendChild(L.DomUtil.create('br', null, container));
		}
	};
	
	var fuseSearchCtrl = L.control.fuseSearch(options);
	fuseSearchCtrl.indexFeatures(spotsData.features, ['name']);
	map.addControl(fuseSearchCtrl);

	map.addLayer(spots);
	L.hash(map);
};

function decodePath(encoded) {
	var len = encoded.length;
	var index = 0;
	var array = [];
	var lat = 0;
	var lng = 0;
	var ele = 0;

	while (index < len) {
		var b;
		var shift = 0;
		var result = 0;
		do {
			b = encoded.charCodeAt(index++) - 63;
			result |= (b & 0x1f) << shift;
			shift += 5;
		} while (b >= 0x20);
		var deltaLat = ((result & 1) ? ~(result >> 1) : (result >> 1));
		lat += deltaLat;

		shift = 0;
		result = 0;
		do {
			b = encoded.charCodeAt(index++) - 63;
			result |= (b & 0x1f) << shift;
			shift += 5;
		} while (b >= 0x20);
		var deltaLon = ((result & 1) ? ~(result >> 1) : (result >> 1));
		lng += deltaLon;
		array.push([lng * 1e-5, lat * 1e-5]);
	}


	return array;
};