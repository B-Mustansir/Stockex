google.maps.event.addDomListener( window, 'load', init );

function init() {
	var mapOptions = {
		zoom: 14,
		scrollwheel: false,
		center: new google.maps.LatLng( -8.707447, 115.187375 ),
		styles:
			/* paste snazzy maps js style here */
            [
				{
					"featureType": "administrative",
					"elementType": "labels.text.fill",
					"stylers": [
						{
							"color": "#444444"
            }
        ]
    },
				{
					"featureType": "landscape",
					"elementType": "all",
					"stylers": [
						{
							"color": "#f2f2f2"
            }
        ]
    },
				{
					"featureType": "poi",
					"elementType": "all",
					"stylers": [
						{
							"visibility": "off"
            }
        ]
    },
				{
					"featureType": "road",
					"elementType": "all",
					"stylers": [
						{
							"saturation": -100
            },
						{
							"lightness": 45
            }
        ]
    },
				{
					"featureType": "road.highway",
					"elementType": "all",
					"stylers": [
						{
							"visibility": "simplified"
            }
        ]
    },
				{
					"featureType": "road.arterial",
					"elementType": "labels.icon",
					"stylers": [
						{
							"visibility": "off"
            }
        ]
    },
				{
					"featureType": "transit",
					"elementType": "all",
					"stylers": [
						{
							"visibility": "off"
            }
        ]
    },
				{
					"featureType": "water",
					"elementType": "all",
					"stylers": [
						{
							"color": "#46bcec"
            },
						{
							"visibility": "on"
            }
        ]
    }
]
		/* snazzy maps js style end here */
	};

	var mapElement = document.getElementById( 'map-canvas' );
	var map = new google.maps.Map( mapElement, mapOptions );
	var marker = new google.maps.Marker( {
		position: new google.maps.LatLng( -8.707447, 115.187375 ),
		map: map,
		icon: 'images/map/map-marker.png'
	} );
}
