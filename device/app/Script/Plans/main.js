//function GetPlansCount()
//{
//	var qry = new Query("SELECT * FROM Document_Plan " +
//			"WHERE (StatusPlan = @st1 OR StatusPlan = @st2) " +
//			"AND DeletionMark = 0 ");
//	qry.AddParameter("st1", "@ref[Enum_StatusPlan]:bff8024a-6460-34a4-4752-6a6d1975c8d7");
//	qry.AddParameter("st2", "@ref[Enum_StatusPlan]:898eba88-3e6e-79d5-48fb-88252f7fe890");
//	return qry.ExecuteCount();
//}

function GetPlans(){
	var userId = $.common.UserId;
	
	var qry = new Query("SELECT P.Id, P.Period, P.StatusPlan FROM Document_Plan P " +
			"INNER JOIN Catalog_User _US ON _US.Department = P.Department " +
			"WHERE (P.StatusPlan = @st1 OR P.StatusPlan = @st2 OR P.StatusPlan = @st3) " +
			"AND P.DeletionMark = 0 " +
			"AND _US.Id = @userId");
	qry.AddParameter("st1", "@ref[Enum_StatusPlan]:bff8024a-6460-34a4-4752-6a6d1975c8d7");
	qry.AddParameter("st2", "@ref[Enum_StatusPlan]:898eba88-3e6e-79d5-48fb-88252f7fe890");
	qry.AddParameter("st3", "@ref[Enum_StatusPlan]:b5aaffd3-ad90-ff6f-4236-3124cd966caf");
	qry.AddParameter("userId", "@ref[Catalog_User]:" + userId);
	var exctPlans = qry.Execute().Unload();
		
	return exctPlans;
}

function GetCntPlans(plans){
	return plans.Count();
}

function GetObjectListCount(currentPlan)
{
	var qry = new Query("SELECT ID FROM Document_Plan_ObjectList WHERE Document_Plan_ObjectList.Ref == @P");
	qry.AddParameter("P",currentPlan);
	return qry.ExecuteCount();
	//var Cnt = qry.ExecuteCount();
	//Dialog.Debug(Cnt);
	//return Cnt;
}

function GetCount_DatePlanNotNull(currentPlan){
	var qry = new Query("SELECT ID FROM Document_Plan_ObjectList WHERE Document_Plan_ObjectList.Ref == @P AND Document_Plan_ObjectList.DatePlan IS NOT NULL");
	qry.AddParameter("P",currentPlan);
	return qry.ExecuteCount();
}

function GetStatusPlan(planId){
	var qry = new Query("SELECT STAT.Name AS StatName, COMM.DenialReason AS Comment " +
			"FROM Document_Plan PL " +
			"LEFT JOIN Enum_StatusPlan STAT ON PL.StatusPlan = STAT.Id " +
			"LEFT JOIN Document_Plan_Denial COMM ON COMM.Ref = PL.Id " +
			"WHERE PL.Id == @planId");
	qry.AddParameter("planId", planId);
	var Cnt = qry.Execute();
	//Dialog.Debug(Cnt);
	return Cnt;
	//return qry.ExecuteScalar();	
}

function EditStatusPlan(currentPlan,statusPlan) {
	//проверим на наличие пустых дат в плане
	var qq = new Query("Select Id FROM Document_Plan_ObjectList WHERE DatePlan is null AND Ref == @currentPlan");
	qq.AddParameter("currentPlan", currentPlan);
	var ct = qq.ExecuteCount();
	
	if (ct > 0) {
		Dialog.Message("Имеются нераспланированные визиты");
		return;
	} else {
		var q = new Query("Select Id FROM Enum_StatusPlan WHERE Name == @statusPlan");
		q.AddParameter("statusPlan", statusPlan);
		var st = q.ExecuteScalar();
			
		
		var planObj = currentPlan.GetObject();
		planObj.StatusPlan = st;
		planObj.Save(false);
		Workflow.Back();
	}
}

function GetObjectList(currentPlan)
{
	var qry = new Query("SELECT O.Description AS Object, O.Id AS ObjectId, DIS.Description AS IntervalService, OL.Id AS LineId, OL.DatePlan AS DatePlan, OL.DateLastService AS LastService FROM Document_Plan_ObjectList OL LEFT JOIN Catalog_Object O ON OL.Object = O.Id LEFT JOIN Catalog_IntervalService DIS ON OL.IntervalService = DIS.Id  WHERE OL.Ref == @P");
	qry.AddParameter("P",currentPlan);
	return qry.Execute();
}

