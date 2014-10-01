var peremNewsCount; 	//новости
var peremDoneTask;		//выполненные заявки
var peremNewTask;		//новые заявки
var peremPlanTask;		//плановые заявки
var peremCrashTask;		//аварийные заявки
var peremInMovingMain;	//входящие перемещения
var peremOutMovingMain;	//исходящие перемещения

function OnLoading() {    
		
	if($.Exists("peremNewsCount") == false){
		$.AddGlobal("peremNewsCount", null);
	}else{
		peremNewsCount = $.peremNewsCount; 		//новости
	}
	
	if($.Exists("peremDoneTask") == false){
		$.AddGlobal("peremDoneTask", null);
	}else{
		peremDoneTask = $.peremDoneTask; 		//выполненные заявки
	}
	
	if($.Exists("peremNewTask") == false){
		$.AddGlobal("peremNewTask", null);
	}else{
		peremNewTask = $.peremNewTask; 		//новые заявки
	}
	
	if($.Exists("peremPlanTask") == false){
		$.AddGlobal("peremPlanTask", null);
	}else{
		peremPlanTask = $.peremPlanTask; 		//плановые заявки
	}
	
	if($.Exists("peremCrashTask") == false){
		$.AddGlobal("peremCrashTask", null);
	}else{
		peremCrashTask = $.peremCrashTask; 		//аварийные заявки
	}
	
	if($.Exists("peremInMovingMain") == false){
		$.AddGlobal("peremInMovingMain", null);
	}else{
		peremInMovingMain = $.peremInMovingMain; 		//входящие перемещения
	}
	
	if($.Exists("peremOutMovingMain") == false){
		$.AddGlobal("peremOutMovingMain", null);
	}else{
		peremOutMovingMain = $.peremOutMovingMain; 		//исходящие перемещения
	}		
			
}

// ------------------------ Main screen module ------------------------

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




//var peremNewsCount; 	//новости
//var peremDoneTask;		//выполненные заявки
//var peremNewTask;		//новые заявки
//var peremPlanTask;		//плановые заявки
//var peremCrashTask;		//аварийные заявки
//var peremInMovingMain;	//входящие перемещения
//var peremOutMovingMain;	//исходящие перемещения



//ДЛЯ ЧАСТИ ЭКРАНА МЕНЮ

function NewsCount() {
	
	if(peremNewsCount == null){
		var userId = $.common.UserId;
		
		var qry = new Query("SELECT _NEWS.Id FROM Document_News _NEWS " +
				"INNER JOIN  Document_News_Addressee _ADR ON _ADR.Ref = _NEWS.Id " +
				"WHERE _ADR.User = @userId AND _ADR.Read = 0 AND _NEWS.Posted = 1");
//		return qry.ExecuteCount();
		
		qry.AddParameter("userId", "@ref[Catalog_User]:" + userId);
		
		peremNewsCount = qry.ExecuteCount();
		
		$.Remove("peremNewsCount");
		$.Add("peremNewsCount", peremNewsCount);
	}
	
	return peremNewsCount;
}

function DoneTask() {
	if(peremDoneTask == null){
		var userId = $.common.UserId;
		
		var qry = new Query("SELECT TSK.Id AS tskId " +
			"FROM Document_Task TSK " +
				"INNER JOIN Catalog_User _US ON _US.Department = TSK.Department " +
				"LEFT JOIN Catalog_Object OBJ ON TSK.Object = OBJ.ID " +
				"LEFT JOIN Enum_StatusTasks STAT ON TSK.StatusTasks = STAT.Id " +
				"LEFT JOIN Enum_ViewTasks VIEW ON TSK.ViewTasks = VIEW.Id " +
			"WHERE _US.Id = @userId AND TSK.StatusTasks=@StatusTasksDone AND TSK.Date >= @DateStart AND TSK.Date < @DateEnd");
//		return qry.ExecuteCount();
		
		qry.AddParameter("StatusTasksDone", "@ref[Enum_StatusTasks]:b9b59f80-b32f-d50d-49b2-a933459dbe91"); //выполненные
		qry.AddParameter("DateStart", DateTime.Now.Date);
		qry.AddParameter("DateEnd", DateTime.Now.Date.AddDays(1));
		qry.AddParameter("userId", "@ref[Catalog_User]:" + userId);
		
		peremDoneTask = qry.ExecuteCount();
		
		$.Remove("peremDoneTask");
		$.Add("peremDoneTask", peremDoneTask);
	}
	
	return peremDoneTask;
}

