var taskForSO;
var statusIdGlob;

//СКРИН "Tasks"

function MyStartTracking() {
	GPS.StartTracking();
	return;
}

function GetTodaysActiveTask(){
	var userId = $.common.UserId;
	
	var q1 = new Query("SELECT TSK.Id " +
			"FROM Document_Task TSK " +
			"INNER JOIN Catalog_User _US ON _US.Department = TSK.Department " +			
			"WHERE TSK.Date >= @DateStart " +
				"AND TSK.Date < @DateEnd " +
				"AND _US.Id = @userId " +
				"AND TSK.DeletionMark = 0 " +
				"AND (TSK.StatusTasks=@StatusTasksNew OR TSK.StatusTasks=@StatusTasksJob)");//in (SELECT Id FROM Enum_StatusTasks WHERE Name = @StatusTasksNew)");
	
	q1.AddParameter("StatusTasksNew", "@ref[Enum_StatusTasks]:b92d0bb1-9062-74ef-428d-7384740ad3c2");
	q1.AddParameter("StatusTasksJob", "@ref[Enum_StatusTasks]:867cc4e2-98af-3371-467d-ee879cd0d665");
	q1.AddParameter("DateStart", DateTime.Now.Date);
	q1.AddParameter("DateEnd", DateTime.Now.Date.AddDays(1));
	q1.AddParameter("userId", "@ref[Catalog_User]:" + userId);
	var sss = q1.ExecuteCount();
	return sss; 
}

function GetAllActiveTask(){
	var userId = $.common.UserId;
	
	var q = new Query("SELECT TSK.Id " +
			"FROM Document_Task TSK " +
			"INNER JOIN Catalog_User _US ON _US.Department = TSK.Department " +
			"WHERE (TSK.StatusTasks=@StatusTasksNew OR TSK.StatusTasks=@StatusTasksJob) " +
			"AND TSK.DeletionMark = 0 " +
			"AND _US.Id = @userId ");//
	
	q.AddParameter("StatusTasksNew", "@ref[Enum_StatusTasks]:b92d0bb1-9062-74ef-428d-7384740ad3c2");
	q.AddParameter("StatusTasksJob", "@ref[Enum_StatusTasks]:867cc4e2-98af-3371-467d-ee879cd0d665");
	q.AddParameter("userId", "@ref[Catalog_User]:" + userId);
	return q.ExecuteCount(); 
}

//невыполненные заявки на сегодня
function GetToDayUnDoneRequestsWithSearch(searchText){
	var userId = $.common.UserId;
	
	var q = new Query();
	var qtext = "SELECT TSK.Id AS tskId, TSK.Date AS tskDate, OBJ.Description AS objDes, STAT.Description AS statDes, VIEW.Description AS viewDes " +
			"FROM Document_Task TSK " +
			"INNER JOIN Catalog_User _US ON _US.Department = TSK.Department " +
			"	LEFT JOIN Catalog_Object OBJ ON TSK.Object = OBJ.ID " +
			"	LEFT JOIN Enum_StatusTasks STAT ON TSK.StatusTasks = STAT.Id " +
			"	LEFT JOIN Enum_ViewTasks VIEW ON TSK.ViewTasks = VIEW.Id " +
			"WHERE _US.Id = @userId " +
			"AND TSK.Date >= @DateStart " +
			"AND TSK.Date < @DateEnd " +
			"AND TSK.DeletionMark = 0 " +
			"AND (TSK.StatusTasks=@StatusTasksNew OR TSK.StatusTasks=@StatusTasksJob)";
	var qtextCount = qtext;
		
	if (searchText != "" && searchText != null) {
		var plus = " AND (Contains(objDes, @st) OR Contains(tskDate, @st)) ";//AND  Contains(CUST.Description, @SearchText)
		qtext = qtext + plus;
		q.AddParameter("st", searchText);
	}
	
	var textOrd = " ORDER BY tskDate";
	
	q.AddParameter("StatusTasksNew", "@ref[Enum_StatusTasks]:b92d0bb1-9062-74ef-428d-7384740ad3c2");
	q.AddParameter("StatusTasksJob", "@ref[Enum_StatusTasks]:867cc4e2-98af-3371-467d-ee879cd0d665");
	q.AddParameter("DateStart", DateTime.Now.Date);
	q.AddParameter("DateEnd", DateTime.Now.Date.AddDays(1));
	q.AddParameter("userId", "@ref[Catalog_User]:" + userId);
	
	q.Text = qtext + textOrd;
	return q.Execute().Unload();		
		
}

