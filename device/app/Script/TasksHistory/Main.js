var tasksIdperem;
var tasksbeginDate;
var tasksendDate;

//СКРИН СПИСОК ЗАЯВОК

function GetAllActiveTaskDetails(searchText, getCount, beginDate, endDate){
	var userId = $.common.UserId;
	
	var q = new Query();
	var qtext = "SELECT TSK.Id AS tskId, TSK.Date AS tskDate, TSK.TimeReactionNorm AS timeReactionNorm, TSK.TimeRepairNorm AS timeRepairNorm, OBJ.Description AS objDes, STAT.Description AS statDes, VIEW.Description AS viewDes " +
			"FROM Document_Task TSK " +
			"INNER JOIN Catalog_User _US ON _US.Department = TSK.Department " +
			"LEFT JOIN Catalog_Object OBJ ON TSK.Object = OBJ.ID " +
			"LEFT JOIN Enum_StatusTasks STAT ON TSK.StatusTasks = STAT.Id " +
			"LEFT JOIN Enum_ViewTasks VIEW ON TSK.ViewTasks = VIEW.Id " +
			"WHERE _US.Id = @userId AND (TSK.StatusTasks=@StatusTasksNew OR TSK.StatusTasks=@StatusTasksJob) AND tskDate >= @beginDate AND tskDate < @endDate AND tskDate >= @Date4MonthsBack ";
	var qtextCount = qtext;
	var textOrd = " ORDER BY tskDate";
	
	if (searchText != "" && searchText != null) {
		var plus = " AND (Contains(objDes, @st) OR Contains(strftime('%d.%m.%Y', TSK.Date), @st)) ";
		//var plus = " AND Contains(objDes, @st) ";
		qtext = qtext + plus;
		q.AddParameter("st", searchText);
		//var repl = StrReplace(searchText, ".", "-");
		//q.AddParameter("strepl", searchText);
	}
		
	q.AddParameter("StatusTasksNew", "@ref[Enum_ StatusTasks]:983204d6-92aa-e0fd-4315-258242877c2f");
	q.AddParameter("StatusTasksJob", "@ref[Enum_StatusTasks]:b9b59f80-b32f-d50d-49b2-a933459dbe91");
	q.AddParameter("beginDate", BegOfDay(beginDate));
	q.AddParameter("userId", "@ref[Catalog_User]:" + userId);
	
	var spike2 = EndOfDay(endDate);
	//Dialog.Debug(endDate);
	q.AddParameter("endDate", spike2);
	var spike = -4;
	q.AddParameter("Date4MonthsBack", DateTime.Now.AddMonths(spike));
			
	if (getCount == 0) {
		q.Text = qtext + textOrd;
		var c = q.Execute();
		return c; 
	} else {
		q.Text = qtextCount;
		return q.ExecuteCount();
	} 	 
}

function ConvertDate(tskDate){
	if(tskDate != null && tskDate != 0){
		var t = String.Format("{0:dd/MM/yy HH:mm}", DateTime.Parse(tskDate));
//		var st = tskDate - DateTime.Now.Date;
//		var tSt = String(t)+". РћСЃС‚Р°Р»РѕСЃСЊ "+st+" С‡."
//		return tSt;
		return t;
	}else{
		var t = "Время не указано";
		return t;
	}
}

function GetDate_ddMMyyyy(Period)
{
	var s = String.Format("{0:dd/MM/yyyy}", DateTime.Parse(Period));
	return s;
}

function GetParam2(param2){
	
	if(tasksbeginDate == null){
		var fike	
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
		
		tasksbeginDate = fike;
		return tasksbeginDate
	}else{
		return tasksbeginDate;
	}
		
}

function GetParam3(param3){
	if(tasksendDate == null){
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
		tasksendDate = fike;
		return tasksendDate;
	}else{
		return tasksendDate;
	}
}

function SetBeginDate(idDate, search, beginDateParam, endDateParam) {
	//Dialog.Debug(idDate);
		
	var header = Translate["#enterDateTime#"];
    Dialog.ShowDateTime(header, beginDateParam, SetBeginDateNow, [idDate, search, endDateParam]);
}


function SetBeginDateNow(key, arr) {
	var idDate = arr[0];
	var search = arr[1];
	var endDateParam = arr[2];
	idDate.Text = String.Format("{0:dd/MM/yyyy}", key);
	
	tasksbeginDate = key;
	
	Workflow.Refresh([search, key, endDateParam]);
	//$.datePlan.Text = key;
//	Dialog.Debug(vizitId);	
}

function SetEndDate(idDate, search, beginDateParam, endDateParam) {
	//Dialog.Debug(idDate);
		
	var header = Translate["#enterDateTime#"];
    Dialog.ShowDateTime(header, endDateParam, SetEndDateNow, [idDate, search, beginDateParam]);
}


