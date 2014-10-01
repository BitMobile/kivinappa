// ------------------------ Application -------------------

function OnApplicationInit() {
    Variables.AddGlobal("lastDataSync", "-");
    Variables.AddGlobal("lastFtpSync", "-");
}

// ------------------------ Events ------------------------

function OnLoad(screenName) {
//    if (screenName == "TripMap.xml") {
//    	PrepareTrip_Map();
//    }
}



function OnWorkflowPause(name) {
    Variables.Remove("workflow");
}

// ------------------------ Functions ------------------------

//function PrepareTrip_Map() {
//    var tripPoints = Variables["tripPoints"];
//    for (var tripPoint in tripPoints) {
//				
//        if (tripPoint.Latitude != 0 && tripPoint.Longitude != 0) {
//             Variables["map"].AddMarker(tripPoint.Description, tripPoint.Latitude, tripPoint.Longitude, "green");	
//           
//        }
//    }
//}