//невыполненные заявки за все время
function GetAllActiveTaskDetails(searchText){
	var userId = $.common.UserId;
	
	var q = new Query();
	var qtext = "SELECT TSK.Id AS tskId, TSK.Date AS tskDate, TSK.TimeReactionNorm AS timeReactionNorm, TSK.TimeRepairNorm AS timeRepairNorm, OBJ.Description AS objDes, STAT.Description AS statDes, VIEW.Description AS viewDes " +
			"FROM Document_Task TSK " +
			"INNER JOIN Catalog_User _US ON _US.Department = TSK.Department " +
			"	LEFT JOIN Catalog_Object OBJ ON TSK.Object = OBJ.ID " +
			"	LEFT JOIN Enum_StatusTasks STAT ON TSK.StatusTasks = STAT.Id " +
			"	LEFT JOIN Enum_ViewTasks VIEW ON TSK.ViewTasks = VIEW.Id " +
			"WHERE _US.Id = @userId " +
			"AND TSK.DeletionMark = 0 " +
			"AND (TSK.StatusTasks=@StatusTasksNew OR TSK.StatusTasks=@StatusTasksJob) ";
	var qtextCount = qtext;
		
	if (searchText != "" && searchText != null) {
		var plus = " AND (Contains(objDes, @st) OR Contains(tskDate, @st)) ";
		qtext = qtext + plus;
		q.AddParameter("st", searchText);
	}
	
	var textOrd = " ORDER BY tskDate";
		
	q.AddParameter("StatusTasksNew", "@ref[Enum_StatusTasks]:b92d0bb1-9062-74ef-428d-7384740ad3c2");
	q.AddParameter("StatusTasksJob", "@ref[Enum_StatusTasks]:867cc4e2-98af-3371-467d-ee879cd0d665");
	q.AddParameter("userId", "@ref[Catalog_User]:" + userId);
				
	q.Text = qtext + textOrd;
	var c = q.Execute().Unload();
	return c;	 
}

function GetCntResult(result){
	return result.Count();
}



function SetListType() {
	if($.Exists("visitsType") == false){
	  $.AddGlobal("visitsType", "planned");
	}else{
	  return $.visitsType;
	}
}

function ChangeListAndRefresh(control) {
	$.Remove("visitsType");
	$.AddGlobal("visitsType", control);
	Workflow.Refresh([]);
}

function GetTimeTo(tskDate, timeReactionNorm, timeRepairNorm){
	//сталось времени до окончания работы = Дата + НормативноеВремяРеагирования + НормативноеВремяУстраненияНеисправности - ТекущаяДата()
		
	var q = new Query("SELECT strftime('%s', @tmDate) - strftime('%s','now')");
	q.AddParameter("tmDate", tskDate);
	var minusDate = q.ExecuteScalar();
	
	var deltaM = (minusDate/60) + ((4 + timeReactionNorm + timeRepairNorm) *60);
	
	//Dialog.Debug(deltaM);
	
	var delta = 0;
	
	if(deltaM > 0){
		var deltaHh = Math.floor(Math.round(deltaM)/60);
		var deltaMm = Math.round(deltaM) - deltaHh * 60;
		delta = deltaHh + deltaMm*0.01;  		  		 		
  	}	
	
  	return delta;
  	  	
//  	return 0
}

function GetTripWayPoints(tskId, searchText, several, today){
	var userId = $.common.UserId;
	
	var q = new Query();
	
	if (several == 1) {
		var qtext = "SELECT TSK.Date, OBJ.Description, OBJ.Latitude, OBJ.Longitude " +
				"FROM Document_Task TSK " +
				"INNER JOIN Catalog_User _US ON _US.Department = TSK.Department " +
				"	LEFT JOIN Catalog_Object OBJ ON TSK.Object = OBJ.ID " +
				"	LEFT JOIN Enum_StatusTasks STAT ON TSK.StatusTasks = STAT.Id " +
				"WHERE _US.Id = @userId " +
				"AND TSK.DeletionMark = 0 " +
				"AND (TSK.StatusTasks=@StatusTasksNew OR TSK.StatusTasks = @StatusTasksJob) ";
		
		q.AddParameter("StatusTasksNew", "@ref[Enum_StatusTasks]:b92d0bb1-9062-74ef-428d-7384740ad3c2");
		q.AddParameter("StatusTasksJob", "@ref[Enum_StatusTasks]:867cc4e2-98af-3371-467d-ee879cd0d665");
		q.AddParameter("DateStart", DateTime.Now.Date);
		q.AddParameter("DateEnd", DateTime.Now.Date.AddDays(1));
		q.AddParameter("userId", "@ref[Catalog_User]:" + userId);
	}else{
		var qtext = "SELECT TSK.Date, OBJ.Description, OBJ.Latitude, OBJ.Longitude " +
				"FROM Document_Task TSK " +
				"	LEFT JOIN Catalog_Object OBJ ON TSK.Object = OBJ.ID " +
				"WHERE OBJ.Id = @tskId";
		
		q.AddParameter("tskId", tskId);
		q.AddParameter("DateStart", DateTime.Now.Date);
		q.AddParameter("DateEnd", DateTime.Now.Date.AddDays(1));
	}
	
	if (today == 1) {
		var textToday = " AND TSK.Date >= @DateStart AND TSK.Date < @DateEnd";
	}else{
		var textToday = "";
	}		
	
	var qtextCount = qtext;
	var textOrd = " ORDER BY TSK.Date";
	
	if (searchText != "" && searchText != null) {
		var plus = " AND (Contains(OBJ.Description, @st) OR Contains(TSK.Date, @st)) ";
		qtext = qtext + plus;
		q.AddParameter("st", searchText);
	}
		
	
	
	
			
	q.Text = qtext + textToday + textOrd;
	var result = q.Execute().Unload();

	var Cnt = result.Count();
		
   if (Cnt==0){
	   Dialog.Message("Координаты точки не заданы");
   }else{ 
	   Workflow.Action("ShowMap", [result]);
   }
}

