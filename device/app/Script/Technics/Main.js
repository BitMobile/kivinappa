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


//-------------------------- Переменные контроллера для экрана Task
var sKUCP 
var commentMemoCP 
var startTimeTextCP 
var stopTimeTextCP 
var startTimeFactTextCP 
var stopTimeFactTextCP 


var userIdCP
var forepersonCP





function OnLoad() {    
	userIdCP = $.common.UserId;
	
	var q = new Query("SELECT Foreperson " +
			"FROM Catalog_User " +
			"WHERE Id == @userIdCP");
	
	q.AddParameter("userIdCP", "@ref[Catalog_User]:" + userIdCP);
	
	forepersonCP = q.ExecuteScalar();
}


//-------------------------- Скрин Technics

function GetTechnics(searchText){
	
	var q = new Query("");
	
	var qtext = "SELECT TECH.Id, TECH.VehicleRegTag, TT.Description " +
			"FROM Catalog_Technics TECH JOIN Catalog_TechnicsTypes TT " +
			"ON TECH.TechnicsTypes = TT.Id";
		
	if (searchText != "" && searchText != null) {
		var plus = " WHERE (Contains(TECH.VehicleRegTag, @st)) OR (Contains(TT.Description, @st))";
		qtext = qtext + plus;
		q.AddParameter("st", searchText);
	}
	
	var textOrd = " ORDER BY TT.Description";
	
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
			"WHERE DATE(WB.PlannedStartDate) <= DATE('now') AND DATE(WB.PlannedEndDate) >= DATE('now') " +
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
	
	var q = new Query("SELECT TG.Id, CG.Description AS GSM FROM Catalog_Technics_GSM TG LEFT JOIN Catalog_SKU CG ON TG.SKU = CG.Id " +
			"WHERE TG.Ref = @ThisTech");
	q.AddParameter("ThisTech", TechnicsCP);
	
	GSMsCP = q.Execute().Unload();
	
	GSMsCntCP = GSMsCP.Count();
	
	if(GSMsCntCP == 1){
		
		GSMsCP.First();
		GSMsCP.Next();
		
		CurGSMCP = GSMsCP.Id;
		
		Workflow.Action("GSM", []);	
	}else{
		
		Workflow.Action("GSMs", []);
	}
	
	 
}


//-------------------------- Скрин TechTask



function GetTask(taskId){
	
		var q = new Query("SELECT T.Id, T.Adress, T.StartTime, T.StopTime, T.OperationTime, S.Id AS SKUId, S.Description AS SKU, " +
				"T.TaskString, T.Comment, T.StartTimeFact, T.StopTimeFact FROM Document_Waybill_Tasks T " +
			"LEFT JOIN Catalog_SKU S ON S.Id = T.Task " +
				"WHERE Id == @taskId");
		
		q.AddParameter("taskId", taskId);
		var qq = q.Execute();	
		return qq;
	}
}


function SaveTask(taskId){
	
	var atribNull = null;
	
	if(taskId == null){
		// создание документа Task
		var T = DB.Create("Document.Waybill_Tasks");
		T.Ref = CurWaybillCP;
		T.Requestioner = forepersonCP
		T.Save();
		
		taskId = T.Id;
	}
	
	var task = taskId.GetObject();
		
	if(sKUCP == null){
		atribNull = 1;		
	}else{	
		task.Task = sKUCP;
	}		
	
//	if(startTimeTextCP == null){
//		atribNull = 1;		
//	}else{
//		if(TrimAll(startTimeTextCP) == "-"){
//			atribNull = 1;			
//		}else{
//			task.StartTime = startTimeTextCP;
//		}
//	}
//	
//	if(stopTimeTextCP == null){
//		atribNull = 1;		
//	}else{
//		if(TrimAll(stopTimeTextCP) == "-"){
//			atribNull = 1;			
//		}else{
//			task.StopTime = stopTimeTextCP;
//		}
//	}
	
	if(startTimeFactTextCP == null){
		atribNull = 1;		
	}else{
		if(TrimAll(startTimeFactTextCP) == "-"){
			atribNull = 1;			
		}else{
			task.StartTimeFact = startTimeFactTextCP;
		}
	}
	
	if(stopTimeFactTextCP == null){
		atribNull = 1;		
	}else{
		if(TrimAll(stopTimeFactTextCP) == "-"){
			atribNull = 1;			
		}else{
			task.StopTimeFact = stopTimeFactTextCP;
		}
	}
	
	if(commentMemoCP == null){
		var fds = 1;// просто так
	}else{
		task.Comment = commentMemoCP;
	}

	
	if(atribNull != null){
		Dialog.Message("Не все поля заполнены");
	}else{
		//Dialog.Debug(forepersonCP);
		task.Save();
		Workflow.Back();
	}    
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
		startTimeTextCP = String.Format("{0:HH:mm}", args.Result);		
    }
	
	if(attribute == "StopTimeFact"){
		stopTimeTextCP = String.Format("{0:HH:mm}", args.Result);    	
    }
	
	timeText.Text = String.Format("{0:HH:mm}", args.Result);
	
	return
}

function CommentMemoEdit(){
	commentMemoCP = Variables["commentMemo"].Text;
}


//-------------------------- Скрин GSMs

function OpenGSMWf(GSMID){
	CurGSMCP = GSMID;
	Workflow.Action("GSM", []);
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

//--------------------------ОБЩАЯ ФОРМАТ ДАТА

function GetDate_ddMMyy(Period)
{
	var s = String.Format("{0:dd/MM/yy}", DateTime.Parse(Period));
	return s;
}
