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


//-------------------------- Переменные контроллера для экранов Task и TechTask
var sKUCP; 
var commentMemoCP; 
var startTimeTextCP; 
var stopTimeTextCP; 
var startTimeFactTextCP; 
var stopTimeFactTextCP; 


var userIdCP;
var bitmobileRoleCP
var bitmobileRoleRefCP




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
	
	var qtext = "SELECT Q.Id, Q.VehicleRegTag, Q.Description, Q.Status, Q.Info, Q.Requestioner, CO.Description AS ConstructionObject, CS.Description AS Task, Q.TaskString, Q.StartTime, Q.StopTime, Q.StartTimeFact, Q.StopTimeFact " +
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
	"ON WbT.Ref = Wb.Id WHERE WbT.StartTime <= DATETIME('Now', 'localtime') AND WbT.StopTime >= DATETIME('Now', 'localtime') GROUP BY Wb.Technics) " +
	"AS PN ON PN.Technics = TECH.ID LEFT JOIN " +
	"(SELECT WBT.Id, Wb.Technics, WbT.Requestioner, WbT.ConstructionObject, WbT.Task, WbT.TaskString, WbT.StartTime, WbT.StopTime, " +
	"WbT.StartTimeFact, WbT.StopTimeFact FROM Document_Waybill_Tasks WbT LEFT JOIN Document_Waybill Wb ON WbT.Ref = Wb.Id " +
	"WHERE WbT.StartTimeFact > '0001-01-01 00:00:00' AND WbT.StopTimeFact = '0001-01-01 00:00:00' GROUP BY Wb.Technics) AS WN ON WN.Technics = TECH.ID " +
	"LEFT JOIN (SELECT WbT.Id, Wb.Technics, WbT.Requestioner, WbT.ConstructionObject, WbT.Task, WbT.TaskString, Min(WbT.StartTime) AS StartTime, WbT.StopTime, WbT.StartTimeFact, " +
	"WbT.StopTimeFact FROM Document_Waybill_Tasks WbT LEFT JOIN Document_Waybill Wb ON WbT.Ref = Wb.Id WHERE WbT.StartTime >= DATETIME('Now', 'localtime') GROUP BY Wb.Technics) " +
	"AS PNext ON TECH.Id = PNext.Technics LEFT JOIN Catalog_Technics_TechnicsStatus AS St ON St.Ref = TECH.Id) AS Q LEFT JOIN Catalog_SKU AS CS ON Q.Task = CS.Id " +
	"LEFT JOIN Catalog_ConstructionObjects AS CO ON Q.ConstructionObject = CO.Id";
		
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
function GetCurWaybillInfo(){
	
	q = new Query("SELECT WBR.Role, PP.Description AS PhysicalPersons " +
			"FROM Document_Waybill_Responsibles WBR LEFT JOIN Catalog_PhysicalPersons PP ON WBR.PhysicalPersons = PP.Id " +
			"WHERE WBR.Ref = @ThisWaybill");
	
	q.AddParameter("ThisWaybill", CurWaybillCP);
	
	return q.Execute().Unload();

}