function SetEndDateNow(key, arr) {
	var idDate = arr[0];
	var search = arr[1];
	var beginDateParam = arr[2];
	idDate.Text = String.Format("{0:dd/MM/yyyy}", key);
	
	tasksendDate = key;
	
	Workflow.Refresh([search, beginDateParam, key]);
	//$.datePlan.Text = key;
//	Dialog.Debug(vizitId);	
}

function AddTaskIdAndDoAction(tskId) {
	tasksIdperem = tskId;
	Workflow.Action("SelectTaskH", []);	
}



//СКРИН ЗАЯВКА
//
function GetCurrentTask(taskId){
	taskForSO = taskId; // Р·Р°РїРёС€РµРј РІ РїРµСЂРµРјРµРЅРЅСѓСЋ РјРѕРґСѓР»СЏ ID
	
	var q = new Query("SELECT _TSK.Id, _TSK.Object, _STAT.Description AS statDes, _VIEW.Description AS viewDes, _OBJ.Description, _OBJ.Address, _OBJ.Latitude, _OBJ.Longitude, " +
			"_NAME.Description AS Name, _POSIT.Description AS Posit, _TEL.ContactTel, _PROBL.ProblemDescription " +
			"FROM Document_Task _TSK " +
			"LEFT JOIN Catalog_Object _OBJ ON _OBJ.Id = _TSK.Object " +
			"LEFT JOIN Document_Task_Problem _PROBL ON _PROBL.Ref = _TSK.Id " +
			"LEFT JOIN Catalog_ContactName _NAME ON _NAME.Id = _TSK.ContactName " +
			"LEFT JOIN Catalog_ContactPosition _POSIT ON _POSIT.Id = _NAME.ContactPosition " +
			"LEFT JOIN Document_Task_ContactTel _TEL ON _TEL.Ref = _TSK.Id " +
			"LEFT JOIN Enum_StatusTasks _STAT ON _TSK.StatusTasks = _STAT.Id " +
			"LEFT JOIN Enum_ViewTasks _VIEW ON _TSK.ViewTasks = _VIEW.Id " +
			"WHERE _TSK.Id == @taskId");
	q.AddParameter("taskId", taskId);
	return q.Execute();
}

function GetWayPoints(currentObject){
	var query = new Query();
	    query.AddParameter("currentObject", currentObject);
		      query.Text = "SELECT Description, Latitude, Longitude FROM Catalog_Object WHERE Id == @currentObject";
   	   var result = query.Execute();
   	  
   if (result==null){
	   return null;
   }else{
	   if (result.Latitude == null || result.Longitude == null){
		   return null;
	   }else{	
		   if (parseFloat(result.Latitude) == 0 && parseFloat(result.Longitude) == 0){
			   return null;
		   }else{
			   return result;
		   }
	   }
   }
}

function NullCoordMess(){
	Dialog.Message("Координаты точки не заданы");
}

function CallEmergency(tel){
	if (tel != "") {
		Phone.Call(tel);		
	} else {
		return;
	}    
}


//СКРИН ЗАЯВКИ НА МАТЕРИАЛЫ

function GetTaskStatusAVRId(currentObject){
	var qry = new Query("SELECT TSK.Id AS TSKId, _STAT.Name AS StatName, _STAT.Description AS StatDes, AVR.Id AS AVRId FROM Document_Task TSK " +
			"LEFT JOIN Enum_StatusTasks _STAT ON TSK.StatusTasks = _STAT.Id " +
			"LEFT JOIN Document_bitmobile_AVR AVR ON AVR.Task = TSK.Id " +
			"WHERE TSK.Id = @currentObject");
	qry.AddParameter("currentObject", currentObject);
	var c = qry.Execute();
	return c;
}



//СКРИН МАТЕРИАЛЫ

function GetMaterials(currentObject, getCount){
	if (getCount == 0) {	
		var qry = new Query("SELECT AVR.Id AS AVRId, SKU.Id AS sKUId, SKU.Description AS Description, AVRM.Id AS AVRMId, AVRM.Count AS Cnt, _UN.Description AS UnDescription FROM Document_bitmobile_AVR AVR " +
				"LEFT JOIN Document_bitmobile_AVR_Materials AVRM ON AVRM.Ref = AVR.Id " +
				"JOIN Catalog_SKU SKU ON AVRM.SKU = SKU.Id LEFT JOIN Catalog_Unit _UN ON SKU.Unit = _UN.Id " +
				"WHERE AVR.Task = @currentObject");		
		qry.AddParameter("currentObject", currentObject);
		var c = qry.Execute();
		return c; 
	} else {
		var qry = new Query("SELECT AVR.Id FROM Document_bitmobile_AVR AVR " +
				"LEFT JOIN Document_bitmobile_AVR_Materials AVRM ON AVRM.Ref = AVR.Id " +
				"WHERE AVR.Task = @currentObject");
		qry.AddParameter("currentObject", currentObject);
		var c = qry.ExecuteCount();	
		return c;		
	}
}




