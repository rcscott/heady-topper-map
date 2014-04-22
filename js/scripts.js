var markers = [];
var map;
var loc_type_state = '';
var cases_state = '';
var day_state = '';
var days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

$(document).ready(function() {
    var mapOptions = {
        center: new google.maps.LatLng(44.337549, -72.756721),
        zoom: 10
    };
    map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

    $.each(locations, function() {
        var marker = new google.maps.Marker({
            position: {lat: this['lat'], lng: this['lng']},
            title: this['name']
        });
        marker.setMap(map);
        markers.push([marker, this['days'], this['loc_type'], this['cases_avail']]);

        var info = '<div style="width:250px"><p>' +
            '<strong>' + this['name'] + '</strong><br>' +
            this['address'].substring(0, this['address'].length - 4) + '<br>' +
            'Days: ';
        $.each(this['days'], function() {
            info += capitalize(this);
        });
        info += '<br>Business Type: ' + capitalize(this['loc_type']) + '<br>' +
            'Cases Available: ';
        info += (this['cases_avail'] == true) ? 'Yes' : 'No';
        info += '</p></div>';

        var infowindow = new google.maps.InfoWindow({
            content: info
        });
        google.maps.event.addListener(marker, 'click', function() {
            infowindow.open(map, marker);
        });
    });

    $('#show-all').click(function(event) {
        showAll();
    });

    $('.day').click(function(event) {
        filterDay($(this).attr('id'));
    });

    $('.loc-type').click(function(event) {
        toggleLocType($(this).attr('id'));
    });

    $('#cases').click(function(event) {
        toggleCasesAvail();
    });

    $('#gh-btn').click(function(event) {
        window.open('https://github.com/rcscott/heady-topper-map', '_blank');
    });

});

function showAll() {
    $.each(markers, function(i, m) {
        m[0].setMap(map);
    });
    loc_type_state = '';
    cases_state = '';
    day_state = '';

    $('#store').removeClass('active');
    $('#eatery').removeClass('active');
    $('#cases').removeClass('active');
    $.each(days, function(i, day) {
        $('#'+day).removeClass('active');
    });
}

function toggleLocType(loc_type) {
    if ($('#'+loc_type).hasClass('active')) {
        $('#'+loc_type).removeClass('active');
        loc_type_state = '';
    }
    else {
        $('#store').removeClass('active');
        $('#eatery').removeClass('active');
        $('#'+loc_type).addClass('active');
        loc_type_state = loc_type;
    }
    filterMarkers();
}

function toggleEateries() {
    $('#eatery').addClass('active');
    $('#store').removeClass('active');
    loc_type_state = "eatery";
    filterMarkers();
}

function toggleStores() {
    $('#store').addClass('active');
    $('#eatery').removeClass('active');
    loc_type_state = "store";
    filterMarkers();
}

function toggleCasesAvail() {
    if ($('#cases').hasClass('active')) {
        $('#cases').removeClass('active');
        cases_state = 'false';
    }
    else {
        $('#cases').addClass('active');
        cases_state = 'true';
    }
    filterMarkers();
}

function filterDay(day_selected) {
    if ($('#'+day_selected).hasClass('active'))
        day_state = '';
    else
        day_state = day_selected;
    
    $.each(days, function(i, day) {
        if (day_selected == day) {
            if ($('#'+day).hasClass('active'))
                $('#'+day).removeClass('active');
            else
                $('#'+day).addClass('active');
        }
        else
            $('#'+day).removeClass('active');
    });
    
    filterMarkers();
}

function filterMarkers() {
    if (!loc_type_state && !cases_state && !day_state) {
        showAll();
        return;
    }

    $.each(markers, function(i, m) {
        if (!day_state || ($.inArray(day_state, m[1]) != -1)) {
            if (!loc_type_state || loc_type_state == m[2]) {
                if (!cases_state || cases_state == m[3])
                    m[0].setMap(map);
                else
                    m[0].setMap(null);
            }
            else {
                m[0].setMap(null);
            }
        }
        else {
            m[0].setMap(null);
        }
        
    });

}

function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.substring(1);
}
