//-------------------------- Переменные контроллера

var tasksbeginDateCP;
var tasksendDateCP;
var TechnicsCP;
var CurWaybillCP;
var WaybillsCP;
var WaybillsCntCP;
var TechnicsDescriptionCP;
var TechnicsVRTCP;
var GSMsCP;
var GSMsCntCP;
var CurGSMCP;

//-------------------------- Переменные контроллера для экранов Task, TechTask, TaskFP
var sKUCP; 
var commentMemoCP; 
var startTimeTextCP; 
var stopTimeTextCP; 
var startTimeFactTextCP; 
var stopTimeFactTextCP; 

var technicsTypeCP
var technicsTypeTextCP
var sKUTextCP 
var constructionObjectCP 
var constructionObjectTextCP
var cntTextCP 
var operationModeTextCP 
var taskRequestionerCP

var backFromObject

var requestsCP

var userIdCP;
var bitmobileRoleCP
var bitmobileRoleRefCP
var ThatIsNewTaskCP



function OnLoad() {    
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


//-------------------------- Скрин Technics

function GetTechnics(searchText){
	
	var q = new Query("");
	
	var qtext = "SELECT Q.Id, Q.VehicleRegTag, Q.Description, Q.Status, Q.Info, Req.Description AS Requestioner, CO.Description AS ConstructionObject, CS.Description AS Task, Q.TaskString, " +
	"strftime('%d.%m.%Y %H:%M', Q.StartTime) AS StartTime, strftime('%d.%m.%Y %H:%M', Q.StopTime) AS StopTime, Q.StartTimeFact, Q.StopTimeFact " +
	"FROM (SELECT TECH.Id, TECH.VehicleRegTag, TT.Description, St.Status As Status, " +
	"(SELECT CASE WHEN NOT WN.Id IS NULL THEN 'Worked' WHEN WN.Id IS NULL AND NOT PN.Id IS NULL THEN 'Planned' ELSE 'PlannedNext' END) AS Info, " +
	"(SELECT CASE WHEN NOT WN.Id IS NULL THEN WN.Requestioner WHEN WN.Id IS NULL AND NOT PN.Id IS NULL THEN PN.Requestioner ELSE PNext.Requestioner END) AS Requestioner, " +
	"(SELECT CASE WHEN NOT WN.Id IS NULL THEN WN.ConstructionObject WHEN WN.Id IS NULL AND NOT PN.Id IS NULL THEN PN.ConstructionObject ELSE PNext.ConstructionObject END) AS ConstructionObject, " +
	"(SELECT CASE WHEN NOT WN.Id IS NULL THEN WN.Task WHEN WN.Id IS NULL AND NOT PN.Id IS NULL THEN PN.Task ELSE PNext.Task END) AS Task, " +
	"(SELECT CASE WHEN NOT WN.Id IS NULL THEN WN.TaskString WHEN WN.Id IS NULL AND NOT PN.Id IS NULL THEN PN.TaskString ELSE PNext.TaskString END) AS TaskString, " +
	"(SELECT CASE WHEN NOT WN.Id IS NULL THEN WN.StartTime WHEN WN.Id IS NULL AND NOT PN.Id IS NULL THEN PN.StartTime ELSE PNext.StartTime END) AS StartTime, " +
	"(SELECT CASE WHEN NOT WN.Id IS NULL THEN WN.StopTime WHEN WN.Id IS NULL AND NOT PN.Id IS NULL THEN PN.StopTime ELSE PNext.StopTime END) StopTime, " +
	"(SELECT CASE WHEN NOT WN.Id IS NULL THEN WN.StartTimeFact WHEN WN.Id IS NULL AND NOT PN.Id IS NULL THEN PN.StartTimeFact ELSE PNext.StartTimeFact END) StartTimeFact, " +
	"(SELECT CASE WHEN NOT WN.Id IS NULL THEN WN.StopTime WHEN WN.Id IS NULL AND NOT PN.Id IS NULL THEN PN.StopTimeFact ELSE PNext.StopTimeFact END) StopTimeFact " +
	"FROM Catalog_Technics TECH JOIN Catalog_TechnicsTypes TT ON TECH.TechnicsTypes = TT.Id LEFT JOIN " +
	"(SELECT WBT.Id, Wb.Technics, WbT.Requestioner, WbT.ConstructionObject, WbT.Task, WbT.TaskString, WbT.StartTime, WbT.StopTime, " +
	"WbT.StartTimeFact, WbT.StopTimeFact FROM Document_Waybill_Tasks WbT LEFT JOIN Document_Waybill Wb " +
	"ON WbT.Ref = Wb.Id WHERE WbT.StartTime <= DATETIME('Now', 'localtime') AND WbT.StopTime >= DATETIME('Now', 'localtime') AND WbT.StopTimeFact = '0001-01-01 00:00:00' GROUP BY Wb.Technics) " +
	"AS PN ON PN.Technics = TECH.ID LEFT JOIN " +
	"(SELECT WBT.Id, Wb.Technics, WbT.Requestioner, WbT.ConstructionObject, WbT.Task, WbT.TaskString, WbT.StartTime, WbT.StopTime, " +
	"WbT.StartTimeFact, WbT.StopTimeFact FROM Document_Waybill_Tasks WbT LEFT JOIN Document_Waybill Wb ON WbT.Ref = Wb.Id " +
	"WHERE WbT.StartTimeFact > '0001-01-01 00:00:00' AND WbT.StopTimeFact = '0001-01-01 00:00:00' GROUP BY Wb.Technics) AS WN ON WN.Technics = TECH.ID " +
	"LEFT JOIN (SELECT WbT.Id, Wb.Technics, WbT.Requestioner, WbT.ConstructionObject, WbT.Task, WbT.TaskString, Min(WbT.StartTime) AS StartTime, WbT.StopTime, WbT.StartTimeFact, " +
	"WbT.StopTimeFact FROM Document_Waybill_Tasks WbT LEFT JOIN Document_Waybill Wb ON WbT.Ref = Wb.Id WHERE WbT.StartTime >= DATETIME('Now', 'localtime') GROUP BY Wb.Technics) " +
	"AS PNext ON TECH.Id = PNext.Technics LEFT JOIN Catalog_Technics_TechnicsStatus AS St ON St.Ref = TECH.Id) AS Q LEFT JOIN Catalog_SKU AS CS ON Q.Task = CS.Id " +
	"LEFT JOIN Catalog_ConstructionObjects AS CO ON Q.ConstructionObject = CO.Id LEFT JOIN Catalog_Requesters AS Req ON Q.Requestioner = Req.Id";
		
	if (searchText != "" && searchText != null) {
		var plus = " WHERE (Contains(Q.VehicleRegTag, @st)) OR (Contains(Q.Description, @st))";
		qtext = qtext + plus;
		q.AddParameter("st", searchText);
	}
	
	var textOrd = " ORDER BY Q.Description";
	
	q.Text = qtext + textOrd;
	return q.Execute().Unload();		
}

function GetTechnicsCount(result){
	return result.Count();
}

function GetParam2(param2){
	
	if(tasksbeginDateCP == null){
		var fike;	
		if(param2 != null){
			fike = param2;			
		}else{
			var mth = "";
			if (DateTime.Now.Month < 10){
				mth = "0"+ DateTime.Now.Month;
			} else {
				mth = DateTime.Now.Month;
			}
			fike = "01." + mth + "." + DateTime.Now.Year + " 00:00:00";
		}
		
		tasksbeginDateCP = fike;
		return tasksbeginDateCP
	}else{
		return tasksbeginDateCP;
	}
		
}

function GetParam3(param3){
	if(tasksendDateCP == null){
		var fike		
		if(param3 != null){
			fike = param3;	
		}else{
			 var mth = "";
			 if (DateTime.Now.Month < 10){
				 mth = "0"+ DateTime.Now.Month;
			 } else {
				 mth = DateTime.Now.Month;
			 }
			 fike = DateTime.DaysInMonth(DateTime.Now.Year, DateTime.Now.Month) + "." + mth + "." + DateTime.Now.Year + " 00:00:00";
		}
		tasksendDateCP = fike;
		return tasksendDateCP;
	}else{
		return tasksendDateCP;
	}
}

function AddPeremAndDoAction(TechnicsID, TechDescription, TechVRT){
	TechnicsCP = TechnicsID; // запишем в переменную модуля ID
	TechnicsDescriptionCP = TechDescription;
	TechnicsVRTCP = TechVRT;
	
	var q = new Query("SELECT WB.Id, WB.Number, WB.PlannedStartDate, WB.PlannedEndDate  FROM Document_Waybill WB " +
			"WHERE DATE(WB.PlannedStartDate) <= DATE('now', 'localtime') AND DATE(WB.PlannedEndDate) >= DATE('now', 'localtime') " +
			"AND WB.Technics = @ThisTech");
	q.AddParameter("ThisTech", TechnicsID);
	
	WaybillsCP = q.Execute().Unload();
	
	WaybillsCntCP = WaybillsCP.Count();
	
	if(WaybillsCntCP == 1){
		
		WaybillsCP.First();
		WaybillsCP.Next();
		
		CurWaybillCP = WaybillsCP.Id;
		
		Workflow.Action("Waybill", []);	
	}else{
		
		Workflow.Action("Waybills", []);
	}
	
	 
}

//-------------------------- Скрин Waybill
function MyStartTracking() {
	GPS.StartTracking();
	return;
}

function GetCurWaybillInfo(){
	
	q = new Query("SELECT WBR.Role, PP.Description AS PhysicalPersons " +
			"FROM Document_Waybill_Responsibles WBR LEFT JOIN Catalog_PhysicalPersons PP ON WBR.PhysicalPersons = PP.Id " +
			"WHERE WBR.Ref = @ThisWaybill");
	
	q.AddParameter("ThisWaybill", CurWaybillCP);
	
	return q.Execute().Unload();

}

function GetTechTasks(){
	
	sKUCP = null; 
	commentMemoCP = null; 
	startTimeTextCP = null; 
	stopTimeTextCP = null; 
	startTimeFactTextCP = null; 
	stopTimeFactTextCP = null; 

	technicsTypeCP = null;
	technicsTypeTextCP = null;
	sKUTextCP = null; 
	cntTextCP = null; 
	operationModeTextCP = null; 

	requestsCP = null;
	constructionObjectCP = null;
	constructionObjectTextCP = null;
	
	backFromObject = false;
	
	
	
	q = new Query("SELECT WBT.Id, Req.Description AS Requestioner, strftime('%H:%M', WBT.StartTime) AS StartTime, WBT.StartTime AS StartDateTime, S.Description AS Task, WBT.TaskString, " +
			"strftime('%H:%M', WBT.StopTime) AS StopTime, strftime('%H:%M', WBT.StartTimeFact) AS StartTimeFact, strftime('%H:%M', WBT.StopTimeFact) AS StopTimeFact, CO.Description AS CODescription " +
			"FROM Document_Waybill_Tasks WBT LEFT JOIN Catalog_ConstructionObjects CO ON WBT.ConstructionObject = CO.Id " +
			"LEFT JOIN Catalog_SKU AS S ON WBT.Task = S.Id LEFT JOIN Catalog_Requesters AS Req ON WBT.Requestioner = Req.Id " +
			"WHERE WBT.Ref = @ThisWaybill");
	
	q.AddParameter("ThisWaybill", CurWaybillCP);
	
	return q.Execute().Unload();
}

function GetCntTasks(TechTasks){
	var z = TechTasks.Count();
	if(z>1){
		
	}else{
		
	}
	return TechTasks.Count();
}

function OpenWaybillWf(WaybillID){
	CurWaybillCP = WaybillID;
	Workflow.Action("Waybill", []);
}

function OpenGSM(){
	
	var q = new Query("SELECT TG.SKU, CG.Description AS GSM FROM Catalog_Technics_GSM TG LEFT JOIN Catalog_SKU CG ON TG.SKU = CG.Id " +
			"WHERE TG.Ref = @ThisTech");
	q.AddParameter("ThisTech", TechnicsCP);
	
	GSMsCP = q.Execute().Unload();
	
	GSMsCntCP = GSMsCP.Count();
	
	if(GSMsCntCP == 1){
		
		GSMsCP.First();
		GSMsCP.Next();
		
		CurGSMCP = GSMsCP.SKU;
		
		Workflow.Action("GSM", []);	
	}else{
		
		Workflow.Action("GSMs", []);
	}
	
	 
}

//-------------------------- Скрин TechTask
function RecPeremCPAndDoActionMachin(taskId){
	//ThatIsNewTaskCP = false;
	//if(taskId == null){
		 // создание документа Task
		//var T = DB.Create("Document.Waybill_Tasks");
		//T.Ref = CurWaybillCP;
		//T.Requestioner = forepersonCP;
		//T.Save(false);		
		//taskId = T.Id;
		//ThatIsNewTaskCP = true;
	//}
	
	var q = new Query("SELECT T.Id, T.Adress, T.StartTime, T.StopTime, T.OperationTime, S.Id AS SKUId, S.Description AS SKU, " +
			"T.TaskString, T.Comment, T.StartTimeFact, T.StopTimeFact, T.Requestioner, " +
			"O.Description AS ConstructionObject, T.ConstructionObject AS ConstructionObjectId " +
			"FROM Document_Waybill_Tasks T " +
			"LEFT JOIN Catalog_SKU S ON S.Id = T.Task " +
			"LEFT JOIN Catalog_ConstructionObjects O ON O.Id = T.ConstructionObject " +
			"WHERE T.Id = @taskId");
	
	q.AddParameter("taskId", taskId);	
	qq = q.Execute();		
	
	if(qq.Next()){
		sKUCP = qq.SKUId; 
		constructionObjectCP = qq.ConstructionObjectId; 
		
		sKUTextCP = qq.SKU; 
		constructionObjectTextCP = qq.ConstructionObject;
		 
		startTimeTextCP = qq.StartTime; 
		stopTimeTextCP = qq.StopTime; 		
		startTimeFactTextCP = qq.StartTimeFact; 
		stopTimeFactTextCP = qq.StopTimeFact;
		
		
		commentMemoCP = qq.Comment;
		
		taskRequestionerCP = qq.Requestioner;
		if(taskRequestionerCP == "@ref[Catalog_Requesters]:00000000-0000-0000-0000-000000000000"){
			taskRequestionerCP = null;
		}
				
	}else{	
		sKUCP = null; 
		constructionObjectCP = null; 
		
		sKUTextCP = null; 
		constructionObjectTextCP = null;
		 
		startTimeTextCP = null; 
		stopTimeTextCP = null; 		
		StartTimeFactTextCP = null; 
		StopTimeFactTextCP = null;
		
		commentMemoCP = null;
		
		taskRequestionerCP = null;
	}
	
	Workflow.Action("TechTask", [taskId]);
}

function CheckingCoordinates(taskId){
	var location = GPS.CurrentLocation;
    if (location.NotEmpty) {
    	var latitudeNow = location.Latitude;
    	var longitudeNow = location.Longitude;
    	
    	var q = new Query("SELECT O.TopLeftX, O.TopLeftY, O.BottomRightX, O.BottomRightY FROM Catalog_ConstructionObjects O " +
    			"LEFT JOIN Document_Waybill_Tasks T ON T.ConstructionObject = O.Id WHERE T.Id == @taskId");
		q.AddParameter("taskId", taskId);
		var LL = q.Execute();
    	
		if (LL.Next()) {
			if (LL.TopLeftX != null && LL.TopLeftY != null && LL.BottomRightX != null && LL.BottomRightY != null && parseFloat(LL.TopLeftX) != 0 && parseFloat(LL.TopLeftY != 0) && parseFloat(LL.BottomRightX) != 0 && parseFloat(LL.BottomRightY != 0)) {
				if (latitudeNow != null && longitudeNow != null) {
	    			
					//расположение точек проверяемого квадрата
					//1 - 2
					//3 - 4
					
					var latitude1 = LL.TopLeftX;
					var longitude1 = LL.TopLeftY;
					
					var latitude2 = LL.BottomRightX;
					var longitude2 = LL.TopLeftY;
					
					var latitude3 = LL.TopLeftX;
					var longitude3 = LL.BottomRightY;
					
					var latitude4 = LL.BottomRightX;
					var longitude4 = LL.BottomRightY;
					
					var massTrue = false;
					
					// определяем вхождение по широте
					var deltaLatitude = latitude1 - latitudeNow;
					if(deltaLatitude <= 0) {
						deltaLatitude = latitudeNow - latitude2;
					}
															
					if(deltaLatitude > 0){
						if(deltaLatitude > 0.00048){
			        		var deltaLatitudeMeter = Math.round(deltaLatitude*31/0.0001); 	
			        		massTrue = true;
			        	}
					}
	    			
					// определяем вхождение по долготе
	    			var deltaLongitude = longitude3 - longitudeNow;
	    			if(deltaLongitude <= 0){
	    				deltaLongitude = longitudeNow - longitude1;
					}
					
					if(deltaLongitude > 0){
						if(deltaLongitude > 0.00083){
		    				var deltaLongitudeMeter = Math.round(deltaLongitude*18/0.0001); 	
		    				massTrue = true;
			        	}
					}
					
					if(massTrue == true){
						if (deltaLatitudeMeter > deltaLongitudeMeter) {
		    				var deltaInDialog = deltaLatitudeMeter;
		    			}else{
		    				var deltaInDialog = deltaLongitudeMeter;
		    			}
		    			
		    			Dialog.Debug("Внимание! Вы находитесь далеко от объекта!");// + deltaInDialog + " метров");
					}			
						    			
				}else{
					Dialog.Debug("Координаты начала работы не определены.");
				}
			}
		}
    }
}

function GetTask(taskId){
		
	var q = new Query("SELECT T.Id, T.Adress, T.StartTime, T.StopTime, T.OperationTime, S.Id AS SKUId, S.Description AS SKU, " +
			"T.TaskString, T.Comment, T.StartTimeFact, T.StopTimeFact, T.Requestioner, O.Description AS ConstructionObject " +
			"FROM Document_Waybill_Tasks T " +
			"LEFT JOIN Catalog_SKU S ON S.Id = T.Task " +
			"LEFT JOIN Catalog_ConstructionObjects O ON O.Id = T.ConstructionObject " +
			"WHERE T.Id = @taskId");
	
	q.AddParameter("taskId", taskId);	
	qq = q.Execute();
	
	
	if(backFromObject == false){
		
		if(qq.Next()){
			
		}
		return qq
	}	
}

function SaveTask(taskId, typeSave){
	//CreateMachinTask 1
	//EditMachinTask 2
	//Edit1cTask 3
	
	var atribNull = null;
	var startTimeatribNull = null;
	var stopTimeatribNull = null;
		
	if(typeSave == "1"){
				
		if(sKUCP == null){
			atribNull = 1;		
		}
		
		if(constructionObjectCP == null){
			atribNull = 1;		
		}
		
//		if(commentMemoCP == null){
//			var fds = 1;// просто так
//		}else{
//			task.Adress = Variables["AdressText"].Text;
//		}
				
		var startTimeValue = Variables["StartTimeFactText"].Text;
		if(startTimeValue == null){
			startTimeatribNull = 1;		
		}else{
			if(TrimAll(startTimeValue) == "-"){
				startTimeatribNull = 1;			
			}
		}
		
		var stopTimeValue = Variables["StopTimeFactText"].Text;
		if(stopTimeValue == null){
			stopTimeatribNull = 1;		
		}else{
			if(TrimAll(stopTimeValue) == "-"){
				stopTimeatribNull = 1;			
			}
		}
		
		if(commentMemoCP == null){
			var fds = 1;// просто так
		}
		
		if(stopTimeatribNull != 1){
			if(startTimeatribNull == 1){
				Dialog.Message("Нельзя установить время окончания, если не указано время начала");
			}else{
				if(atribNull != null){
					Dialog.Message("Не все поля заполнены");			
				}else{
					EditTask(taskId);
				} 
			}
		}else{
			if(atribNull != null){
				Dialog.Message("Не все поля заполнены");			
			}else{
				EditTask(taskId);
			}		
		}						
		   
	}else if(typeSave == "2"){
		
		if(sKUCP == null){
			atribNull = 1;		
		}
		
		if(constructionObjectCP == null){
			atribNull = 1;		
		}
				
		var startTimeValue = Variables["StartTimeFactText"].Text;
						
		if(startTimeValue == null){
			startTimeatribNull = 1;		
		}else if(startTimeValue == '0001-01-01 00:00:00'){
			startTimeatribNull = 1;
		}else{
			if(TrimAll(startTimeValue) == "-"){
				startTimeatribNull = 1;			
			}
		}
		
		var stopTimeValue = Variables["StopTimeFactText"].Text;
		if(stopTimeValue == null){
			stopTimeatribNull = 1;		
		}else{
			if(TrimAll(stopTimeValue) == "-"){
				stopTimeatribNull = 1;			
			}
		}
		
		if(commentMemoCP == null){
			var fds = 1;// просто так
		}
		
		if(stopTimeatribNull != 1){
			if(startTimeatribNull == 1){
				Dialog.Message("Нельзя установить время окончания, если не указано время начала");
			}else{
				if(atribNull != null){
					Dialog.Message("Не все поля заполнены");			
				}else{
					EditTask(taskId);
				} 
			}
		}else{
			if(atribNull != null){
				Dialog.Message("Не все поля заполнены");			
			}else{
				EditTask(taskId);
			}		
		}
						
	}else if(typeSave == "3"){
		
		var startTimeValue = Variables["StartTimeFactText"].Text;
		if(startTimeValue == null){
			startTimeatribNull = 1;		
		}else{
			if(TrimAll(startTimeValue) == "-"){
				startTimeatribNull = 1;			
			}
		}
		
		var stopTimeValue = Variables["StopTimeFactText"].Text;
		if(stopTimeValue == null){
			stopTimeatribNull = 1;		
		}else{
			if(TrimAll(stopTimeValue) == "-"){
				stopTimeatribNull = 1;			
			}
		}
		
		if(stopTimeatribNull != 1){
			if(startTimeatribNull == 1){
				Dialog.Message("Нельзя установить время окончания, если не указано время начала");
			}else{
				if(atribNull != null){
					Dialog.Message("Не все поля заполнены");			
				}else{
					var task = taskId.GetObject();		
					startTimeFactTextCP = String.Format("{0:HH:mm}", startTimeValue)
					task.StartTimeFact = startTimeFactTextCP;
					
					stopTimeFactTextCP = String.Format("{0:HH:mm}", stopTimeValue)
					task.StopTimeFact = stopTimeFactTextCP;
					
					task.Save(false);
					Workflow.Back();
				} 
			}
		}else{
			if(atribNull != null){
				Dialog.Message("Не все поля заполнены");			
			}else{
				var task = taskId.GetObject();		
				startTimeFactTextCP = String.Format("{0:HH:mm}", startTimeValue)
				task.StartTimeFact = startTimeFactTextCP;
				
				stopTimeFactTextCP = String.Format("{0:HH:mm}", stopTimeValue)
				task.StopTimeFact = stopTimeFactTextCP;
				
				task.Save(false);
				Workflow.Back();
			}		
		}
	}
	
		 
}

function EditTask(taskId) {
	if(taskId == null){
		// создание документа Task
		var T = DB.Create("Document.Waybill_Tasks");
		T.Ref = CurWaybillCP;
		//T.Requestioner = forepersonCP;
		T.Save();		
		taskId = T.Id;
	}		
	
	var task = taskId.GetObject();		
	task.Task = sKUCP;
	task.ConstructionObject = constructionObjectCP;
	
	startTimeFactTextCP = String.Format("{0:HH:mm}", startTimeValue)
	task.StartTimeFact = startTimeFactTextCP;
	task.StartTime = startTimeFactTextCP;
	
	stopTimeFactTextCP = String.Format("{0:HH:mm}", stopTimeValue)
	task.StopTimeFact = stopTimeFactTextCP;
	task.StopTime = stopTimeFactTextCP;
	
	task.Comment = commentMemoCP;
	
	task.Save(false);
	Workflow.Back();
}

function MyDoSelectSKU(control) {
           
    var query = new Query();
        
    query.Text = "SELECT Id, Description FROM Catalog_SKU WHERE Service == 1 ORDER BY Description";
        
    Dialog.Select("#select_answer#", query.Execute(), DoSelectSKUCallback1, [control]);
            
    return;
}

function DoSelectSKUCallback1(key, args) {
	
	var control = args[0];
    
    control.Text = key.Description;
    
    sKUCP = key;
        
    return;
}

function SetTime(timeText, timeValueText, entity, attribute) {
	
	var caption = Translate["#enterDateTime#"];
	
	var timeValue = Variables[timeValueText].Text;
	//Console.WriteLine(timeValue);
	
	if(timeValue == null){
		Dialog.Time(caption, SetTimeNow, [timeText, entity, attribute]);
	}else{
		if(TrimAll(timeValue) == "-"){
			Dialog.Time(caption, SetTimeNow, [timeText, entity, attribute]);
		}else{
			Dialog.Time(caption, timeValue, SetTimeNow, [timeText, entity, attribute]);
		}
	}
}

function SetTimeNow(state, args) {
	var timeText = state[0];
	var entity = state[1];
	var attribute = state[2];
			
	strArgsResult = String.Format("{0:HH:mm}", args.Result);
	
	if(strArgsResult == "00:00"){
		strArgsResult = "23:59";
	}
	
	if(attribute == "StartTimeFact"){
		startTimeFactTextCP = strArgsResult;		
    }
	
	if(attribute == "StopTimeFact"){
		stopTimeFactTextCP = strArgsResult;    	
    }
	
	if(attribute == "StartTime"){
		startTimeTextCP = strArgsResult;		
    }
	
	if(attribute == "StopTime"){
		stopTimeTextCP = strArgsResult;    	
    }
	
	timeText.Text = strArgsResult;
	
	if(entity != null){
		CheckingCoordinates(entity);
	}
	
	return
}

function CommentMemoEdit(){
	commentMemoCP = Variables["commentMemo"].Text;
}



//-------------------------- Скрин TaskFP

function RecPeremCPAndDoAction(){
		
	// создание документа Request
	var RQ = DB.Create("Document.Request");
	RQ.Posted = 0;
	RQ.DeletionMark = 0;
	RQ.Date = DateTime.Now;
	RQ.EnumTechnicsStatus = DB.Current.Constant.EnumTechnicsStatus.AtApproval;
	RQ.Requester = bitmobileRoleRefCP;
	//RQ.Requester = requester;
			
	RQ.Save(false);
	requestsCP = RQ.Id;
	
	
	var q = new Query("SELECT TT.Id FROM Catalog_TechnicsTypes TT " +
			"LEFT JOIN Catalog_Technics T ON T.TechnicsTypes = TT.Id " +
			"LEFT JOIN Document_Waybill W ON W.Technics = T.Id " +
			"WHERE W.Id == @CurWaybillCP");	
	q.AddParameter("CurWaybillCP", CurWaybillCP);
	var technicsType = q.ExecuteScalar();
	
	// создание документа Task
	var T = DB.Create("Document.Request_Task");
	T.Posted = 0;
	T.Ref = requestsCP;
	T.TechnicsType = technicsType;
	T.Count = 1;
	T.Save(false);
	
	var	curTaskId = T.Id;
		
	var q = new Query("SELECT T.Id, T.OperationMode, T.StartTime, T.StopTime, T.Note, T.Count AS Cnt, " +
			"O.Id AS ConstructionObjectId, O.Description AS ConstructionObject, TT.Id AS TechnicsTypeId, TT.Description AS TechnicsType, SKU.Id AS SKUId, SKU.Description AS SKU " +
			"FROM Document_Request_Task T " +
			"LEFT JOIN Catalog_ConstructionObjects O ON O.Id = T.ConstructionObject " +
			"LEFT JOIN Catalog_TechnicsTypes TT ON TT.Id = T.TechnicsType " +
			"LEFT JOIN Catalog_SKU SKU ON SKU.Id = T.SKU  " +
			"WHERE T.Id == @curTaskId");
	
	q.AddParameter("curTaskId", curTaskId);
	var qq = q.Execute();		
	
	if(qq.Next()){
		technicsTypeCP = qq.TechnicsTypeId;
		sKUCP = qq.SKUId; 
		constructionObjectCP = qq.ConstructionObjectId; 
		
		technicsTypeTextCP = qq.TechnicsType;
		sKUTextCP = qq.SKU; 
		constructionObjectTextCP = qq.ConstructionObject;
		 
		startTimeTextCP = qq.StartTime; 
		stopTimeTextCP = qq.StopTime; 
		operationModeTextCP = qq.OperationMode;
		cntTextCP = qq.Cnt;
		commentMemoCP = qq.Note;
	}else{	
		technicsTypeCP = null;
		sKUCP = null; 
		constructionObjectCP = null; 
		
		technicsTypeTextCP = null;
		sKUTextCP = null; 
		constructionObjectTextCP = null;
		
		cntTextCP = null; 
		startTimeTextCP = null; 
		stopTimeTextCP = null; 
		operationModeTextCP = null; 
		commentMemoCP = null;
	}
	
	Workflow.Action("TaskFromForeperson", [curTaskId]);
}

function SaveTaskFP(taskId){
	var task = taskId.GetObject();
		
	var atribNull = null;
	
//	if(technicsTypeCP == null){
//		atribNull = 1;		
//	}else{
//		task.TechnicsType = technicsTypeCP;
//	}
	
//	if(cntTextCP == null){
//		atribNull = 1;		
//	}else{
//		if(cntTextCP == ""){
//			atribNull = 1;			
//		}else{
//			if(cntTextCP == 0){
//				atribNull = 1;				
//			}else{
//				task.Count = cntTextCP;
//			}
//		}
//	}
	
	if(sKUCP == null){
		atribNull = 1;		
	}else{	
		task.SKU = sKUCP;
	}	
	
	if(constructionObjectCP == null){
		atribNull = 1;		
	}else{
		//Dialog.Debug(constructionObjectCP);
		task.ConstructionObject = constructionObjectCP;
	}
	
	if(startTimeTextCP == null){
		atribNull = 1;		
	}else{
		if(TrimAll(startTimeTextCP) == "-"){
			atribNull = 1;			
		}else{
			task.StartTime = startTimeTextCP;
		}
	}
	
	if(stopTimeTextCP == null){
		atribNull = 1;		
	}else{
		if(TrimAll(stopTimeTextCP) == "-"){
			atribNull = 1;			
		}else{
			task.StopTime = stopTimeTextCP;
		}
	}
	
	if(operationModeTextCP == null){
		atribNull = 1;		
	}else{
		if(IsBlankString(operationModeTextCP)){
			atribNull = 1;			
		}else{
			task.OperationMode = operationModeTextCP;
		}
	}
	
	if(commentMemoCP == null){
		var fds = 1;// просто так
	}else{
		task.Note = commentMemoCP;
	}

	
	if(atribNull != null){
		Dialog.Message("Не все поля заполнены");
	}else{
		//Dialog.Debug(forepersonCP);
		task.Save(false);
		Workflow.Back();
		Dialog.Message("Заявка будет передана на рассмотрение при синхронизации");
	}    
}

function CanselTaskFP(taskId){
	
	DB.Delete(taskId);
	DB.Delete(requestsCP);	
	Workflow.Back();
}

function MyDoSelect(entity, attribute, control) {
  var tableName = entity[attribute].Metadata().TableName;
      
  var query = new Query();
      
  if(tableName == "Catalog_SKU"){
  	query.Text = "SELECT Id, Description FROM " + tableName + " WHERE Service == 1 ORDER BY Description";
  }else{
  	query.Text = "SELECT Id, Description FROM " + tableName + " ORDER BY Description";
  } 
  
  Dialog.Select("#select_answer#", query.Execute(), TechnicsTypeDoSelectCallback1, [entity, attribute, control]);
          
  return;
}

function TechnicsTypeDoSelectCallback1(key, args) {
	
	var entity = args[0];
	var attribute = args[1];
  var control = args[2];
  
  control.Text = key.Description;
  
  if(attribute == "TechnicsType"){
  	technicsTypeCP = key;
  	technicsTypeTextCP = key.Description;
  }
  if(attribute == "SKU"){
  	sKUCP = key;
  	sKUTextCP = key.Description;
  }
  if(attribute == "ConstructionObject"){
  	constructionObjectCP = key;
  	constructionObjectTextCP = key.Description;
  }
  
//  var task = entity.GetObject();
//  
//  task[attribute] = key;
//  task.Save();
  
  return;
}

function OperationModeEdit(){
	operationModeTextCP = Variables["operationModeText"].Text;
}



//-------------------------- Скрин ConstructionObjectsList

function GetObjs(searchText){
//	var q = new Query("SELECT Id, Description, Code FROM Catalog_ConstructionObjects WHERE DeletionMark = 0 ORDER BY Description");		
//	return q.Execute().Unload();
	
	var q = new Query();
	
	var qtext = "SELECT Id, Description, Code FROM Catalog_ConstructionObjects WHERE DeletionMark = 0";
			
	if (searchText != "" && searchText != null) {
		var plus = " AND (Contains(Description, @st)) ";
		qtext = qtext + plus;
		q.AddParameter("st", searchText);
	}
	
	var textOrd = " ORDER BY Description";
	
	q.Text = qtext + textOrd;
	return q.Execute().Unload();
	
}

function GetObjsCount(result){
	return result.Count();
}

function SetObj(objId, Description){
	constructionObjectCP = objId;
	constructionObjectTextCP = Description;
	
	backFromObject = true;
	
	Workflow.Back();
}





//-------------------------- Скрин GSMs

function OpenGSMWf(GSMID){
	Workflow.Action("GSM", []);
}

//-------------------------- Скрин GSM

function GetFills(){
	
	var q = new Query("SELECT F.Id AS Id, FT.Id AS RowId, strftime('%H:%M', F.Date) AS Date, FT.Cnt " +
			"FROM Document_Fill_Technics FT LEFT JOIN Document_Fill F " +
			"ON FT.Ref = F.Id " +
			"WHERE FT.GSM = @ThisGSM AND FT.Waybill = @ThisWaybill AND FT.Tech = @ThisTech");
	q.AddParameter("ThisGSM", CurGSMCP);
	q.AddParameter("ThisWaybill", CurWaybillCP);
	q.AddParameter("ThisTech", TechnicsCP);
	
 	return q.Execute().Unload();

}

function GetGSMStartingCnt(){
	
	var q = new Query("SELECT WbGs.BalanceOut GSMCount " +
			"FROM document_waybill_gsmbalance AS WbGs " +
			"LEFT JOIN document_waybill AS Wb ON WbGs.Ref = Wb.Id " +
			"WHERE WbGs.SKU = @ThisGSM AND Wb.Technics = @ThisTech AND Wb.Id = @ThisWb");
	q.AddParameter("ThisWb", CurWaybillCP);
	q.AddParameter("ThisGSM", CurGSMCP);
	q.AddParameter("ThisTech", TechnicsCP);
	
	return q.ExecuteScalar();

}

function GetGSMFinishingCnt(){
	
	var q = new Query("SELECT WbGs.Id, WbGs.BalanceIn GSMCount " +
			"FROM document_waybill_gsmbalance AS WbGs " +
			"LEFT JOIN document_waybill AS Wb ON WbGs.Ref = Wb.Id " +
			"WHERE WbGs.SKU = @ThisGSM AND Wb.Technics = @ThisTech AND Wb.Id = @ThisWb");
	q.AddParameter("ThisWb", CurWaybillCP);
	q.AddParameter("ThisGSM", CurGSMCP);
	q.AddParameter("ThisTech", TechnicsCP);
	
	Rs = q.Execute().Unload();
	
	//Rs.First();
	
	Rs.Next();
	
 	return Rs;
	
}

function SetGSMBalance(RowId){
	
	var Cnt = ToDecimal(Variables["cntText"].Text);
	
	GSMBalanceObj = RowId.GetObject();
	GSMBalanceObj.BalanceIn = Cnt;
	GSMBalanceObj.Save();
	
	Workflow.Commit();
	
}

function GetCntFills(Fills){
	return Fills.Count();
}

//-------------------------- Скрин Fills
function GetCurTime(){
	return DateTime.Now;
}

function SaveFill(){
	
	var cnt = ToDecimal(Variables["cntText"].Text);
	
	if (cnt !== 0){
		var FO = DB.Create("Document.Fill");
		FO.Posted = 0;
		FO.DeletionMark = 0;
		FO.Date = String.Format("{0:dd/MM/yy}", DateTime.Now) + ' ' + Variables["StartTimeText"].Text;
		FO.Save(false);
		
		var FTO = DB.Create("Document.Fill_Technics");
		FTO.Ref = FO.Id;
		FTO.Tech = TechnicsCP;
		FTO.PhisicalPerson = bitmobileRoleRefCP;
		FTO.GSM = CurGSMCP;
		FTO.Cnt = cnt;
		FTO.Waybill = CurWaybillCP;
		FTO.Save(false);
		
		Workflow.Back();
		
	}else{
		Dialog.Debug(cnt);
		Dialog.Debug("Не все поля заполнены!");
	}
}

function GetCurTime(){
	return DateTime.Now;
	
}

//--------------------------ОБЩАЯ ФУНЦИЯ ДЛЯ ИТЕРАТОРОВ
function restartItr(Itr){
	Itr.First();
}

//--------------------------ОБЩАЯ ФУНЦИЯ ДЛЯ ТЕСТОВ

function Test(p){
	Dialog.Debug(p);
	return p;
}


//--------------------------ОБЩАЯ ФОРМАТ ДАТА ВРЕМЯ

function ConvertDate(tskDate){
	if(tskDate != null && tskDate != 0){
		var t = String.Format("{0:dd/MM/yy HH:mm}", DateTime.Parse(tskDate));
		return t;
	}else{
		var t = "Время не указано";
		return t;
	}
}

function GetTime(Period)
{	
	FillTimeCP = Period;
	
	if(Period == '0001-01-01 00:00:00'){
		return "-";
	}else if(Period != null){
		var s = String.Format("{0:HH:mm}", DateTime.Parse(Period));
		return s;
	}else{
		return "-";
	}
}

//--------------------------ОБЩАЯ ФОРМАТ ДАТА

function GetDate_ddMMyy(Period)
{
	var s = String.Format("{0:dd/MM/yy}", DateTime.Parse(Period));
	return s;
}