//СКРИН РАБОТЫ

function GetJobs(currentObject, getCount){
	if (getCount == 0) {	
		var qry = new Query("SELECT AVR.Id AS AVRId, SKU.Id AS sKUId, SKU.Description AS Description, AVRM.Id AS AVRMId, AVRM.Count AS Cnt, _UN.Description AS UnDescription " +
				"FROM Document_bitmobile_AVR AVR " +
				"LEFT JOIN Document_bitmobile_AVR_Jobs AVRM ON AVRM.Ref = AVR.Id " +
				"JOIN Catalog_SKU SKU ON AVRM.SKU = SKU.Id LEFT JOIN Catalog_Unit _UN ON SKU.Unit = _UN.Id " +
				"WHERE AVR.Task = @currentObject");		
		qry.AddParameter("currentObject", currentObject);
		var c = qry.Execute();
		return c; 
	} else {
		var qry = new Query("SELECT AVR.Id FROM Document_bitmobile_AVR AVR " +
				"LEFT JOIN Document_bitmobile_AVR_Jobs AVRM ON AVRM.Ref = AVR.Id " +
				"WHERE AVR.Task = @currentObject");
		qry.AddParameter("currentObject", currentObject);
		var c = qry.ExecuteCount();	
		return c;		
	}
}





//СКРИН ФОТО

function GetPhoto(currentObject, getCount){
	if (getCount == 0) {	
		var qry = new Query("SELECT Id, Info, Date, Path FROM Document_bitmobile_AVR_Photo WHERE Ref = @currentObject");		
		qry.AddParameter("currentObject", currentObject);
		var c = qry.Execute();
		return c; 
	} else {
		var qry = new Query("SELECT Id FROM Document_bitmobile_AVR_Photo WHERE Ref = @currentObject");
		qry.AddParameter("currentObject", currentObject);
		var c = qry.ExecuteCount();	
		return c;		
	}
}




//СКРИН ИТОГИ

function GetTaskResume(curTskId){
	var qry = new Query("SELECT TSK.Id, TSK.TimeStart, TSK.TimeFinish, TSK.TimeSpent, TSK.TimeReactionNorm, TSKC.Id AS TSKCId, TSKC.Comment, AVR.ValueBrigade AS ValueBrigade " +
			"FROM Document_Task TSK " +
			"LEFT JOIN Document_Task_Comment TSKC ON TSKC.Ref = TSK.Id " +
			"LEFT JOIN Document_bitmobile_AVR AVR ON AVR.Task = TSK.Id " +
			"WHERE TSK.Id = @curTskId");
	qry.AddParameter("curTskId", curTskId);
	return qry.Execute();
}

function TimeReaction(curTskId){
	//получаем фактическое время реагирования
	var q = new Query("SELECT (strftime('%s', TimeStart) - strftime('%s', Date)) AS dlt FROM Document_Task WHERE Id = @curTskId");
	q.AddParameter("curTskId", curTskId);
	
	var minusDate = q.ExecuteScalar();
	
	var deltaM = (minusDate/60);
					
	var delta = 0;
	
	if(deltaM > 0){
		var deltaHh = Math.floor(Math.round(deltaM)/60);
		var deltaMm = Math.round(deltaM) - deltaHh * 60;
		delta = deltaHh + deltaMm*0.01;  		  		 		
  	}	
	return delta
}

function RewiewComment(comment){
	if(comment != null){
		var commentCount = StrLen(comment);
		if(commentCount >=78){
			var comment = Mid(comment, 1, 77);
			return comment;
		}else{
			return 0;
		}	
	}else{
		return 0;
	}
}




//СКРИН С ОПИСАНИЕМ

function GetComment(curTskId){
	var qry = new Query("SELECT CM.Id, CM.Comment FROM Document_Task_Comment CM WHERE Ref = @curTask");
	qry.AddParameter("curTask", curTskId);
	var c = qry.Execute();
	return c; 
}



//СКРИН ОБЪЕКТ

function GetPasspObject(currentObject)
{
	var qry = new Query("SELECT OBJ.Id AS ObjId, OBJ.Description AS Description, OBJ.Address AS Address, OBJ.Latitude AS Latitude, OBJ.Longitude AS Longitude, CONT.Description AS DesCont, CONT.Date AS DateCont FROM Catalog_Object OBJ LEFT JOIN Catalog_Contracts CONT ON OBJ.Id = CONT.Object WHERE OBJ.Id == @P");
	qry.AddParameter("P",currentObject);
	return qry.Execute();
}

