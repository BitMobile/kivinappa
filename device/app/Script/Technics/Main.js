//-------------------------- Переменные контроллера

var tasksbeginDateCP;
var tasksendDateCP;
var requestsCP

//-------------------------- Скрин Requests

function GetRequests(searchText, beginDateParam, endDateParam){
	
	var q = new Query("");
	
	var qtext = "SELECT RCV.Id, RCV.Number, RCV.Date, RCV.EnumTechnicsStatus " +
			"FROM Document_Request RCV " +
			"WHERE RCV.Date >= @DateStart " +
			"AND RCV.Date < @DateEnd " +
			"AND RCV.DeletionMark = 0";
	
	var qtextCount = qtext;
		
	if (searchText != "" && searchText != null) {
		var plus = " AND (Contains(RCV.Number, @st)) ";
		qtext = qtext + plus;
		q.AddParameter("st", searchText);
	}
	
	var textOrd = " ORDER BY RCV.Date";
	
	q.AddParameter("DateStart", beginDateParam);
	q.AddParameter("DateEnd", endDateParam);
	
	q.Text = qtext + textOrd;
	return q.Execute().Unload();		
}

function GetRequestsCount(result){
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

function AddPeremAndDoAction(requestsId){
	requestsCP = requestsId; // запишем в переменную модуля ID
	//Dialog.Debug(taskId);
	Workflow.Action("Request", []); 
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
