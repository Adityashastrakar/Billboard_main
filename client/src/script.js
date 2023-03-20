// 1.data in json format
var URL = "http://localhost:8080/"

document.addEventListener("DOMContentLoaded", function () {
  fetch(URL)
    .then((response) => response.json())
    .then((data) => initMap(data["data"]));
});

//.....................+++++++................................

// converting dms into degrees

function ParseDMS(input) {
  var parts = input.split(/[^\d\w.]+/);
  var dege = ConvertDMSToDD(parts[0], parts[1], parts[2], parts[3]);
  return dege;
}
function ConvertDMSToDD(degrees, minutes, seconds, direction) {
  var deg = Number(degrees);
  var min = Number(minutes / 60);
  var sec = Number(seconds / 3600);

  var dd = deg + min + sec;

  if (direction === "S" || direction === "W") {
    dd = dd * -1;
  }
  return dd;
}
//.....................+++++++................................

//Constants

// 2.list of markers

var markers = [];
const distanceLoc = [];
var selectedMarkers = [];
var distaceMarkers = []

// 3.colors for markers

var red = "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
var white = "http://maps.google.com/mapfiles/ms/icons/white-dot.png";
var green = "http://maps.google.com/mapfiles/ms/icons/green-dot.png";
var yellow = "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
var pin = "http://maps.google.com/mapfiles/kml/pal2/icon13.png";

//.....................+++++++................................

// 4.Legends

let A = document.getElementById("show-marker-type-a");
A.addEventListener("change", () => removeMarkersOfType("A", A.checked));

let B = document.getElementById("show-marker-type-b");
B.addEventListener("change", () => removeMarkersOfType("B", B.checked));

let C = document.getElementById("show-marker-type-c");
C.addEventListener("change", () => removeMarkersOfType("C", C.checked));

// Displaying markers according to legends

function setMapOnMarkerType(markerType, map) {
  markers.forEach((element) => {
    if (element.label === markerType) {
      element.setMap(map);
    }
  });
}

function removeMarkersOfType(markerType, isChecked) {
  if (isChecked) {
    setMapOnMarkerType(markerType, map);
  } else {
    setMapOnMarkerType(markerType, null);
  }
}

// main function

function initMap(data) {
  // displaying map
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 18,
    center: { lng: 78.04666667, lat: 22.11838889 },
  });
  if (data) {
    Object.values(data).map((loc) => {
      // console.log(loc);
      var longitude = ParseDMS(loc.Longitude);
      var latitude = ParseDMS(loc.Latitude);
      var MarkerType = loc.Marker_Type;
      var id = loc.Marker_ID;
      // adding markers on the map
      addMarker(latitude, longitude, MarkerType, id);
    });
  }

  // add marker function

  function addMarker(latitude, longitude, MarkerType, id) {
    let marker = new google.maps.Marker({
      position: { lng: longitude, lat: latitude },
      label: MarkerType,
      id: id,
      map: map,
      title: "ID = " + id + "  " + MarkerType + "  zone 1",
      icon: {
        path: google.maps.SymbolPath.Marker,
        url: MarkerType == "A" ? red : MarkerType == "B" ? green : yellow,
        fillOpacity: 1,
        strokeColor: "white",
        strokeWeight: 10,
        scale: 30,
      },
    });
    markers.push(marker);
    // calculate distace between two markers
    google.maps.event.removeListener(marker.listener);
    // listning to the click event on the map
    google.maps.event.addListener(marker, "click", listenClick(marker));
  }

  //start listning to to pointer clicks after clicking start button
  var addButton = document
    .getElementById("start")
    .addEventListener("click", emptyClicks);

  function emptyClicks(marker) {
    var length = selectedMarkers.length;
    for (let i = 0; i < length; i++) {
      selectedMarkers.pop();
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
    listenClick(marker);
  }

  function listenClick(marker) {
    return function (evt) {
      var loca = {
        lng: marker.getPosition().lng(),
        lat: marker.getPosition().lat(),
        label: marker.label,
        id: marker.id,
      };
      var selpts="";
      var dist=0;
      var index = selectedMarkers.findIndex((m) => m.id === marker.id);
      if (index === -1) {
        marker.setIcon(pin);
        selectedMarkers.push(loca);
        showpolyline();
        
        for(let i = 0; i < selectedMarkers.length - 1; i++) // Iterate over the markers except the last one
        {
          for (let j = i + 1; j < selectedMarkers.length; j++) // Iterate over the markers starting from the next one
          {
            selpts = selectedMarkers[i].id + "+" + selectedMarkers[j].id;
            dist = 100 * calculateDistance(selectedMarkers[i], selectedMarkers[j]);
          }
      }
      insertRowinT2(selpts, dist)
      }
      
      else {
          var result = confirm("Are you sure you want to delete this item?");

          if (result) {
            // user clicked OK  // delete the item
            marker.setIcon({
              path: google.maps.SymbolPath.Marker,
              url: loca.label == "A" ? red : loca.label == "B" ? green : yellow,
              fillOpacity: 1,
              strokeColor: "white",
              strokeWeight: 10,
              scale: 30,
            });
        
            selectedMarkers.splice(index, 1);
            updateTable(selectedMarkers)
            showpolyline();
          } 
          else {
            // user clicked Cancel do nothing
          }
    }
    };
  }
  let flightPath = null;

  function showpolyline() {
    if (selectedMarkers.length > 1) {
      if (flightPath === null) {
        flightPath = new google.maps.Polyline({
          path: [],
          geodesic: true,
          strokeColor: "#FF0000",
          strokeOpacity: 1.0,
          strokeWeight: 2,
        });
      }

      const size = selectedMarkers.length - 1;
      const path = [];
      for (let i = 0; i < size; i++) {
        const { lat: y1, lng: x1 } = selectedMarkers[i];
        const { lat: y2, lng: x2 } = selectedMarkers[i + 1];
        path.push({ lat: y1, lng: x1 }, { lat: y2, lng: x2 });
      }

      flightPath.setPath(path);
      flightPath.setMap(map);
    } else {
      if (flightPath !== null) {
        flightPath.setMap(null);
        flightPath = null;
      }
    }
  }
}

