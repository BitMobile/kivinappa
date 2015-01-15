
// ------------------------ Main screen module ------------------------

var userIdCP;
var bitmobileRoleCP
var bitmobileRoleRefCP

function CloseMenu() {
    var sl = Variables["swipe_layout"];
    if (sl.Index == 1) {
        sl.Index = 0;
    }
    else if (sl.Index == 0) {
        sl.Index = 1;
    }
}

function OpenMenu() {
    var sl = Variables["swipe_layout"];
    if (sl.Index == 1) {
        sl.Index = 0;
    }
    else if (sl.Index == 0) {
        sl.Index = 1;
    }
}

function Fake() {

}

function OnLoading() {    
	userIdCP = $.common.UserId;
	
	var qRole = new Query("SELECT BitmobileRole " +
			"FROM Catalog_User " +
			"WHERE Id == @userIdCP");	
	qRole.AddParameter("userIdCP", "@ref[Catalog_User]:" + userIdCP);	
	bitmobileRoleCP = qRole.ExecuteScalar();
	
	if(bitmobileRoleCP == 1){
		//forepersonCP
		var q = new Query("SELECT Foreperson " +
				"FROM Catalog_User " +
				"WHERE Id == @userIdCP");	
		q.AddParameter("userIdCP", "@ref[Catalog_User]:" + userIdCP);	
		bitmobileRoleRefCP = q.ExecuteScalar();
	}else{
		//machinistCP
		var q = new Query("SELECT Machinist " +
				"FROM Catalog_User " +
				"WHERE Id == @userIdCP");	
		q.AddParameter("userIdCP", "@ref[Catalog_User]:" + userIdCP);	
		bitmobileRoleRefCP = q.ExecuteScalar();
	}	
}

function GetDoneTasks(){
	var QText = "SELECT Count(*) " +
		"FROM Document_Waybill_Tasks AS WbT " +
		"WHERE IFNULL(WbT.StartTime,DATETIME('0001-01-01 00:00:00')) >= DATE('now','start of day') " +
		"AND IFNULL(WbT.StopTime,DATETIME('0001-01-01 00:00:00')) <=  DATETIME('now', 'start of day', '+1 day') " +
		"AND IFNULL(WbT.StopTimeFact,DATETIME('0001-01-01 00:00:00')) > '0001-01-01 00:00:00' "
		
	if(bitmobileRoleCP == 1){
		QText = QText + " AND Requestioner == @ThisUsr"
	}
	
	var q = new Query(QText);
	
	if(bitmobileRoleCP == 1){
		q.AddParameter("ThisUsr", bitmobileRoleRefCP);
	}
		
	return q.ExecuteScalar();
	
}

function GetTaskPlaned(){
	var QText = "SELECT Count(*) " +
		"FROM Document_Waybill_Tasks AS WbT " +
		"WHERE IFNULL(WbT.StartTime,DATETIME('0001-01-01 00:00:00')) >= DATE('now','start of day') " +
		"AND IFNULL(WbT.StopTime,DATETIME('0001-01-01 00:00:00')) <=  DATETIME('now', 'start of day', '+1 day') "
		
	if(bitmobileRoleCP == 1){
		QText = QText + " AND Requestioner == @ThisUsr"
	}
	
	var q = new Query(QText);
	
	if(bitmobileRoleCP == 1){
		q.AddParameter("ThisUsr", bitmobileRoleRefCP);
	}
	
		
	return q.ExecuteScalar();
	
}

function GetMalfunction(){
	var QText = "SELECT Count(*) " +
		"FROM Catalog_Technics_TechnicsStatus " +
		"WHERE Status = 'В ремонте' OR Status = 'Неисправно, запрещено к работе'"
		
	var q = new Query(QText);
		
	return q.ExecuteScalar();
	
}

function GetUsed(){
	var q = new Query("SELECT DISTINCT WB.Technics  FROM Document_Waybill WB " +
			"WHERE DATE(WB.PlannedStartDate) <= DATE('now', 'localtime') AND DATE(WB.PlannedEndDate) >= DATE('now', 'localtime') " +
			"");
	q.AddParameter("ThisTech", TechnicsID);
	
	CntUsedTech = q.ExecuteCount();
	
	return CntUsedTech;
	
}

function GetResidual(TaskPlaned, TaskDone){
	
	var a = TaskPlaned - TaskDone;
	
	return a;
	
}