function NewTask() {
	if(peremNewTask == null){
		var userId = $.common.UserId;
		
		var qry = new Query("SELECT TSK.Id AS tskId " +
			"FROM Document_Task TSK " +
				"INNER JOIN Catalog_User _US ON _US.Department = TSK.Department " +
				"LEFT JOIN Catalog_Object OBJ ON TSK.Object = OBJ.ID " +
				"LEFT JOIN Enum_StatusTasks STAT ON TSK.StatusTasks = STAT.Id " +
				"LEFT JOIN Enum_ViewTasks VIEW ON TSK.ViewTasks = VIEW.Id " +
			"WHERE _US.Id = @userId AND TSK.DeletionMark = 0 AND TSK.StatusTasks=@StatusTasksNew AND TSK.Date >= @DateStart AND TSK.Date < @DateEnd");
		
		qry.AddParameter("StatusTasksNew", "@ref[Enum_StatusTasks]:b92d0bb1-9062-74ef-428d-7384740ad3c2");//новые
		qry.AddParameter("DateStart", DateTime.Now.Date);
		qry.AddParameter("DateEnd", DateTime.Now.Date.AddDays(1));
		qry.AddParameter("userId", "@ref[Catalog_User]:" + userId);
		
		peremNewTask = qry.ExecuteCount();
		
		$.Remove("peremNewTask");
		$.Add("peremNewTask", peremNewTask);
	}
	
	return peremNewTask;
}

function jopa(){
	
}

function PlanTask() {
	if(peremPlanTask == null){
		var userId = $.common.UserId;
				
		var qry = new Query("SELECT TSK.Id AS tskId " +
			"FROM Document_Task TSK " +
				"INNER JOIN Catalog_User _US ON _US.Department = TSK.Department " +
				"LEFT JOIN Catalog_Object OBJ ON TSK.Object = OBJ.ID " +
				"LEFT JOIN Enum_StatusTasks STAT ON TSK.StatusTasks = STAT.Id " +
				"LEFT JOIN Enum_ViewTasks VIEW ON TSK.ViewTasks = VIEW.Id " +
			"WHERE _US.Id = @userId AND TSK.DeletionMark = 0 AND TSK.ViewTasks=@ViewTasksPlan AND DateTime(TSK.Date) >= DateTime('now','start of day') AND DateTime(TSK.Date) < DateTime('now','start of day','+1 day')");
		
		qry.AddParameter("ViewTasksPlan", "@ref[Enum_ViewTasks]:a4424c1a-5cba-9df8-4b81-5f23f7d849db");
		qry.AddParameter("DateStart", DateTime.Now.Date);
		qry.AddParameter("DateEnd", DateTime.Now.Date.AddDays(1));
		qry.AddParameter("userId", "@ref[Catalog_User]:" + userId);
		
		//Dialog.Debug(DateTime.Now.Date + " " +DateTime.Now.Date.AddDays(1))
		
		
		peremPlanTask = qry.ExecuteCount();
		
		$.Remove("peremPlanTask");
		$.Add("peremPlanTask", peremPlanTask);
	}
	
	return peremPlanTask;
}

function CrashTask() {
	if(peremCrashTask == null){
		var userId = $.common.UserId;
		
		var qry = new Query("SELECT TSK.Id AS tskId " +
			"FROM Document_Task TSK " +
				"INNER JOIN Catalog_User _US ON _US.Department = TSK.Department " +
				"LEFT JOIN Catalog_Object OBJ ON TSK.Object = OBJ.ID " +
				"LEFT JOIN Enum_StatusTasks STAT ON TSK.StatusTasks = STAT.Id " +
				"LEFT JOIN Enum_ViewTasks VIEW ON TSK.ViewTasks = VIEW.Id " +
			"WHERE _US.Id = @userId AND TSK.ViewTasks=@ViewTasksCrash AND TSK.Date >= @DateStart AND TSK.Date < @DateEnd");
		
		qry.AddParameter("ViewTasksCrash", "@ref[Enum_ViewTasks]:bcd5b4a7-3772-8806-4fb9-7439ad8f2c14");
		qry.AddParameter("DateStart", DateTime.Now.Date);
		qry.AddParameter("DateEnd", DateTime.Now.Date.AddDays(1));
		qry.AddParameter("userId", "@ref[Catalog_User]:" + userId);
		
		peremCrashTask = qry.ExecuteCount();
		
		$.Remove("peremCrashTask");
		$.Add("peremCrashTask", peremCrashTask);
	}
	
	return peremCrashTask;
}