//Take data like Name,date,Trip Sequence, from user

let entry = document.getElementById("add");
add.addEventListener("click", displaydetails);

let stopButton = document
  .getElementById("stop")
  .addEventListener("click", showRoute);

function displaydetails() {
  var date = document.getElementById("date").value;
  var Name = document.getElementById("name").value;
  var marker_type = document.getElementById("marker_type").value;
  if (!Name || !date || !marker_type) {
    console.log("Enter All Details.");
    return;
  }

  var distance = 100 * calculateTotalDistance() + " Kms";
  var route = showRoute();

  addToDb(date, Name, route, marker_type, distance);
  insertRowtoTable(date, Name, route, marker_type, distance);
  
}

//*       DATABASE CODE       *//

function addToDb(date, Name, route, marker_type, distance) {
  console.log(distanceLoc);
  distanceLoc.length = 0;
  fetch(URL, {
    headers: {"Content-type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      Name: Name,
      date: date,
      route: route,
      marker_type: marker_type,
      distance: distance,
    }),
  }).then((response) => response.json());
  // .then((data) => insertRowtoTable(data["data"]));
}
function insertRowtoTable(date, Name, route, marker_type, distance) {
  row = 1;
  var contents = document.getElementById("contents");
  var newRow = contents.insertRow(row);
  var cell1 = newRow.insertCell(0);
  var cell2 = newRow.insertCell(1);
  var cell3 = newRow.insertCell(2);
  var cell4 = newRow.insertCell(3);
  var cell5 = newRow.insertCell(4);

  cell1.innerHTML = date;
  cell2.innerHTML = Name;
  cell3.innerHTML = route;
  cell4.innerHTML = marker_type;
  cell5.innerHTML = distance;
  row++;
  emptyFeilds();
}

//* Creating route for the pointers clicked

function showRoute() {
  var length = selectedMarkers.length;
  var route = "";
  for (let i = 0; i < length; i++) {
    var route = route + selectedMarkers[i].id + "-";
  }
  return route;
}
// calculating distance

function calculateDistance(source, destination) {
  var x1 = source.lng;
  var y1 = source.lat;
  var x2 = destination.lng;
  var y2 = destination.lat;

  var distance = Number(getDistance(x1, y1, x2, y2).toFixed(4));
  return distance;
}

function getDistance(x1, y1, x2, y2) {
  var xDiff = x1 - x2;
  var yDiff = y1 - y2;

  return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
}

function calculateTotalDistance() {
  var length = selectedMarkers.length;
  let total = Number(0);
  if (length > 2) {
    for (let i = 0; i < length - 1; i++) {
      total =
        total + calculateDistance(selectedMarkers[i], selectedMarkers[i + 1]);
    }
    return total.toFixed(4);
  } else if (length === 2) {
    total += calculateDistance(selectedMarkers[0], selectedMarkers[1]);
    return total.toFixed(4);
  } else {
    alert("Select more markers");
  }
}

// Empty The input fiels after taking the inputs.
function emptyFeilds() {
  const formData = document.getElementById("inputs");
  const defaultOpt = document.getElementById("default");
  formData.elements.name.value = "";
  const timestamp = Date.now();
  formData.elements.date.value = new Date(timestamp);
  formData.elements.marker_type.value = defaultOpt;
}

// Function To display the distance between two points:

function insertRowinT2(selpts, dist){
  row = 0;
  var DistBetPts = document.getElementById("DistBetPts");
  var newRw = DistBetPts.insertRow(row);
  var cel1 = newRw.insertCell(0);
  var cel2 = newRw.insertCell(1);
 
  cel1.innerHTML = selpts;
  cel2.innerHTML = dist;
  row++;
}
function updateTable(selectedMarkers) {
  var table = document.getElementById("DistBetPts");
  table.innerHTML = "";

  // Add rows in pairs
  for (let i = 0; i < selectedMarkers.length - 1; i++) {
    var marker1 = selectedMarkers[i];
    var marker2 = selectedMarkers[i+1];
    if (marker1 && marker2) {
      selpts = marker1.id + "+" + marker2.id;
      dist = 100 * calculateDistance(marker1, marker2);

      if (selectedMarkers.indexOf(marker1) !== -1 && selectedMarkers.indexOf(marker2) !== -1) {
        // Create a new row
        var row = table.insertRow();
        var cell1 = row.insertCell();
        var cell2 = row.insertCell();
        cell1.innerHTML = selpts;
        cell2.innerHTML = dist;
      }
    }
  }
}

