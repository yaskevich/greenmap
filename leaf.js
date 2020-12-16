$(document).ready(function() {
	function cutString(s, n){
		var suff = s.length > n? "...":'';
		var cut= s.indexOf(' ', n);
		if(cut== -1) return s;
		return s.substring(0, cut)+suff;
	}
		
	// var iconbooks = L.icon({
    // iconUrl: 'img/icon-books.png',
    // shadowUrl: 'leaf-shadow.png',

    // iconSize:     [32, 44], // size of the icon
    // shadowSize:   [50, 64], // size of the shadow
    // iconAnchor:   [16, 43], // point of the icon which will correspond to marker's location
    // shadowAnchor: [4, 62],  // the same for the shadow
    // popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
	// });
	
	function makeMarker(curLayer, lat, lon, content, imagepath){
		// var marker = L.marker([lon, lat]);
		// console.log(imagepath);
		var marker = imagepath?L.marker([lon, lat], {icon: L.icon({
				iconUrl: imagepath,
				iconSize:     [32, 44], // size of the icon
				iconAnchor:   [16, 43], // point of the icon which will correspond to marker's location
				popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
			})}): L.marker([lon, lat]);
		
		
		marker.bindPopup(content, {
			showOnMouseOver: true
		});
		marker.on('mouseover', function (e) {
			// console.log(content);
			this.openPopup();
		});
		marker.on('mouseout', function (e) {
			this.closePopup();
		});
		curLayer.addLayer(marker);
	}
	function proc(){
		// $('#status-row').addClass('hide');
		var query = $('#inpname').val().replace(/'/g, '’').trim();
		if (query === ''){
			// $('#status-row').removeClass('hide');
			// $('#status').html('Puste!');
			return;
		} 
		// $('#status-loader').removeClass('hide');
		// $.post("data.json", {q:"terespol"}, function(data, textStatus) { makeRequest(data)}, "json");
		$.post("data.json", {q:query}, function(data, textStatus) { makeRequest(data)}, "json");
	}
	
	var ht = $(window).height()-$('#overview').height()-$('footer').height()-50;
	// console.log(ht);
	$("#mapid").height(ht);
	$("#mapid").width($('#copyright').width());
	var mymap = L.map('mapid').setView([53, 27.5], 6);
	
	
		// var map = L.map('map', {
			// zoom: 15,
			// attributionControl: false,
			// center: L.latLng([42,12]),
			// maxBounds: L.latLngBounds([[42.41281,12.28821],[42.5589,12.63805]]).pad(0.5),
		// });
	
	// my_osm_exp  = L.tileLayer('http://mp.qw/tiles/datamap/webmercator/{z}/{x}/{y}.png', { maxZoom: 19, minZoom: 6, attribution: osm_attr });
	// mymap.scrollWheelZoom.disable();
	
	L.tileLayer(
	// 'http://tile.stamen.com/terrain/{z}/{x}/{y}.jpg'
	// 'http://tile.stamen.com/watercolor/{z}/{x}/{y}.jpg'
	// 'http://tile.stamen.com/toner/{z}/{x}/{y}.png'
	 'https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png'
	// 'http://datamap.by/bright/{z}/{x}/{y}.png'
	// 'http://mp.qw/tiles/osm/webmercator/{z}/{x}/{y}.png'
	, { maxZoom: 14, minZoom: 6, attribution: "<a href='https://wikimediafoundation.org/wiki/Maps_Terms_of_Use'>Wikimedia maps</a> | © <a href='//openstreetmap.org/'>OpenStreetMap</a>" }).addTo(mymap);

	// var markersLayer = new L.FeatureGroup();
	var markersLayer = L.markerClusterGroup();
    // for (var i = 0; i < 10; i++) {
        // makeMarker(markersLayer, 25.55+i, 53.916667,  'oodasjkfnkasnf wefcs');
    // }
    mymap.addLayer(markersLayer);

	$("#inpname").on('keyup', function (e) {
		if (e.keyCode == 13) {
			proc();
		}
	});
	$('.proc').click(function(){
		proc();
	});
	 $("#inpname").focus();
	 
	var found = $.grep(leaf, function(v, z) {		
		return v.group == "1";
	});
	
	
	var root  = $.grep(found, function(v) {		
		return jQuery.isEmptyObject(v.object) && v.group == "1" && v.title === "Карта";
	})[0];
	
	// console.log("root", root);
	
	// found.forEach(function(c, index, array) {
		// if (jQuery.isEmptyObject(c.object)) {			
			// $( ".box" ).append( "<div>"+c.object[1]+" | "+c.object[2]+" | "+c.object[3]+"->"+c.title+"</div>" );
		// }
	// });
	// $( ".box" ).append("<hr/>");
	
	function getTitleByID(arr, id){
		var ret = $.grep(arr, function(v) { return v.id == id; });
		return ret && ret[0]? ret[0].title : id;
	}
	function getByID(arr, id){
		var ret = $.grep(arr, function(v) { return v.id == id; });
		return ret && ret[0]? ret[0] : null;
	}
	function push2path(p, id){
		if (id && id != root.id) {
		// if (id ) {
			var t = getTitleByID(found, id);
			if (t) {
				p.push(t);
			}
		}
		// p.push(id);
	}
	var mn  = {};
	found.forEach(function(c, index, array) {
		if (!jQuery.isEmptyObject(c.object) && c.object[1] == root.id) {
			var path  = [];
			push2path(path, c.object[1]);
			push2path(path, c.object[2]);
			push2path(path, c.object[3]);
			
			var ab = c.object[2];
			// var way = path.join(' → ');
			var way = path.length?path[0]:'';
			if (!way){
				if (!mn.hasOwnProperty(c.id)){
					mn[c.id] = {'title':''};
				}
				// mn[c.id]['title'] = "<div class='hd'><a href='"+c.id+"'>"+c.title+"</a></div>";
				mn[c.id]['title'] = "<div class='hd'>"+c.title+"</div>";
			} else {
				
				if (!mn.hasOwnProperty(ab)){
					mn[ab] = {'body':''};
				}
				// mn[ab]['body'] += "<div>"+way+" ► <a href='"+c.id+"'>"+c.title+"</a></div>";
				var sfx = c.lvl && c.lvl.length ? "lvl" : '';
				mn[ab]['body'] += "<div><a class='col s12 m6 l3 chapter "+sfx+"' href='#' data-id='"+c.id+"'>"+c.title+"</a></div>";
			}
		}
	});
	$.each(mn, function(index,i) {
		// console.log(i);
		$( ".box" ).append( i.title+"<div class='ns'>"+i.body+"</div>");		
	});
	$( ".box" ).append('<div class="hd">Зелёные насаждения</div><div class="ns"><div><a class="col s12 m6 l3 chapter " href="#" data-id="100">Деревья (Минск)</a></div></div>');
	
		// $('body').on('click', 'a.dyn', function () {
		// var sel = $(this).data("id");
		// console.log("dyn", sel);	
		// showData(sel);		
	// });
	
	// $( "a.chapter" ).bind( "click", function() {
	$('body').on('click', 'a', function () {
		console.log("clicked!");
		markersLayer.clearLayers();
		var sel = $(this).data("id");		
		console.log(sel);
		if (sel == 100){
			$('a').removeClass("clck");
			$(this).toggleClass("clck");
			$.getJSON( "/api/products/all", function( trees ) {
			console.log(trees.data);
			$.each(trees.data, function(index,i) {				
				makeMarker(markersLayer, i.lon, i.lat, i.name, "/img/leaf2.png");
				mymap.fitBounds(markersLayer.getBounds(), {padding: [10, 10]});
			});
	});

		} else {		
			var isDyn = $(this).hasClass("dyn");
			var cur = $.grep(leaf, function(v) {		
				return v.id == sel;
			})[0];
			if (isDyn){
				$('.dyn').removeClass("clck");
				$(this).toggleClass("clck");
			} else {
				$('a').removeClass("clck");
				$(this).toggleClass("clck");
			}
			
			
			if (cur && cur.hasOwnProperty('lvl') && cur['lvl'].length){
				// console.log("this", cur['lvl']);
				var body  = '';
				$.each(cur['lvl'], function(index,i) {
					var rel = getByID(leaf, i);
					body += "<div><img class=\"icon\" src=\"img/"+rel['img']+"\"/><a class='dyn' href='#' data-id='"+i+"'>"+rel['title']+"</a></div>";
				});
				$('.fox').html(body);
				// console.log("return");
				return;
			} else {
				if (!isDyn){
					$('.fox').empty();
				}
			}
			var match = isDyn? 
				$.grep(leaf, function(v) {		
					return v.group != "1" && (jQuery.inArray(sel, v.lvl) != -1);
				})
				:
				$.grep(leaf, function(v) {		
					return v.group != "1" && (v.object[1]==sel || v.object[2]==sel || v.object[3]==sel);
				});
			console.log("len",match.length);
			var isMapped = false;
			
			
			var prev = $(this).prev();
			console.log("prev", prev.attr("src"));
			var imgpath = $(this).prev().attr("src");
					
					
			$.each(match, function(index,i) {
				// console.log(i.lon, i.lat, i.id);
				
				if (i.lat && i.lat < 60 && i.lon && i.lon < 35){
					isMapped = true;
	  // console.log(i.title, i.coords);
	  // "phones" : "23-05-52, 23-74-39",
	  // "tree" : "Объект",
	  // "txt" : "<p>безвозмездно принимаются в пригодном для использования состоянии: одежда взрослая и детская, предметы мебели и интерьера, книги, бытовая техника, детские коляски и другое</p>",
	  // "place" : "Брест",
	  // "lon" : 23.704681,
	  // "object" : {
		 // "3" : 83475,
		 // "2" : 60911,
		 // "1" : 60902
	  // },
	  // "type" : 3916,
	  // "id" : 85412,
	  // "addr" : "г.Брест, ул. Халтурина, 8",
	  // "time" : "пн.-пт. 8.15-17.15, обед 13.00-14.00",
	  // "title" : "Территориальный центр социального обслуживания населения Московского района",
	  // "lat" : 52.092846,
	  // "lvl" : [
		 // 80496,
		 // 85475
	  // ]	
					var alltext  = '';
					if (i.title){ alltext+='<div class="sel">'+i.title+'</div>';}
					
					
					
					if (i.txt){ 
						// alltext+=i.txt;
						var StrippedString = i.txt.replace(/(<([^>]+)>)/ig,"");
						alltext+=cutString(StrippedString, 100);
					}
					if (i.addr){ alltext+='<div><span class="sel">Адрес:</span>&nbsp;'+i.addr+'</div>';}
					if (i.time){ alltext+='<div><span class="sel">Время работы:</span>&nbsp;'+i.time+'</div>';}
					if (i.phones){ alltext+='<div><span class="sel">Телефон:</span>&nbsp;'+i.phones+'</div>';}
					// if (i.phones){ alltext+='<div><span class="sel">Телефон:</span>&nbsp;'+i.phones+'</div>';}				
					makeMarker(markersLayer, i.lon, i.lat, alltext, imgpath);
				} else {
					console.log(i);
				}
				
				// console.log(JSON.stringify(i));
				// if (String(i.lat).length > 1 && String(i.lon).length > 1) {
					// // console.log(JSON.stringify(i.lon, i.lat, i.n + ', ' + i.d + " раён"));
					// isMapped  = true;
					// makeMarker(markersLayer, i.lon, i.lat, i.name + ', ' + i.sub_type);
				// }
			});
			if (isMapped){
			// issue if run with empty layer!
			mymap.fitBounds(markersLayer.getBounds(), {padding: [10, 10]});
			}
		}
	});

	// console.log(JSON.stringify(mn));
	// $( ".box" ).append( "<div>"+way+" ► <a href='"+c.id+"'>"+c.title+"</a></div>" );
});