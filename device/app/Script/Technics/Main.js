//-------------------------- Переменные контроллера

var tasksbeginDateCP;
var tasksendDateCP;
var TechnicsCP

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

function AddPeremAndDoAction(TechnicsID){
	TechnicsCP = TechnicsID; // запишем в переменную модуля ID
	//Dialog.Debug(taskId);
	Workflow.Action("TechTasks", []); 
}

//-------------------------- Скрин TechTasks

function GetCurrentTechTasks(TechnicsCP){
	
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