function GetTechTasks(){

	q = new Query("SELECT WBT.Id, WBT.Requestioner, strftime('%H:%M', WBT.StartTime) AS StartTime, " +
			"strftime('%H:%M', WBT.StopTime) AS StopTime, CO.Description AS CODescription " +
			"FROM Document_Waybill_Tasks WBT LEFT JOIN Catalog_ConstructionObjects CO ON WBT.ConstructionObject = CO.Id " +
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
function GetTask(taskId){
	
	var q = new Query("SELECT T.Id, T.Adress, T.StartTime, T.StopTime, T.OperationTime, S.Id AS SKUId, S.Description AS SKU, " +
			"T.TaskString, T.Comment, T.StartTimeFact, T.StopTimeFact, T.Requestioner, O.Description AS ConstructionObject " +
			"FROM Document_Waybill_Tasks T " +
			"LEFT JOIN Catalog_SKU S ON S.Id = T.Task " +
			"LEFT JOIN Catalog_ConstructionObjects O ON O.Id = T.ConstructionObject " +
			"WHERE T.Id = @taskId");
	
	q.AddParameter("taskId", taskId);	
	return q.Execute();
}

function SaveTask(taskId, typeSave){
	//allsave 1
	//halfsave 2
	//timeSafe 3
	
	var atribNull = null;
	
	if(taskId == null){
		// создание документа Task
		var T = DB.Create("Document.Waybill_Tasks");
		T.Ref = CurWaybillCP;
		//T.Requestioner = forepersonCP;
		T.Save();		
		taskId = T.Id;
	}
	
	var task = taskId.GetObject();
	
	if(typeSave == "1"){
				
		if(sKUCP == null){
			atribNull = 1;		
		}else{	
			task.Task = sKUCP;
		}
		
		if(commentMemoCP == null){
			var fds = 1;// просто так
		}else{
			task.Comment = Variables["AdressText"].Text;
		}
				
		var startTimeValue = Variables["StartTimeFactText"].Text;
		if(startTimeValue == null){
			atribNull = 1;		
		}else{
			if(TrimAll(startTimeValue) == "-"){
				atribNull = 1;			
			}else{
				startTimeFactTextCP = String.Format("{0:HH:mm}", startTimeValue)
				task.StartTimeFact = startTimeFactTextCP;
			}
		}
		
		var stopTimeValue = Variables["StopTimeFactText"].Text;
		if(stopTimeValue == null){
			atribNull = 1;		
		}else{
			if(TrimAll(stopTimeValue) == "-"){
				atribNull = 1;			
			}else{
				stopTimeFactTextCP = String.Format("{0:HH:mm}", stopTimeValue)
				task.StopTimeFact = stopTimeFactTextCP;
			}
		}
		
		if(commentMemoCP == null){
			var fds = 1;// просто так
		}else{
			task.Comment = commentMemoCP;
		}
		   
	}else if(typeSave == "2"){
		
		if(sKUCP == null){
			atribNull = 1;		
		}else{	
			task.Task = sKUCP;
		}		
				
		var startTimeValue = Variables["StartTimeFactText"].Text;
						
		if(startTimeValue == null){
			atribNull = 1;		
		}else if(startTimeValue == '0001-01-01 00:00:00.0000000'){
			atribNull = 1;
		}else{
			if(TrimAll(startTimeValue) == "-"){
				atribNull = 1;			
			}else{
				startTimeFactTextCP = String.Format("{0:HH:mm}", startTimeValue)
				task.StartTimeFact = startTimeFactTextCP;
			}
		}
		
		var stopTimeValue = Variables["StopTimeFactText"].Text;
		if(stopTimeValue == null){
			atribNull = 1;		
		}else{
			if(TrimAll(stopTimeValue) == "-"){
				atribNull = 1;			
			}else{
				stopTimeFactTextCP = String.Format("{0:HH:mm}", stopTimeValue)
				task.StopTimeFact = stopTimeFactTextCP;
			}
		}
		
		if(commentMemoCP == null){
			var fds = 1;// просто так
		}else{
			task.Comment = commentMemoCP;
		}
		
	}else if(typeSave == "3"){
		
		var startTimeValue = Variables["StartTimeFactText"].Text;
		if(startTimeValue == null){
			atribNull = 1;		
		}else{
			if(TrimAll(startTimeValue) == "-"){
				atribNull = 1;			
			}else{
				startTimeFactTextCP = String.Format("{0:HH:mm}", startTimeValue)
				task.StartTimeFact = startTimeFactTextCP;
			}
		}
		
		var stopTimeValue = Variables["StopTimeFactText"].Text;
		if(stopTimeValue == null){
			atribNull = 1;		
		}else{
			if(TrimAll(stopTimeValue) == "-"){
				atribNull = 1;			
			}else{
				stopTimeFactTextCP = String.Format("{0:HH:mm}", stopTimeValue)
				task.StopTimeFact = stopTimeFactTextCP;
			}
		}
	}
	
	if(atribNull != null){
		Dialog.Message("Не все поля заполнены");
	}else{
		//Dialog.Debug(forepersonCP);
		task.Save();
		Workflow.Back();
	} 
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
			
	if(attribute == "StartTimeFact"){
		startTimeFactTextCP = String.Format("{0:HH:mm}", args.Result);		
    }
	
	if(attribute == "StopTimeFact"){
		stopTimeFactTextCP = String.Format("{0:HH:mm}", args.Result);    	
    }
	
	timeText.Text = String.Format("{0:HH:mm}", args.Result);
	
	return
}

function CommentMemoEdit(){
	commentMemoCP = Variables["commentMemo"].Text;
}

//-------------------------- Скрин GSMs

function OpenGSMWf(GSMID){
	CurGSMCP = GSMID.SKU;
	Workflow.Action("GSM", []);
}

//-------------------------- Скрин GSM

function GetFills(){
	
	var q = new Query("SELECT F.Id AS Id, FT.Id AS RowId, F.Date, FT.Count AS Cnt " +
			"FROM Document_Fill_Technics FT LEFT JOIN Document_Fill F " +
			"ON FT.Ref = F.Id " +
			"WHERE FT.GSM = @ThisGSM AND FT.Waybill = @ThisWaybill AND FT.Tech = @ThisTech");
	q.AddParameter("ThisGSM", CurGSMCP);
	q.AddParameter("ThisWaybill", CurWaybillCP);
	q.AddParameter("ThisTech", TechnicsCP);
	
	res = q.Execute().Unload();
	resc = res.Count();
	
 	return q.Execute().Unload();

}

function GetCntFills(Fills){
	return Fills.Count();
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
