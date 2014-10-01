
function GetDocs(getCount){
	var userId = $.common.UserId;
	
	if (getCount == 0) {	
		var qry = new Query("SELECT _NEWS.Id, _NEWS.Date, _NEWS.Number, _NEWS.NewsText FROM Document_News _NEWS " +
				"INNER JOIN  Document_News_Addressee _ADR ON _ADR.Ref = _NEWS.Id " +
				"WHERE _ADR.User = @userId AND _ADR.Read = 0 AND _NEWS.Posted = 1 " +
				"ORDER BY Date DESC");
		
		qry.AddParameter("userId", "@ref[Catalog_User]:" + userId);
		
		var c = qry.Execute();
		return c; 
	} else {
		var qry = new Query("SELECT _NEWS.Id, _NEWS.Date, _NEWS.Number, _NEWS.NewsText FROM Document_News _NEWS " +
				"INNER JOIN  Document_News_Addressee _ADR ON _ADR.Ref = _NEWS.Id " +
				"WHERE _ADR.User = @userId AND _ADR.Read = 0 AND _NEWS.Posted = 1 ");
		
		qry.AddParameter("userId", "@ref[Catalog_User]:" + userId);
		
		var c = qry.ExecuteCount();	
		return c;		
	}
}

function RewiewComment(comment){
	var commentCount = StrLen(comment);
	if(commentCount >=78){
		var comment = Mid(comment, 1, 70);
		return comment;
	}else{
		return 0;
	}	
}

function GetNewsText(newsId){
	var qry = new Query("SELECT NewsText FROM Document_News WHERE Id = @newsId");
	qry.AddParameter("newsId",newsId);
	var c = qry.ExecuteScalar();
	
	return c; 
}

function KillNews(newsId, scr){
	
	var userId = $.common.UserId;
	
	var qry = new Query("SELECT Id FROM Document_News_Addressee WHERE Ref = @newsId AND User = @userId");
	qry.AddParameter("newsId",newsId);
	qry.AddParameter("userId", "@ref[Catalog_User]:" + userId);
	var c = qry.ExecuteScalar();
	
	var obj = c.GetObject();
	obj.Read = 1;
	obj.Save(false);
	
	$.Remove("peremNewsCount");
	$.AddGlobal("peremNewsCount", null);
	
	if(scr == 1){
		Workflow.Refresh([]);		
	}else{
		Workflow.Back();		
	}
}

