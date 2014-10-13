//-------------------------- Переменные контроллера

var tasksbeginDateCP;
var tasksendDateCP;
var TechnicsCP;
var CurWaybillCP;
var WaybillsCP;
var TechnicsDescriptionCP;
var TechnicsVRTCP;

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
	
	var WaybillsCnt = WaybillsCP.Count();
	
	if(WaybillsCnt == 1){
		
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
