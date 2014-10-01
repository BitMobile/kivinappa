function OnLoad() {    
//	if (screenName == "TripMap.xml") {
    	PrepareTrip_Map();
//    }
}

function PrepareTrip_Map() {
    var tripPoints = $.tripPoints;
    
    while (tripPoints.Next()){      	
    	
        if (parseFloat(tripPoints.Latitude) != parseFloat(0) && parseFloat(tripPoints.Longitude) != parseFloat(0)) {
        	Variables["map"].AddMarker(tripPoints.Description, tripPoints.Latitude, tripPoints.Longitude, "green");           
        }
    }
}


//ФУНКЦИЯ ДЛЯ ТЕСТОВ

function Test(p){
	Dialog.Debug(p);
	return p;
}