function InMovingMain() {
	if(peremInMovingMain == null){
		var userId = $.common.UserId;
		
		var stst = "Отправлена";
		
		var qry = new Query("SELECT _MOV.Id " +
			"FROM Document_Moving _MOV " +
			"INNER JOIN Catalog_Sklad_Department _DEP ON _DEP.Ref = _MOV.MoveTo " +
			"INNER JOIN Catalog_Department DEP ON DEP.Id = _DEP.Depart " +
			"INNER JOIN Catalog_User _US ON _US.Department = DEP.Id " +
			"LEFT JOIN Enum_MovingStatus _STAT ON _MOV.Status = _STAT.Id " +
			"WHERE _US.Id = @userId AND _STAT.Name = @stst");
		
		qry.AddParameter("userId", "@ref[Catalog_User]:" + userId);
		qry.AddParameter("stst", stst);
		
		peremInMovingMain = qry.ExecuteCount();
		
		$.Remove("peremInMovingMain");
		$.Add("peremInMovingMain", peremInMovingMain);
	}
	
	return peremInMovingMain;
}

function OutMovingMain() {
	if(peremOutMovingMain == null){
		var userId = $.common.UserId;
		var stst = "Новая";
		var dfdf = "Отправлена";
		
		var qry = new Query("SELECT _MOV.Id " +
			"FROM Document_Moving _MOV " +
			"INNER JOIN Catalog_Sklad_Department _DEP ON _DEP.Ref = _MOV.MoveFrom " +
			"INNER JOIN Catalog_Department DEP ON DEP.Id = _DEP.Depart " +
			"INNER JOIN Catalog_User _US ON _US.Department = DEP.Id " +
			"LEFT JOIN Enum_MovingStatus _STAT ON _MOV.Status = _STAT.Id " +
			"WHERE _US.Id = @userId AND (_STAT.Name = @stst OR _STAT.Name = @dfdf)");
		
		qry.AddParameter("userId", "@ref[Catalog_User]:" + userId);	
		qry.AddParameter("stst", stst);
		qry.AddParameter("dfdf", dfdf);
		
		peremOutMovingMain = qry.ExecuteCount();
		
		$.Remove("peremOutMovingMain");
		$.Add("peremOutMovingMain", peremOutMovingMain);
	}
	
	return peremOutMovingMain;
}

//ДЛЯ ОСНОВНОГО ЭКРАНА

function GetDoneTask(){
	var q = new Query();
	var qtext = "SELECT TSK.Id AS tskId " +
			"FROM Document_Task TSK " +
				"LEFT JOIN Catalog_Object OBJ ON TSK.Object = OBJ.ID " +
				"LEFT JOIN Enum_StatusTasks STAT ON TSK.StatusTasks = STAT.Id " +
				"LEFT JOIN Enum_ViewTasks VIEW ON TSK.ViewTasks = VIEW.Id " +
			"WHERE TSK.StatusTasks=@StatusTasksDone AND TSK.Date >= @DateStart AND TSK.Date < @DateEnd";
	var qtextCount = qtext;	
		
	q.AddParameter("StatusTasksDone", "@ref[Enum_StatusTasks]:b9b59f80-b32f-d50d-49b2-a933459dbe91"); //выполненные
	q.AddParameter("DateStart", DateTime.Now.Date);
	q.AddParameter("DateEnd", DateTime.Now.Date.AddDays(1));
			
	q.Text = qtextCount;
	return q.ExecuteCount();	
}

function GetNewTask(){
	var q = new Query();
	var qtext = "SELECT TSK.Id AS tskId " +
			"FROM Document_Task TSK " +
				"LEFT JOIN Catalog_Object OBJ ON TSK.Object = OBJ.ID " +
				"LEFT JOIN Enum_StatusTasks STAT ON TSK.StatusTasks = STAT.Id " +
				"LEFT JOIN Enum_ViewTasks VIEW ON TSK.ViewTasks = VIEW.Id " +
			"WHERE TSK.StatusTasks=@StatusTasksNew AND TSK.Date >= @DateStart AND TSK.Date < @DateEnd";
	var qtextCount = qtext;	
		
	q.AddParameter("StatusTasksNew", "@ref[Enum_StatusTasks]:b92d0bb1-9062-74ef-428d-7384740ad3c2");//новые
	q.AddParameter("DateStart", DateTime.Now.Date);
	q.AddParameter("DateEnd", DateTime.Now.Date.AddDays(1));
			
	q.Text = qtextCount;
	return q.ExecuteCount();	
}