function AddPeremAndDoAction(taskId){
	taskForSO = taskId; // запишем в переменную модуля ID
	//Dialog.Debug(taskId);
	Workflow.Action("SelectTask", []); 
}




// СКРИН "Task"

function GetCurrentTask(taskId){
		
	var q = new Query("SELECT _TSK.Id, _TSK.Object, _STAT.Id AS statId, _STAT.Description AS statDes, _VIEW.Description AS viewDes, _OBJ.Description, _OBJ.Address, _OBJ.Latitude, _OBJ.Longitude, " +
			"_NAME.Description AS Name, _POSIT.Description AS Posit, _TEL.ContactTel, _PROBL.ProblemDescription " +
			"FROM Document_Task _TSK " +
			"	LEFT JOIN Catalog_Object _OBJ ON _OBJ.Id = _TSK.Object " +
			"	LEFT JOIN Document_Task_Problem _PROBL ON _PROBL.Ref = _TSK.Id " +
			"	LEFT JOIN Catalog_ContactName _NAME ON _NAME.Id = _TSK.ContactName " +
			"	LEFT JOIN Catalog_ContactPosition _POSIT ON _POSIT.Id = _NAME.ContactPosition " +
			"	LEFT JOIN Document_Task_ContactTel _TEL ON _TEL.Ref = _TSK.Id " +
			"	LEFT JOIN Enum_StatusTasks _STAT ON _TSK.StatusTasks = _STAT.Id " +
			"	LEFT JOIN Enum_ViewTasks _VIEW ON _TSK.ViewTasks = _VIEW.Id " +
			"WHERE _TSK.Id == @taskId");
	q.AddParameter("taskId", taskId);
	
	var qE = q.Execute();
	
	statusIdGlob = qE.statId;
		
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

function CheckAVR(curTask){
	var qry = new Query("SELECT AVR.Id AS AVRId " +
			"FROM Document_Task TSK " +
			"LEFT JOIN Document_bitmobile_AVR AVR ON AVR.Task = TSK.Id " +
			"WHERE TSK.Id = @curTask");
	qry.AddParameter("curTask", curTask);
	var c = qry.ExecuteScalar();
		
	if(c == null){		
		// создание документа bitmobile_AVR
		var AVR = DB.Create("Document.bitmobile_AVR");
		AVR.Posted = 0;
		AVR.Date = DateTime.Now;
		AVR.Task = curTask;
						
		AVR.Save(false);
	}
}

function QuestStartTask(curTask){
	Dialog.Question(Translate["#startTask#"], LocationDialogHandler, curTask);
}

function LocationDialogHandler(answ, state){
	if (answ == DialogResult.Yes) {
						
		var work = "ВРаботе";
		var q = new Query("Select Id FROM Enum_StatusTasks WHERE Enum_StatusTasks.Name == @statusTask");
		q.AddParameter("statusTask", work);
		var st = q.ExecuteScalar();
		
		var tskObj = state.GetObject();

		tskObj.StatusTasks = st;
		tskObj.TimeStart = DateTime.Now;
					
	  	//return delta;
		//Dialog.Debug(delta);
		
		
		tskObj.Save(false);
		
		// создание документа bitmobile_AVR
		var AVR = DB.Create("Document.bitmobile_AVR");
		AVR.Posted = 0;
		AVR.Date = DateTime.Now;
		AVR.Task = state;
		
		var location = GPS.CurrentLocation;
        if (location.NotEmpty) {
        	AVR.LatitudeStart = location.Latitude;
        	AVR.LongitudeStart = location.Longitude;
        	
        	var q = new Query("Select Latitude, Longitude FROM Catalog_Object WHERE Id == @objId");
    		q.AddParameter("objId", tskObj.Object);
    		var LL = q.Execute();
        	
    		if (LL.Next()) {
    			if (LL.Latitude != null && LL.Longitude != null && parseFloat(LL.Latitude) != 0 && parseFloat(LL.Longitude != 0)) {
    				if (AVR.LatitudeStart != null && AVR.LongitudeStart != null) {
		    			var deltaLatitude = LL.Latitude - AVR.LatitudeStart;
		    			if(deltaLatitude < 0) {deltaLatitude = deltaLatitude * (-1);}
		    			
		    			var deltaLongitude = LL.Longitude - AVR.LongitudeStart;
		    			if(deltaLongitude < 0) {deltaLongitude = deltaLongitude * (-1);}
		    			
			        	//if (deltaLatitude > 0,00032 || deltaLatitude < -0,00032 || deltaLongitude > 0,00056 || deltaLongitude < -0,00056) {
		    			if (deltaLatitude > 0,00032) {
			        		var deltaLatitudeMeter = Math.round(deltaLatitude*31/0.0001); 			        		
			        	}
		    			
		    			if (deltaLongitude > 0,00056) {
		    				var deltaLongitudeMeter = Math.round(deltaLongitude*18/0.0001); 			        		
			        	}
		    			
		    			if (deltaLatitudeMeter > deltaLongitudeMeter) {
		    				var deltaInDialog = deltaLatitudeMeter;
		    			}else{
		    				var deltaInDialog = deltaLongitudeMeter;
		    			}
		    			
		    			Dialog.Debug("Вы начали работу с объектом на расстоянии " + deltaInDialog + " метров");
    				}else{
    					Dialog.Debug("Координаты начала работы не определены.");
    				}
    			}
    		}
        }
		
		AVR.Save(false);
					
		Workflow.Action("GoTaskMaterialsList", [state]);        
    }
}




//СКРИН "TaskMaterialsList"

function GetTasksMaterials(currentObject, getCount){
	//Dialog.Debug(taskForSO)
	
	if (getCount == 0) {	
//		var qry = new Query("SELECT IO.Id, IO.Date, IO.Task, IO.Number, IO.Posted, SS.Ref " + //мой старый запрос. Рабочий
//				"FROM Document_InternalOrder IO " +
//				"JOIN Document_Task TSKSO ON TSKSO.Id = IO.Task " +
//				"LEFT JOIN Document_InternalOrder_StateShipment SS ON IO.Id = SS.Ref " +
//				"WHERE TSKSO.Id == @currentObject GROUP BY IO.Id ORDER BY IO.Date");
		var qry = new Query("SELECT IO.Id, IO.Date, IO.Task, IO.Number, IO.Posted, SS.Ref " +
							"FROM Document_InternalOrder IO " +
							"JOIN Document_Task TSKSO ON TSKSO.Id = IO.Task " +
							"LEFT JOIN (SELECT Ref " +
							"FROM  Document_InternalOrder_StateShipment GROUP BY Ref) SS ON IO.Id = SS.Ref " +
							"WHERE TSKSO.Id == @currentObject GROUP BY IO.Id ORDER BY IO.Date");
		qry.AddParameter("currentObject", currentObject);
		var c = qry.Execute();
		return c; 
	} else {
		var qry = new Query("SELECT IO.Id FROM Document_InternalOrder IO JOIN Document_Task TSKSO ON TSKSO.Id = IO.Task " +
				"WHERE TSKSO.Id == @currentObject GROUP BY IO.Id");
		qry.AddParameter("currentObject", currentObject);
		var c = qry.ExecuteCount();	
		return c;		
	}
}

function ForNextWorkflowNew(curTask) {
	var TaskMatObj = DB.Create("Document.InternalOrder");
	TaskMatObj.Task = curTask;
	
	var orderType = "НаСклад";
	var q = new Query("Select OrdType.Id AS OrderType, _Task.Org AS Org, _Task.Department AS Department, S.Ref AS Sklad " +
			"FROM Document_Task _Task " +
			"LEFT JOIN Enum_OrderType OrdType ON OrdType.Name = @orderType " +
			"LEFT JOIN Catalog_Sklad_Department S ON S.Depart = _Task.Department " +
			"WHERE _Task.Id = @curTask");
	q.AddParameter("orderType", orderType);
	q.AddParameter("curTask", curTask);
	
	var st = q.Execute();
	if (st.Next()) {
		
		TaskMatObj.Posted = 0;
		TaskMatObj.OrderType = st.OrderType;
		TaskMatObj.Date = DateTime.Now;
		TaskMatObj.Org = st.Org;
		TaskMatObj.Department = st.Department;
		TaskMatObj.Sklad = st.Sklad;
		TaskMatObj.Task = curTask;
		
		TaskMatObj.Save();
		var curTaskMatLoc = TaskMatObj.Id
		
		$.Remove("curTaskMat");
		$.AddGlobal("curTaskMat", curTaskMatLoc);
		$.Remove("tasksType");
		$.AddGlobal("tasksType", "ExpectedTask");
				
		Workflow.Action("GoTaskMaterials", []);
	}
	//Dialog.Debug(taskForSO)
}

function ForNextWorkflow(curTaskMatLoc, tasksTypeLoc) {
	$.Remove("curTaskMat");
	$.AddGlobal("curTaskMat", curTaskMatLoc);
	$.Remove("tasksType");
	$.AddGlobal("tasksType", tasksTypeLoc);
	
	Workflow.Action("GoTaskMaterials", []);
}

function GetTaskStatusAVRId(currentObject){
	var qry = new Query("SELECT TSK.Id AS TSKId, _STAT.Name AS StatName, _STAT.Description AS StatDes, AVR.Id AS AVRId FROM Document_Task TSK " +
			"LEFT JOIN Enum_StatusTasks _STAT ON TSK.StatusTasks = _STAT.Id " +
			"LEFT JOIN Document_bitmobile_AVR AVR ON AVR.Task = TSK.Id " +
			"WHERE TSK.Id = @currentObject");
	qry.AddParameter("currentObject", currentObject);
	var c = qry.Execute();
	return c;
}



//СКРИН Materials

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

function KillSKU(curTskId, aVRMId, sKUId, Cnt){
	// удаляем строку материалов из листа материалов
	DB.Delete(aVRMId);
	
	// возвращаем количество номенклатуры обратно на склад //не возвращаем! Теперь остатки будут не списываться, а фиксироваться в резерве 
//	var qry = new Query("SELECT Id, Count FROM Catalog_SKU_Stocks WHERE Ref = @sKUId");
//	qry.AddParameter("sKUId", sKUId);
//	var stokRow = qry.Execute();
//	
//	if (stokRow.Next()) {
//		var stokRowId = stokRow.Id;
//		var obj = stokRowId.GetObject();
//		var stokRowCount = parseFloat(stokRow.Count);
//		obj.Count = stokRowCount + parseFloat(Cnt);
//		obj.Save(false);
//	}

		
	Workflow.Refresh([curTskId]);
}




//СКРИН ADDMATERIALS

function GetsKUsAll(curTskId, searchText){
	if (searchText != "" && searchText != null) {
		
		var qry = new Query("SELECT S.Id, SKU.Id AS SKU, SKU.Description, _UN.Description AS Unit, _UN.Id AS UnId, (IFNULL(S.Count, 0) - IFNULL(GCount, 0) - IFNULL(MATCount, 0))	AS MyCount " +
							"FROM Catalog_SKU_Stocks S " +
							"LEFT JOIN Catalog_SKU SKU ON SKU.Id = S.Ref " +
							"LEFT JOIN Catalog_Unit _UN ON SKU.Unit = _UN.Id " +
							"LEFT JOIN (SELECT GDS.SKU, SUM(GDS.Count) AS GCount FROM Document_Moving M	" +
							"			INNER JOIN Enum_MovingStatus S ON S.Id = M.Status " +
							"			INNER JOIN Document_Moving_Goods GDS ON GDS.Ref = M.Id " +
							"			WHERE (S.Name = @sName OR S.Name = @ssName) " +
							"			GROUP BY GDS.SKU) M	ON M.SKU = S.Ref " +
							"LEFT JOIN (SELECT MAT.SKU, SUM(MAT.Count) AS MATCount FROM Document_bitmobile_AVR AVR " +
							"			INNER JOIN Document_bitmobile_AVR_Materials MAT ON MAT.Ref = AVR.Id " +
							"			LEFT JOIN Document_AVR AVRT ON AVRT.Task = AVR.Task " +
							"			LEFT JOIN Document_AVR_SKU AVRTM ON AVRTM.Ref = AVRT.Id AND AVRTM.SKU = MAT.SKU	" +
							"			WHERE AVRTM.DocumentsWritten = 0 OR AVRTM.DocumentsWritten IS NULL " +
							"			GROUP BY MAT.SKU) AVR ON AVR.SKU = S.Ref " +
							"WHERE (IFNULL(S.Count, 0) - IFNULL(GCount, 0) - IFNULL(MATCount, 0)) > 0 AND SKU.Service = @service AND Contains(SKU.Description, @st)	" +
							"ORDER BY SKU.Description");
					
					
		qry.AddParameter("curTask", curTskId);
		qry.AddParameter("service", "0");
		qry.AddParameter("st", searchText);
		qry.AddParameter("sName", "Новая");
		qry.AddParameter("ssName", "Отправлена");
					
		var c = qry.Execute().Unload();		
		return c; 
		
	}else{
		
		var qry = new Query("SELECT S.Id, SKU.Id AS SKU, SKU.Description, _UN.Description AS Unit, _UN.Id AS UnId, (IFNULL(S.Count, 0) - IFNULL(GCount, 0)- IFNULL(MATCount, 0))	AS MyCount " +
							"FROM Catalog_SKU_Stocks S " +
							"LEFT JOIN Catalog_SKU SKU ON SKU.Id = S.Ref " +
							"LEFT JOIN Catalog_Unit _UN ON SKU.Unit = _UN.Id " +
							"LEFT JOIN (SELECT GDS.SKU, SUM(GDS.Count) AS GCount FROM Document_Moving M	" +
							"			INNER JOIN Enum_MovingStatus S ON S.Id = M.Status " +
							"			INNER JOIN Document_Moving_Goods GDS ON GDS.Ref = M.Id " +
							"			WHERE (S.Name = @sName OR S.Name = @ssName) " +
							"			GROUP BY GDS.SKU) M	ON M.SKU = S.Ref " +
							"LEFT JOIN (SELECT MAT.SKU, SUM(MAT.Count) AS MATCount FROM Document_bitmobile_AVR AVR " +
							"			INNER JOIN Document_bitmobile_AVR_Materials MAT ON MAT.Ref = AVR.Id " +
							"			LEFT JOIN Document_AVR AVRT ON AVRT.Task = AVR.Task " +
							"			LEFT JOIN Document_AVR_SKU AVRTM ON AVRTM.Ref = AVRT.Id AND AVRTM.SKU = MAT.SKU	" +
							"			WHERE AVRTM.DocumentsWritten = 0 OR AVRTM.DocumentsWritten IS NULL " +
							"			GROUP BY MAT.SKU) AVR ON AVR.SKU = S.Ref " +
							"WHERE (IFNULL(S.Count, 0) - IFNULL(GCount, 0) - IFNULL(MATCount, 0)) > 0 AND SKU.Service = @service " +
							"ORDER BY SKU.Description");
		qry.AddParameter("curTask", curTskId);
		qry.AddParameter("service", "0");
		qry.AddParameter("sName", "Новая");
		qry.AddParameter("ssName", "Отправлена");
		var c = qry.Execute().Unload();		
		return c; 
		
	}
}

function GetCntSKU(sKUs){
	return sKUs.Count();
}

function AddSKU(sender,sKUId,addCountText,curTskId,curAVRId, edtSearch) {

	var addCount = sender.Parent.GetControl(0).GetControl(0).Text;
	
	//контроль остатков 
	var qry = new Query("SELECT Id, Count FROM Catalog_SKU_Stocks WHERE Ref = @sKUId");
	qry.AddParameter("sKUId", sKUId);
	var stokCnt = qry.Execute();
	
	if (stokCnt.Next()) {
		var cnt = stokCnt.Count;
		var stokId = stokCnt.Id;
			
		if (addCount != null && addCount != "" && parseFloat(addCount) != parseFloat(0)){
			if (cnt >= addCount){
				//записываем данные в таблицу материалов AVR
				
				var qry = new Query("SELECT Id, Count FROM Document_bitmobile_AVR_Materials WHERE Ref = @curAVRId AND SKU = @sKUId");
				qry.AddParameter("sKUId", sKUId);
				qry.AddParameter("curAVRId", curAVRId);
				var stokRow = qry.Execute();
																
				if (stokRow.Next()) {
					var stokRowId = stokRow.Id;
					var obj = stokRowId.GetObject();
					var stokRowCount = parseFloat(stokRow.Count);
					obj.Count = stokRowCount + parseFloat(addCount); 
					obj.Save(false);					
				}else{					
					var obj = DB.Create("Document.bitmobile_AVR_Materials");
					obj.Ref = curAVRId;
					obj.SKU = sKUId;
					obj.Count = parseFloat(addCount);
					obj.Save(false);					
				}
				
				//списываем остатки со склада // не списываем! Теперь остатки будут не списываться, а фиксироваться в резерве
//				var cntNew = cnt-addCount;
//				
//				var stkObj = stokId.GetObject();
//				stkObj.Count = cntNew;
//				stkObj.Save(false);
				
			}else{
				Dialog.Message("Не достаточно материала на складе.");
				return;
			}
		}else{
			Dialog.Message("Добавляемое количество указано не корректно.");
			return;
		}
	
	}else{
		Dialog.Message("Не найден материал на складе.");
		return;
	}
	
	Workflow.Refresh([edtSearch, curTskId, curAVRId]);
}




//СКРИН JOBS

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

function KillJob(curTskId, aVRMId, sKUId, Cnt){
	// удаляем строку материалов из листа материалов
	DB.Delete(aVRMId);
			
	Workflow.Refresh([curTskId]);
}




//СКРИН ADDMATERIALS

function GetJobsAll(curTskId, getCount, searchText){
	if (searchText != "" && searchText != null) {
		if (getCount == 0) {
			var qry = new Query("SELECT SKU.Id, SKU.Description, UN.Description AS Unit, UN.Id AS UnId " +
					"FROM Catalog_SKU SKU " +
					"LEFT JOIN Catalog_Unit UN ON SKU.Unit = UN.Id " +
					"WHERE SKU.Service = @service AND Contains(SKU.Description, @st) ORDER BY SKU.Description");
			qry.AddParameter("curTask", curTskId);
			qry.AddParameter("service", "1");
			qry.AddParameter("st", searchText);
			var c = qry.Execute();		
			return c; 
		} else {
			var qry = new Query("SELECT SKU.Id FROM Catalog_SKU SKU WHERE Service = @service AND Contains(SKU.Description, @st) ORDER BY SKU.Description");
			qry.AddParameter("curTask", curTskId);
			qry.AddParameter("service", "1");
			qry.AddParameter("st", searchText);
			var c = qry.ExecuteCount();	
			return c;		
		}
	}else{
		if (getCount == 0) {
			var qry = new Query("SELECT SKU.Id, SKU.Description, UN.Description AS Unit, UN.Id AS UnId " +
					"FROM Catalog_SKU SKU " +
					"LEFT JOIN Catalog_Unit UN ON SKU.Unit = UN.Id " +
					"WHERE SKU.Service = @service ORDER BY SKU.Description");
			qry.AddParameter("curTask", curTskId);
			qry.AddParameter("service", "1");
			var c = qry.Execute();		
			return c; 
		} else {
			var qry = new Query("SELECT Id FROM Catalog_SKU WHERE Service = @service");
			qry.AddParameter("curTask", curTskId);
			qry.AddParameter("service", "1");
			var c = qry.ExecuteCount();	
			return c;		
		}
	}
}

function AddJob(sender,sKUId,addCountText,curTskId,curAVRId, edtSearch) {

	var addCount = sender.Parent.GetControl(0).GetControl(0).Text;
	
			
		if (addCount != null && addCount != "" && parseFloat(addCount) != parseFloat(0)){
				//записываем данные в таблицу материалов AVR
				
				var qry = new Query("SELECT Id, Count FROM Document_bitmobile_AVR_Jobs WHERE Ref = @curAVRId AND SKU = @sKUId");
				qry.AddParameter("sKUId", sKUId);
				qry.AddParameter("curAVRId", curAVRId);
				var stokRow = qry.Execute();
								
				if (stokRow.Next()) {
					var stokRowId = stokRow.Id;
					var obj = stokRowId.GetObject();
					var stokRowCount = parseFloat(stokRow.Count);
					obj.Count = stokRowCount + parseFloat(addCount);
					obj.Save(false);
				}else{					
					var obj = DB.Create("Document.bitmobile_AVR_Jobs");
					obj.Ref = curAVRId;
					obj.SKU = sKUId;
					obj.Count = parseFloat(addCount);
					obj.Save(false);
				}
									
		}else{
			Dialog.Message("Добавляемое количество указано не корректно.");
			return;
		}
	
	Workflow.Refresh([edtSearch, curTskId, curAVRId]);
}



//СКРИН PHOTOS

function GetSKUShapshot(curTsk, aVRId) {
	GetCameraObject(curTsk.Id, aVRId);
	Camera.MakeSnapshot(SaveAtAVR, [curTsk, aVRId]);
	
}

function GetCameraObject(curTskId, aVRId) {
	FileSystem.CreateDirectory("/private/Document.bitmobile_AVR");
	var guid = GenerateGuid();
	Variables.Add("guid", guid);
	var path = String.Format("/private/Document.bitmobile_AVR/{0}/{1}.jpg", aVRId.Id, guid);
	Camera.Size = 800;
	Camera.Path = path;
}

function GenerateGuid() {
	return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}

function SaveAtAVR(arr) {
	var curTsk = arr[0];
	var aVRId = arr[1];
	tskObj = DB.Create("Document.bitmobile_AVR_Photo");
	//Dialog.Debug(aVRId);
	tskObj.Ref = aVRId;
	var guid = Variables["guid"];
	//Dialog.Debug(guid);
	tskObj.Guid = guid;
	tskObj.Path = String.Format("/private/Document.bitmobile_AVR/{0}/{1}.jpg", aVRId.Id, guid);
	tskObj.Date = DateTime.Now; 
	tskObj.Save(false);
	//control.Text = Translate["#snapshotAttached#"];
	Workflow.Refresh([curTsk]);
}


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

function KillPhoto(curTskId, photoId){
	
	DB.Delete(photoId);
			
	Workflow.Refresh([curTskId]);
}



//СКРИН RESUME

function GetStatusTask(curTsk){
	var qry = new Query();
	
	if (statusIdGlob == null){
		qry.Text = "SELECT _STAT.Name AS StatName, _STAT.Description AS StatDes FROM Document_Task TSK " +
			"LEFT JOIN Enum_StatusTasks _STAT ON TSK.StatusTasks = _STAT.Id " +
			"WHERE TSK.Id = @currentObject"
		qry.AddParameter("currentObject", curTsk);
	}else{				
		qry.Text = "SELECT _STAT.Name AS StatName, _STAT.Description AS StatDes " +
			"FROM Enum_StatusTasks _STAT " +
			"WHERE _STAT.Id = @statusIdGlob";			
		qry.AddParameter("statusIdGlob", statusIdGlob);
	}
	var s = qry.Execute();
	
	if (s.Next()) {
		return qry.Execute();
	}else{
		return 0;
	}
	
}

function GetTaskResume(curTskId){
	var qry = new Query("SELECT TSK.Id, TSK.TimeStart, TSK.TimeFinish, TSK.TimeSpent, TSK.TimeReactionNorm, TSKC.Id AS TSKCId, TSKC.Comment, AVR.ValueBrigade AS ValueBrigade " +
			"FROM Document_Task TSK " +
			"LEFT JOIN Document_Task_Comment TSKC ON TSKC.Ref = TSK.Id " +
			"LEFT JOIN Document_bitmobile_AVR AVR ON AVR.Task = TSK.Id " +
			"WHERE TSK.Id = @curTskId");
	qry.AddParameter("curTskId", curTskId);
	return qry.Execute();
}

function StatusDoSelect(entity, attribute, control) {
    var tableName = entity[attribute].Metadata().TableName;
    var query = new Query();
    query.Text = "SELECT Id, Description FROM " + tableName + " WHERE Id != @newSt ORDER BY ID DESC";
    query.AddParameter("newSt", "@ref[Enum_StatusTasks]:b92d0bb1-9062-74ef-428d-7384740ad3c2");
    Dialog.Select("#select_answer#", query.Execute(), StatusDoSelectCallback1, [entity, attribute, control]);
            
    return;
}

function StatusDoSelectCallback1(key, args) {
	
	var entity = args[0];
	var attribute = args[1];
    var control = args[2];
        
    var obj = entity.GetObject();
    obj[attribute] = key;
            
    var tmStart = obj.TimeStart;
    
    var q = new Query("SELECT strftime('%s', 'now') - strftime('%s', @tmStart)");
	q.AddParameter("tmStart", tmStart);
	var minusDate = q.ExecuteScalar();
	
	var deltaM = (minusDate/60) + (4*60);
	
	//Dialog.Debug(deltaM);
	
	var delta = 0;
	
	if(deltaM > 0){
		var deltaHh = Math.floor(Math.round(deltaM)/60);
		var deltaMm = Math.round(deltaM) - deltaHh * 60;
		delta = deltaHh + deltaMm*0.01;
  		  		 		
  	}	
	
	    
    tmFin = DateTime.Now;
    
    if(key.Id == "b9b59f80-b32f-d50d-49b2-a933459dbe91"){	//Закрыта
    	obj["TimeFinish"] = tmFin;
    	obj["TimeSpent"] = delta;
    }
        
    if(key.Id == "983204d6-92aa-e0fd-4315-258242877c2f"){  //отменена  	
    	obj["TimeFinish"] = tmFin;
    	obj["TimeSpent"] = null;
    }
    
    if(key.Id == "867cc4e2-98af-3371-467d-ee879cd0d665"){  //в работе  	
    	obj["TimeFinish"] = null;
    	obj["TimeSpent"] = null;
    }
    
    obj.Save();
    
  //очистим глоб переменные для повторного исполнения запросов на основном экране
    $.Remove("peremDoneTask");
	$.AddGlobal("peremDoneTask", null);
	
	$.Remove("peremNewTask");
	$.AddGlobal("peremNewTask", null);
	
	$.Remove("peremPlanTask");
	$.AddGlobal("peremPlanTask", null);
	
	$.Remove("peremCrashTask");
	$.AddGlobal("peremCrashTask", null);
	//
    
    control.Text = key.Description;
    
    //записываем финишные координаты в АВР. Ну или удаляем, если состояние снова в работе
    var taskRef = obj.Id;
    var q = new Query("SELECT Id From Document_bitmobile_AVR WHERE Task = @taskRef");
	q.AddParameter("taskRef", taskRef);
	var objAVR = q.ExecuteScalar();
	
	var aVRObj = objAVR.GetObject();
    
	if(key.Id == "b9b59f80-b32f-d50d-49b2-a933459dbe91"){	//Закрыта
		var location = GPS.CurrentLocation;
	    if (location.NotEmpty) {
	    	aVRObj.LatitudeFinish = location.Latitude;
	    	aVRObj.LongitudeFinish = location.Longitude;	    		    	
	    }
    }
        
    if(key.Id == "983204d6-92aa-e0fd-4315-258242877c2f"){  //отменена  	
    	var location = GPS.CurrentLocation;
	    if (location.NotEmpty) {
	    	aVRObj.LatitudeFinish = location.Latitude;
	    	aVRObj.LongitudeFinish = location.Longitude;	    	
	    }
    }
    
    if(key.Id == "867cc4e2-98af-3371-467d-ee879cd0d665"){  //в работе  	
    	aVRObj.LatitudeFinish = 0;
    	aVRObj.LongitudeFinish = 0;
    }
	
    aVRObj.Save();
    
    Workflow.Refresh([entity, 0]);
    
    return;
}

function ValueBrigadeChange(curTskId, AVRId, brigadeBox){
	
	var obj = AVRId.GetObject();
	obj.ValueBrigade = parseFloat(brigadeBox);
	obj.Save(false);
	Workflow.Refresh([curTskId, 0]);
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
	var commentCount = StrLen(comment);
	if(commentCount >=78){
		var comment = Mid(comment, 1, 77);
		return comment;
	}else{
		return 0;
	}	
}



//СКРИН КОММЕНТАРИЙ ИТОГОВ ЗАЯВКИ НА СО

function GetComment(curTskId){
	var qry = new Query("SELECT CM.Id, CM.Comment FROM Document_Task_Comment CM WHERE Ref = @curTask");
	qry.AddParameter("curTask", curTskId);
	var c = qry.Execute();
	return c; 
}

function GreateComment(comment, ref) {

	var doc = DB.Create("Document.Task_Comment");
	doc.Ref = ref;
	doc.Comment = comment;
		
	doc.Save(false);

	Workflow.Back();
}

function EditComment(comment, commentId) {
	var doc = commentId.GetObject();
	doc.Comment = comment;
		
	doc.Save(false);

	Workflow.Back();
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


function CallEmergency(tel){
	if (tel != "") {
		Phone.Call(tel);		
	} else {
		return;
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



//ОБЩАЯ ФУНЦИЯ ДЛЯ ТЕСТОВ

function Test(p){
	Dialog.Debug(p);
	return p;
}


//ОБЩАЯ ФОРМАТ ДАТА ВРЕМЯ
function ConvertDate(tskDate){
	if(tskDate != null && tskDate != 0){
		var t = String.Format("{0:dd/MM/yy HH:mm}", DateTime.Parse(tskDate));
//		var st = tskDate - DateTime.Now.Date;
//		var tSt = String(t)+". Осталось "+st+" ч."
//		return tSt;
		return t;
	}else{
		var t = "Время не указано";
		return t;
	}
}

function GetDate_ddMMyy(Period)
{
	var s = String.Format("{0:dd/MM/yy}", DateTime.Parse(Period));
	return s;
}