function GetPasspObject(currentObject)
{
	var qry = new Query("SELECT OBJ.Id AS ObjId, OBJ.Description AS Description, OBJ.Address AS Address, OBJ.Latitude AS Latitude, OBJ.Longitude AS Longitude, CONT.Description AS DesCont, CONT.Date AS DateCont FROM Catalog_Object OBJ LEFT JOIN Catalog_Contracts CONT ON OBJ.Id = CONT.Object WHERE OBJ.Id == @P");
	qry.AddParameter("P",currentObject);
	return qry.Execute();
}

function GetContractDate(refObject)
{
	var qry = new Query("SELECT Catalog_Contracts.Date FROM Catalog_Contracts WHERE Catalog_Contracts.Object == @P");
	qry.AddParameter("P",refObject);
	return qry.Execute();
}

function GetDate_y(Period)
{
	if(Period != null){
		var s = String.Format("{0:y}", DateTime.Parse(Period));
	}else{
		var s = "";
	}
	return s;
}

function GetDate_ddMMyy(Period)
{
	var s = String.Format("{0:dd/MM/yy}", DateTime.Parse(Period));
	return s;
}

function SetDateObjectList(vizitId,datePlan,StatPl,planPeriod,rowDatePlan) {
	if(StatPl == 0){
		return;
	}
	
	var header = Translate["#enterDateTime#"];
	
	if(rowDatePlan == null){
		Dialog.ShowDateTime(header, SetDatePlanNow, [vizitId, datePlan, planPeriod]);
	}else{
		Dialog.ShowDateTime(header, rowDatePlan, SetDatePlanNow, [vizitId, datePlan, planPeriod]);
	}
}

function SetDatePlanNow(key, arr) {
	var vizitId = arr[0];
	var datePlan = arr[1];
	var planPeriod = arr[2];
	//Dialog.Debug(planPeriod);
	var beginPlanPeriod = BegOfMonth(planPeriod);
	var endPlanPeriod = EndOfMonth(planPeriod);
//	Dialog.Debug(beginPlanPeriod);
//	Dialog.Debug(key);
	
	//DateTime.Parse(Period)
	
	if(key < beginPlanPeriod || key > endPlanPeriod){
		Dialog.Message("Установите дату в пределах планируемого месяца!");
	}else{
		Variables[datePlan].Text = String.Format("{0:dd/MM/yy}", key);

		var obj = vizitId.GetObject();
		obj.DatePlan = key;
		obj.Save(false);
	}
}

function KillDatePlan(vizitId, currentPlan, planPeriod){
	$.datePlan.Text = null;
	//Dialog.Debug(vizitId);
	var obj = vizitId.GetObject();
	obj.DatePlan = null;
	obj.Save(false);
	Workflow.Refresh([currentPlan, planPeriod]);
}

function GetPlansSumString(plan)
{
	return "tasksumstring";
}

function CheckProcessingStatusAndForward(plan, flag)
{
}

function GetTime(value)
{
	return "time";
}

function AssignNumberIfNotExist(plan)
{
	return "number";
}

function CommentValueCheck(comment){
	if(IsBlankString(comment) == false){
		return 1;
	}else{
		return 0;
	}
}



//СКРИН "КОММЕНТАРИЙ К ПЛАНУ"

function CreateComment(currentPlan){ //при открытии коммента впервые, создается пустой коммент для данного плана
	var comment = DB.Create("Document.Plan_Denial");
	comment.Ref = currentPlan;
	comment.Save();
	
	$.Remove("myRow");
	$.Add("myRow",comment);
}

function GetCommentID(currentPlan){
	var qry = new Query("SELECT Id, DenialReason FROM Document_Plan_Denial WHERE Document_Plan_Denial.Ref == @P");
	qry.AddParameter("P",currentPlan);			
	var rst = qry.Execute();
	rst.Next();	
	$.Add("myRow",rst);
	
	if ($.myRow.Id == null){
		CreateComment(currentPlan);
	}
	return currentPlan;
}

function EditComment(commentId, comment) {
	contactObj = commentId.GetObject();
	contactObj.DenialReason = comment;
	contactObj.Save();
	Workflow.Back();
}



//СКРИН "ОБЪЕКТ"

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

function GetTripWayPoints(currentObject){
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

function NullCoordMess(){
	Dialog.Message("Координаты точки не заданы");
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



//ФУНКЦИЯ ДЛЯ ТЕСТОВ

function Test(p){
	Dialog.Debug(p);
	return p;
}