function GetPlanTask(){
	var q = new Query();
	var qtext = "SELECT TSK.Id AS tskId " +
			"FROM Document_Task TSK " +
				"LEFT JOIN Catalog_Object OBJ ON TSK.Object = OBJ.ID " +
				"LEFT JOIN Enum_StatusTasks STAT ON TSK.StatusTasks = STAT.Id " +
				"LEFT JOIN Enum_ViewTasks VIEW ON TSK.ViewTasks = VIEW.Id " +
			"WHERE TSK.ViewTasks=@ViewTasksPlan AND TSK.Date >= @DateStart AND TSK.Date < @DateEnd";
	var qtextCount = qtext;	
		
	q.AddParameter("ViewTasksPlan", "@ref[Enum_ViewTasks]:a4424c1a-5cba-9df8-4b81-5f23f7d849db");
	q.AddParameter("DateStart", DateTime.Now.Date);
	q.AddParameter("DateEnd", DateTime.Now.Date.AddDays(1));
	//q.AddParameter("StatusTasksNew", "@ref[Enum_StatusTasks]:b92d0bb1-9062-74ef-428d-7384740ad3c2"); //новые
			
	q.Text = qtextCount;
	return q.ExecuteCount();	
}

function GetCrashTask(){
	var q = new Query();
	var qtext = "SELECT TSK.Id AS tskId " +
			"FROM Document_Task TSK " +
				"LEFT JOIN Catalog_Object OBJ ON TSK.Object = OBJ.ID " +
				"LEFT JOIN Enum_StatusTasks STAT ON TSK.StatusTasks = STAT.Id " +
				"LEFT JOIN Enum_ViewTasks VIEW ON TSK.ViewTasks = VIEW.Id " +
			"WHERE TSK.ViewTasks=@ViewTasksCrash AND TSK.Date >= @DateStart AND TSK.Date < @DateEnd";
	var qtextCount = qtext;	
		
	q.AddParameter("ViewTasksCrash", "@ref[Enum_ViewTasks]:bcd5b4a7-3772-8806-4fb9-7439ad8f2c14");
	q.AddParameter("DateStart", DateTime.Now.Date);
	q.AddParameter("DateEnd", DateTime.Now.Date.AddDays(1));
	//q.AddParameter("StatusTasksNew", "@ref[Enum_StatusTasks]:b92d0bb1-9062-74ef-428d-7384740ad3c2"); //новые
			
	q.Text = qtextCount;
	return q.ExecuteCount();	
}


function GetInMovingMain(){
	
	var userId = $.common.UserId;
		
	var stst = "Отправлена";
			
	var qry = new Query("SELECT _MOV.Id " +
			"FROM Document_Moving _MOV " +
			"INNER JOIN Catalog_Sklad_Department _DEP ON _DEP.Ref = _MOV.MoveTo " +
			"INNER JOIN Catalog_Department DEP ON DEP.Id = _DEP.Depart " +
			"INNER JOIN Catalog_User _US ON _US.Department = DEP.Id " +
			"LEFT JOIN Enum_MovingStatus _STAT ON _MOV.Status = _STAT.Id " +
			"WHERE _US.Id = @userId AND _STAT.Name = @stst");
	qry.AddParameter("userId", "@ref[Catalog_User]:" + userId);
	qry.AddParameter("stst", stst);
	var c = qry.ExecuteCount();	
	return c;	
}

function GetOutMovingMain(){
	
	var userId = $.common.UserId;
	var stst = "Новая";
	var dfdf = "Отправлена";
	
	var qry = new Query("SELECT _MOV.Id " +
			"FROM Document_Moving _MOV " +
			"INNER JOIN Catalog_Sklad_Department _DEP ON _DEP.Ref = _MOV.MoveFrom " +
			"INNER JOIN Catalog_Department DEP ON DEP.Id = _DEP.Depart " +
			"INNER JOIN Catalog_User _US ON _US.Department = DEP.Id " +
			"LEFT JOIN Enum_MovingStatus _STAT ON _MOV.Status = _STAT.Id " +
			"WHERE _US.Id = @userId AND (_STAT.Name = @stst OR _STAT.Name = @dfdf)");
	qry.AddParameter("userId", "@ref[Catalog_User]:" + userId);	
	qry.AddParameter("stst", stst);
	qry.AddParameter("dfdf", dfdf);		
	var c = qry.ExecuteCount();	
	return c;	
}