function GetContacts(currentObject, getCount){
	var qry = new Query("SELECT NM.Description AS Name, PS.Description AS Position, OBJ.ContactTel " +
			"FROM Catalog_Object OBJ " +
			"LEFT JOIN Catalog_ObjectContactName NM ON OBJ.ObjectContactName = NM.Id " +
			"LEFT JOIN Catalog_ContactPosition PS ON OBJ.ContactPosition = PS.Id " +
			"WHERE OBJ.Id == @P");
	qry.AddParameter("P",currentObject);
	//Dialog.Debug(currentObject);
	if (getCount == 0) {
		return qry.Execute(); 
	} else {
		return qry.ExecuteCount();
	} 
}



function OpenEquipment(currentObject){
	Workflow.Refresh([currentObject, 1]);
}

function CloseEquipment(currentObject){
	Workflow.Refresh([currentObject, 0]);
}

function GetEquipment(currentObject, getCount){
	var qry = new Query("SELECT SKU.Description, SER.Code AS SerialNumber " +
			"FROM Catalog_Object_Equipment EQU " +
			"LEFT JOIN Catalog_SKU AS SKU ON EQU.SKU = SKU.Id " +
			"LEFT JOIN Catalog_SerialNumber SER ON SER.Owner = SKU.Id " +
			"WHERE EQU.Ref == @P");
	qry.AddParameter("P",currentObject);
	if (getCount == 0) {
		return qry.Execute(); 
	} else {
		return qry.ExecuteCount();
	} 
}

function GetTripWayPointsObj(currentObject){
	var query = new Query();
	    query.AddParameter("currentObject", currentObject);
		      query.Text = "SELECT Description, Latitude, Longitude FROM Catalog_Object WHERE Id == @currentObject";
   	   var result = query.Execute();
//   	result.Next()   
//   	Dialog.Debug(result.Latitude);
//	Dialog.Debug(result.Longitude);
	
   	if (result==null){
 	   return null;
    }else{ 
 	   
 	   if (parseFloat(result.Latitude) == 0 && parseFloat(result.Longitude) == 0){
 		   return null;
 	   }else{
 		   return result;
 	   }
    }
}



//СКРИН "СПИСОК АВР"

function GetAVRs(currentObject,getCount){
	var qry = new Query("SELECT AVR.Id, AVR.Number, AVR.Date, PROBL.ProblemDescription FROM Document_AVR AVR LEFT JOIN Document_Task_Problem PROBL ON AVR.Task = PROBL.Ref WHERE AVR.Object == @P");
	qry.AddParameter("P",currentObject);
	if (getCount == 0) {
		return qry.Execute(); 
	} else {
		return qry.ExecuteCount();
	} 
}

//СКРИН "АВР"

function GetAVR(aVRId){
	var qry = new Query("SELECT AVR.Id, AVR.Number, AVR.Date, PROBL.ProblemDescription, TSKCOM.Comment " +
			"FROM Document_AVR AVR " +
			"LEFT JOIN Document_Task_Problem PROBL ON AVR.Task = PROBL.Ref " +
			"LEFT JOIN Document_Task_Comment TSKCOM ON AVR.Task = TSKCOM.Ref " +
			"WHERE AVR.Id == @P");
	qry.AddParameter("P", aVRId);
	return qry.Execute(); 
}

function GetAVRsSKU(aVRId,getCount){
	var qry = new Query("SELECT SKU.Description AS DesSKU, AVRSKU.SKUCount, UN.Description AS DesUN " +
			"FROM Document_AVR_SKU AVRSKU " +
			"LEFT JOIN Catalog_SKU SKU ON AVRSKU.SKU = SKU.Id " +
			"LEFT JOIN Catalog_Unit UN ON SKU.Unit = UN.Id " +
			"WHERE AVRSKU.Ref == @P");
	qry.AddParameter("P",aVRId);
	if (getCount == 0) {
		return qry.Execute(); 
	} else {
		return qry.ExecuteCount();
	}
}

function GetAVRsJobs(aVRId,getCount){
	var qry = new Query("SELECT SKU.Description AS DesSKU, AVRSKU.JobsCount, UN.Description AS DesUN FROM Document_AVR_Jobs AVRSKU LEFT JOIN Catalog_SKU SKU ON AVRSKU.SKU = SKU.Id LEFT JOIN Catalog_Unit UN ON SKU.Unit = UN.Id WHERE AVRSKU.Ref == @P");
	qry.AddParameter("P",aVRId);
	if (getCount == 0) {
		return qry.Execute(); 
	} else {
		return qry.ExecuteCount();
	}
}




// ОБЩИЕ ФУНКЦИИ

function Test(p){
	Dialog.Debug(p);
	return p;
}

function GetDate_ddMMyy(Period)
{
	var s = String.Format("{0:dd/MM/yy}", DateTime.Parse(Period));
	return s;
}