//
//function GetObjectListCount(currentPlan)
//{
//	var qry = new Query("SELECT ID FROM Document_Plan_ObjectList WHERE Document_Plan_ObjectList.Ref == @P");
//	qry.AddParameter("P",currentPlan);
//	return qry.ExecuteCount();
//	//var Cnt = qry.ExecuteCount();
//	//Dialog.Debug(Cnt);
//	//return Cnt;
//}
//
//function GetCount_DatePlanNotNull(currentPlan){
//	var qry = new Query("SELECT ID FROM Document_Plan_ObjectList WHERE Document_Plan_ObjectList.Ref == @P AND Document_Plan_ObjectList.DatePlan IS NOT NULL");
//	qry.AddParameter("P",currentPlan);
//	return qry.ExecuteCount();
//}
//
//function GetPlans()
//{
//	var qry = new Query("SELECT * FROM Document_Plan");
//	return qry.Execute();
//}
//
//function GetStatusPlan(planId){
//	var qry = new Query("SELECT STAT.Name FROM Document_Plan PL LEFT JOIN Enum_StatusPlan STAT ON PL.StatusPlan = STAT.Id WHERE PL.Id == @planId");
//	qry.AddParameter("planId", planId);
//	var Cnt = qry.ExecuteScalar();
//	//Dialog.Debug(Cnt);
//	return Cnt;
//	//return qry.ExecuteScalar();	
//}
//
//function EditStatusPlan(currentPlan,statusPlan) {
//	//проверим на наличие пустых дат в плане
//	var qq = new Query("Select Id FROM Document_Plan_ObjectList WHERE DatePlan is null AND Ref == @currentPlan");
//	qq.AddParameter("currentPlan", currentPlan);
//	var ct = qq.ExecuteCount();
//	
//	if (ct > 0) {
//		Dialog.Message("Имеются нераспланированные визиты");
//		return;
//	} else {
//		var q = new Query("Select Id FROM Enum_StatusPlan WHERE Name == @statusPlan");
//		q.AddParameter("statusPlan", statusPlan);
//		var st = q.ExecuteScalar();
//			
//		
//		var planObj = currentPlan.GetObject();
//		planObj.StatusPlan = st;
//		planObj.Save(false);
//		Workflow.Back();
//	}
//}
//
//function GetObjectList(currentPlan)
//{
//	var qry = new Query("SELECT O.Description AS Object, O.Id AS ObjectId, DIS.Description AS IntervalService, OL.Id AS LineId, OL.DatePlan AS DatePlan, OL.DateLastService AS LastService FROM Document_Plan_ObjectList OL LEFT JOIN Catalog_Object O ON OL.Object = O.Id LEFT JOIN Catalog_IntervalService DIS ON OL.IntervalService = DIS.Id  WHERE OL.Ref == @P");
//	qry.AddParameter("P",currentPlan);
//	return qry.Execute();
//}
//
//function GetPasspObject(currentObject)
//{
//	var qry = new Query("SELECT OBJ.Id AS ObjId, OBJ.Description AS Description, OBJ.Address AS Address, OBJ.Latitude AS Latitude, OBJ.Longitude AS Longitude, CONT.Description AS DesCont, CONT.Date AS DateCont FROM Catalog_Object OBJ LEFT JOIN Catalog_Contracts CONT ON OBJ.Id = CONT.Object WHERE OBJ.Id == @P");
//	qry.AddParameter("P",currentObject);
//	return qry.Execute();
//}
//
//function GetContractDate(refObject)
//{
//	var qry = new Query("SELECT Catalog_Contracts.Date FROM Catalog_Contracts WHERE Catalog_Contracts.Object == @P");
//	qry.AddParameter("P",refObject);
//	return qry.Execute();
//}
//
//function GetDate_y(Period)
//{
//	if(Period != null){
//		var s = String.Format("{0:y}", DateTime.Parse(Period));
//	}else{
//		var s = "";
//	}
//	return s;
//}
//
//function GetDate_ddMMyy(Period)
//{
//	var s = String.Format("{0:dd/MM/yy}", DateTime.Parse(Period));
//	return s;
//}
//
//function SetDateObjectList(vizitId,datePlan,StatPl) {
//	if(StatPl == 0){
//		return;
//	}
//	
//	var header = Translate["#enterDateTime#"];
//    Dialog.ShowDateTime(header, SetDatePlanNow, [vizitId, datePlan]);
//}
//
//function SetDatePlanNow(key, arr) {
//	var vizitId = arr[0];
//	var datePlan = arr[1];
//	Variables[datePlan].Text = String.Format("{0:dd/MM/yy}", key);
//	//$.datePlan.Text = key;
////	Dialog.Debug(vizitId);
//	var obj = vizitId.GetObject();
//	obj.DatePlan = key;
//	obj.Save(false);
//}
//
//function KillDatePlan(vizitId, currentPlan){
//	$.datePlan.Text = null;
//	//Dialog.Debug(vizitId);
//	var obj = vizitId.GetObject();
//	obj.DatePlan = null;
//	obj.Save(false);
//	Workflow.Refresh([currentPlan]);
//}
//
//function GetPlansSumString(plan)
//{
//	return "tasksumstring";
//}
//
//function CheckProcessingStatusAndForward(plan, flag)
//{
//}
//
//function GetTime(value)
//{
//	return "time";
//}
//
//function AssignNumberIfNotExist(plan)
//{
//	return "number";
//}
//
//
//
////СКРИН "КОММЕНТАРИЙ К ПЛАНУ"
//
//function CreateComment(currentPlan){ //при открытии коммента впервые, создается пустой коммент для данного плана
//	var comment = DB.Create("Document.Plan_Denial");
//	comment.Ref = currentPlan;
//	comment.Save();
//	
//	$.Remove("myRow");
//	$.Add("myRow",comment);
//}
//
//function GetCommentID(currentPlan){
//	var qry = new Query("SELECT Id, DenialReason FROM Document_Plan_Denial WHERE Document_Plan_Denial.Ref == @P");
//	qry.AddParameter("P",currentPlan);			
//	var rst = qry.Execute();
//	rst.Next();	
//	$.Add("myRow",rst);
//	
//	if ($.myRow.Id == null){
//		CreateComment(currentPlan);
//	}
//	return currentPlan;
//}
//
//function EditComment(commentId, comment) {
//	contactObj = commentId.GetObject();
//	contactObj.DenialReason = comment;
//	contactObj.Save();
//	Workflow.Back();
//}
//
//
//
////СКРИН "ОБЪЕКТ"
//
//function GetContacts(currentObject, getCount){
//	var qry = new Query("SELECT NM.Description AS Name, PS.Description AS Position, OBJ.ContactTel FROM Catalog_Object OBJ JOIN Catalog_ObjectContactName NM ON OBJ.ObjectContactName = NM.Id LEFT JOIN Catalog_ContactPosition PS ON OBJ.ContactPosition = PS.Id WHERE OBJ.Id == @P");
//	qry.AddParameter("P",currentObject);
//	if (getCount == 0) {
//		return qry.Execute(); 
//	} else {
//		return qry.ExecuteCount();
//	} 
//}
//
//function OpenEquipment(currentObject){
//	Workflow.Refresh([currentObject, 1]);
//}
//
//function CloseEquipment(currentObject){
//	Workflow.Refresh([currentObject, 0]);
//}
//
//function GetEquipment(currentObject, getCount){
//	var qry = new Query("SELECT SKU.Description, SER.Code AS SerialNumber FROM Catalog_Object_Equipment EQU LEFT JOIN Catalog_SKU AS SKU ON EQU.SKU = SKU.Id LEFT JOIN Catalog_SerialNumber SER ON SER.Owner = SKU.Id WHERE EQU.Ref == @P");
//	qry.AddParameter("P",currentObject);
//	if (getCount == 0) {
//		return qry.Execute(); 
//	} else {
//		return qry.ExecuteCount();
//	} 
//}
//
////СКРИН "СПИСОК АВР"
//
//function GetAVRs(currentObject,getCount){
//	var qry = new Query("SELECT AVR.Id, AVR.Number, AVR.Date, PROBL.ProblemDescription FROM Document_AVR AVR LEFT JOIN Document_Task_Problem PROBL ON AVR.Task = PROBL.Ref WHERE AVR.Object == @P");
//	qry.AddParameter("P",currentObject);
//	if (getCount == 0) {
//		return qry.Execute(); 
//	} else {
//		return qry.ExecuteCount();
//	} 
//}
//
////СКРИН "АВР"
//
//function GetAVR(aVRId){
//	var qry = new Query("SELECT AVR.Id, AVR.Number, AVR.Date, PROBL.ProblemDescription, TSKCOM.Comment FROM Document_AVR AVR LEFT JOIN Document_Task_Problem PROBL ON AVR.Task = PROBL.Ref LEFT JOIN Document_Task_Comment TSKCOM ON AVR.Task = TSKCOM.Ref WHERE AVR.Id == @P");
//	qry.AddParameter("P", aVRId);
//	return qry.Execute(); 
//}
//
//function GetAVRsSKU(aVRId,getCount){
//	var qry = new Query("SELECT SKU.Description AS DesSKU, AVRSKU.SKUCount, UN.Description AS DesUN FROM Document_AVR_SKU AVRSKU LEFT JOIN Catalog_SKU SKU ON AVRSKU.SKU = SKU.Id LEFT JOIN Catalog_Unit UN ON SKU.Unit = UN.Id WHERE AVRSKU.Ref == @P");
//	qry.AddParameter("P",aVRId);
//	if (getCount == 0) {
//		return qry.Execute(); 
//	} else {
//		return qry.ExecuteCount();
//	}
//}
//
//function GetAVRsJobs(aVRId,getCount){
//	var qry = new Query("SELECT SKU.Description AS DesSKU, AVRSKU.JobsCount, UN.Description AS DesUN FROM Document_AVR_Jobs AVRSKU LEFT JOIN Catalog_SKU SKU ON AVRSKU.SKU = SKU.Id LEFT JOIN Catalog_Unit UN ON SKU.Unit = UN.Id WHERE AVRSKU.Ref == @P");
//	qry.AddParameter("P",aVRId);
//	if (getCount == 0) {
//		return qry.Execute(); 
//	} else {
//		return qry.ExecuteCount();
//	}
//}



//ФУНКЦИЯ ДЛЯ ТЕСТОВ

function Test(p){
	Dialog.Debug(p);
	return p;
}
