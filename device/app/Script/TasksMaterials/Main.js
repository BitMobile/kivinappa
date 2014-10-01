// СПИСОК ЗАЯВОК НА МАТЕРИАЛЫ

function GetExpectedTask(searchText, getCount)
{
	if (getCount == 0) {
		var qry = new Query("SELECT IO.Id, IO.Date, IO.Task, TSKSO.Number AS TSKSONumber, IO.Posted FROM Document_InternalOrder IO LEFT JOIN Document_Task TSKSO ON TSKSO.Id = IO.Task JOIN Document_InternalOrder_StateShipment SS ON IO.Id = SS.Ref UNION SELECT IO.Id, IO.Date, IO.Task, TSKSO.Number AS TSKSONumber , IO.Posted FROM Document_InternalOrder IO  LEFT JOIN Document_Task TSKSO ON TSKSO.Id = IO.Task WHERE IO.Posted = @NotPosted ORDER BY IO.Date");
		qry.AddParameter("NotPosted", "0");
		var c = qry.Execute();
		return c; 
	} else {
		var qry = new Query("SELECT IO.Id FROM Document_InternalOrder IO JOIN Document_InternalOrder_StateShipment SS ON IO.Id = SS.Ref UNION SELECT IO.Id FROM Document_InternalOrder IO WHERE IO.Posted = @NotPosted");
		qry.AddParameter("NotPosted", "0");
		var c = qry.ExecuteCount();	
		return c;
	}
}

function GetShippedTask(searchText, getCount)
{
	if (getCount == 0) {
		var qry = new Query("SELECT IO.Id, IO.Date, IO.Task, TSKSO.Number AS TSKSONumber FROM Document_InternalOrder IO LEFT JOIN Document_Task TSKSO ON TSKSO.Id = IO.Task LEFT JOIN Document_InternalOrder_StateShipment SS ON IO.Id = SS.Ref WHERE SS.Ref Is Null AND IO.Posted = @Posted AND IO.Date > @DateMy ORDER BY IO.Date");
		qry.AddParameter("Posted", "1");
		qry.AddParameter("DateMy", DateTime.Now.AddMonths(-4));
		var c = qry.Execute();
		return c; 
	} else {
		var qry = new Query("SELECT IO.Id FROM Document_InternalOrder IO LEFT JOIN Document_InternalOrder_StateShipment SS ON IO.Id = SS.Ref WHERE SS.Ref IS NULL AND IO.Posted = @Posted AND IO.Date > @DateMy");
		qry.AddParameter("Posted", "1");
		qry.AddParameter("DateMy", DateTime.Now.AddMonths(-4));
		var c = qry.ExecuteCount();	
		return c;		
	}
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

function ForNextWorkflow(GoTaskMaterials, curTaskMat, tasksType) {
	$.Remove("curTaskMat");
	$.AddGlobal("curTaskMat", curTaskMat);
	$.Remove("tasksType");
	$.AddGlobal("tasksType", tasksType);
	
	Workflow.Action("GoTaskMaterials", []);
}

function DeleteGlobalPerem() {
	$.Remove("curTaskMat");	
}






//ЗАЯВКА НА МАТЕРИАЛЫ

function GetCurrentTask(parampampam){
//	var qry = new Query("SELECT IO.Id AS Id, IO.Date AS Date FROM Document_InternalOrder IO LEFT JOIN Document_InternalOrder_StateShipment SS ON IO.Id = SS.Ref WHERE IO.Id = @curTask");
	var qry = new Query("SELECT IO.Id AS Id, IO.Date AS Date, IO.Posted AS Posted, TSKSO.Number AS TaskSONum FROM Document_InternalOrder IO LEFT JOIN Document_Task TSKSO ON TSKSO.Id = IO.Task WHERE IO.Id = @curTask");
	qry.AddParameter("curTask", parampampam);
	var c = qry.Execute();
	return c;	
}

function UpToTheLimits(TskMatId){	
		Dialog.Question(Translate["#refillTheListOfMaterials#"], LocationDialogHandler, TskMatId);
}

function LocationDialogHandler(answ, TskMatId){
	if (answ == DialogResult.Yes) {
	
//		var qry = new Query("SELECT _LIM.Ref, (IfNull(_LIM.Count, 0) - IfNull(_STOC.Count, 0)) AS UpTo " +
//				"FROM Catalog_SKU_Limits _LIM " +
//				"LEFT JOIN Catalog_SKU_Stocks _STOC ON _STOC.Ref = _LIM.Ref " +
//				//"LEFT JOIN Catalog_UnitCat UnitCat ON _LIM.Ref = UnitCat.Ref " +
//				"WHERE (_LIM.Count - _STOC.Count) > 0");
		
		var qry = new Query("SELECT _LIM.Ref, (IfNull(_LIM.Count, 0) - (IFNULL(S.Count, 0) - (IFNULL(GCount, 0) + IFNULL(MATCount, 0)))) AS UpTo " +
				"FROM Catalog_SKU_Limits _LIM " +
				"LEFT JOIN Catalog_SKU_Stocks S ON S.Ref = _LIM.Ref " +
				"LEFT JOIN (SELECT GDS.SKU, SUM(GDS.Count) AS GCount FROM Document_Moving M	" +
				"			INNER JOIN Enum_MovingStatus S ON S.Id = M.Status " +
				"			INNER JOIN Document_Moving_Goods GDS ON GDS.Ref = M.Id " +
				"			WHERE (S.Name = @sName OR S.Name = @ssName) " +
				"			GROUP BY GDS.SKU) M	ON M.SKU = _LIM.Ref " +
				"LEFT JOIN (SELECT MAT.SKU, SUM(MAT.Count) AS MATCount FROM Document_bitmobile_AVR AVR " +
				"			INNER JOIN Document_bitmobile_AVR_Materials MAT ON MAT.Ref = AVR.Id " +
				"			LEFT JOIN Document_AVR AVRT ON AVRT.Task = AVR.Task " +
				"			LEFT JOIN Document_AVR_SKU AVRTM ON AVRTM.Ref = AVRT.Id AND AVRTM.SKU = MAT.SKU	" +
				"			WHERE AVRTM.DocumentsWritten = 0 OR AVRTM.DocumentsWritten IS NULL " +
				"			GROUP BY MAT.SKU) AVR ON AVR.SKU = _LIM.Ref " +
				"WHERE (IfNull(_LIM.Count, 0) - (IFNULL(S.Count, 0) - (IFNULL(GCount, 0) + IFNULL(MATCount, 0)))) > 0");
		
		
		qry.AddParameter("sName", "Новая");
		qry.AddParameter("ssName", "Отправлена");
		
		var upTo = qry.Execute();
		//LEFT JOIN Catalog_Unit UN ON SKU.Unit = UN.Id WHERE SKU.Description LIKE @st ORDER BY SKU.Description
		
		var q = new Query("SELECT Id FROM Enum_StatusComplect " +
				"WHERE Id = @SetsOut");			
		q.AddParameter("SetsOut", "@ref[Enum_StatusComplect]:978ed8cd-0ecb-638a-4426-ecbe79188b92");			
		var SetsOut = q.ExecuteScalar();
		
		while (upTo.Next()){
			var obj = DB.Create("Document.InternalOrder_Goods");
			
			obj.Ref = TskMatId;
			obj.SKU = upTo.Ref;
			obj.SetsOut = SetsOut;
			obj.Count = parseFloat(upTo.UpTo);
//			//obj.UnitCat = UnitCat;
			obj.Save();
		}
		Workflow.Refresh([]);
	}		
}

function GetsKUs(curTskId, getCount){
	if (getCount == 0) {
		var qry = new Query("SELECT GDS.Id AS Id, GDS.Count AS Cnt, SS.Count AS SSCnt, SKU.Id AS SKUId, SKU.Description AS Description, UN.Description AS Un " +
				"FROM Document_InternalOrder_Goods GDS LEFT JOIN Catalog_SKU SKU ON GDS.SKU = SKU.Id LEFT JOIN Document_InternalOrder_StateShipment SS ON GDS.SKU = SS.SKU AND GDS.Ref = SS.Ref LEFT JOIN Catalog_UnitCat UN ON GDS.UnitCat = UN.Id WHERE GDS.Ref = @curTask");
		qry.AddParameter("curTask", curTskId);
		var c = qry.Execute();
		return c; 
	} else {
		var qry = new Query("SELECT GDS.Id AS Id FROM Document_InternalOrder_Goods GDS LEFT JOIN Catalog_SKU SKU ON GDS.SKU = SKU.Id LEFT JOIN Document_InternalOrder_StateShipment SS ON GDS.SKU = SS.SKU AND GDS.Ref = SS.Ref WHERE GDS.Ref = @curTask");
		qry.AddParameter("curTask", curTskId);
		var c = qry.ExecuteCount();	
		return c;		
	}
}


function GetComm(curTskId, getCount){
	if (getCount == 0) {
		var qry = new Query("SELECT Id, Comment FROM Document_InternalOrder_Comment WHERE Ref = @curTask");
		qry.AddParameter("curTask", curTskId);
		var c = qry.Execute();
		return c; 
	} else {
		var qry = new Query("SELECT Id FROM Document_InternalOrder_Comment WHERE Ref = @curTask");
		qry.AddParameter("curTask", curTskId);
		var c = qry.ExecuteCount();	
		return c;		
	}
}

function GetPhoto(curTskId, getCount){
	if (getCount == 0) {
		var qry = new Query("SELECT GDS.Id AS Id, GDS.Count AS Cnt, SKU.Description AS Description, UN.Description AS Un FROM Document_InternalOrder_Goods GDS JOIN Catalog_SKU SKU ON GDS.SKU = SKU.Id JOIN Catalog_Unit UN ON SKU.Unit = UN.Id WHERE GDS.Ref = @curTask");
		qry.AddParameter("curTask", curTskId);
		var c = qry.Execute();
		return c; 
	} else {
		var qry = new Query("SELECT GDS.Id AS Id FROM Document_InternalOrder_Goods GDS JOIN Catalog_SKU SKU ON GDS.SKU = SKU.Id JOIN Catalog_Unit UN ON SKU.Unit = UN.Id WHERE GDS.Ref = @curTask");
		qry.AddParameter("curTask", curTskId);
		var c = qry.ExecuteCount();	
		return c;		
	}
}

function KillSKU(sender, curTskId, goodsId, sKUId, sKUCnt){
	// удаляем строку материалов из Заявки на материалы
	DB.Delete(goodsId);
	
	// удаляем данные из регистра накопления внутренних заказов
	var qry = new Query("SELECT SS.Id FROM Document_InternalOrder_StateShipment SS WHERE SS.Ref = @curTask AND SS.SKU = @sKUId");
	qry.AddParameter("curTask", curTskId);
	qry.AddParameter("sKUId", sKUId);
	var rf = qry.ExecuteScalar();
			
	if (rf != null){
		
		if (sKUCnt != null){
			var obj = rf.GetObject();
			var objCount = obj.Count;
			
			if (objCount == null) {
				//objCount = parseFloat(addCount);
			}else{
				objCount = parseFloat(objCount) - parseFloat(sKUCnt);
			}
			obj.Count = objCount;
			obj.Save();			
		}
	}
		
	Workflow.Refresh([curTskId]);
}

function TasksSnapshot(answerType, question, visit) {
    Camera.MakeSnapshot(SaveAtVisit, question);
}

function SaveAtVisit(question) {
    question.Answer = Variables["guid"];
    //Variables["snapshotInfo"].Text = Translate["#snapshotAttached#"];
    Workflow.Refresh([]);
}

function GetSKUShapshot(curTsk){
	GetCameraObject(curTsk.Id);
	Camera.MakeSnapshot(SaveAtAVR, [curTsk]);
	
}

function GetCameraObject(curTskId) {
	FileSystem.CreateDirectory("/private/Document.InternalOrder");
	var guid = GenerateGuid();
	Variables.Add("guid", guid);
	var path = String.Format("/private/Document.InternalOrder/{0}/{1}.jpg", curTskId, guid);
	Camera.Size = 800;
	Camera.Path = path;
}

function GenerateGuid() {
	return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}

function SaveAtAVR(arr) {
	var curTsk = arr[0];
	tskObj = DB.Create("Document.InternalOrder_Photo");
	//Dialog.Debug(aVRId);
	tskObj.Ref = curTsk;
	var guid = Variables["guid"];
	//Dialog.Debug(guid);
	tskObj.Guid = guid;
	tskObj.Path = String.Format("/private/Document.InternalOrder/{0}/{1}.jpg", curTsk.Id, guid);
	tskObj.Date = DateTime.Now; 
	tskObj.Save(false);
	//control.Text = Translate["#snapshotAttached#"];
	Workflow.Refresh([]);
}

function GetTskPhoto(currentObject, getCount){
	
	if (getCount == 0) {	
		var qry = new Query("SELECT Id, Info, Date, Path FROM Document_InternalOrder_Photo WHERE Ref = @currentObject");		
		qry.AddParameter("currentObject", currentObject);
		var c = qry.Execute();
		return c; 
	} else {
		var qry = new Query("SELECT Id FROM Document_InternalOrder_Photo WHERE Ref = @currentObject");
		qry.AddParameter("currentObject", currentObject);
		var c = qry.ExecuteCount();	
		
		return c;		
	}
}

function KillPhoto(photoId){
	
	DB.Delete(photoId);
			
	Workflow.Refresh([]);
}





//ЛИСТ МАТЕРИАЛОВ

function GetsKUsAll(curTskId, searchText){
	if (searchText != "" && searchText != null) {
					
		var qry = new Query("SELECT SKU.Id, SKU.Description, (IFNULL(STOK.Count, 0) - IFNULL(GCount, 0) - IFNULL(MATCount, 0)) AS MyCount, UN.Description AS Unit, UN.Id AS UnId " +
				"FROM Catalog_SKU SKU " +
				"LEFT JOIN Catalog_SKU_Stocks STOK ON SKU.Id = STOK.Ref " +
				"LEFT JOIN Catalog_Unit UN ON SKU.Unit = UN.Id " +
				
				"LEFT JOIN (SELECT GDS.SKU, SUM(GDS.Count) AS GCount FROM Document_Moving M	" +
				"			INNER JOIN Enum_MovingStatus S ON S.Id = M.Status " +
				"			INNER JOIN Document_Moving_Goods GDS ON GDS.Ref = M.Id " +
				"			WHERE (S.Name = @sName OR S.Name = @ssName) " +
				"			GROUP BY GDS.SKU) M	ON M.SKU = STOK.Ref " +
				
				"LEFT JOIN (SELECT MAT.SKU, SUM(MAT.Count) AS MATCount FROM Document_bitmobile_AVR AVR " +
				"			INNER JOIN Document_bitmobile_AVR_Materials MAT ON MAT.Ref = AVR.Id " +
				"			LEFT JOIN Document_AVR AVRT ON AVRT.Task = AVR.Task " +
				"			LEFT JOIN Document_AVR_SKU AVRTM ON AVRTM.Ref = AVRT.Id AND AVRTM.SKU = MAT.SKU	" +
				"			WHERE AVRTM.DocumentsWritten = 0 OR AVRTM.DocumentsWritten IS NULL " +
				"			GROUP BY MAT.SKU) AVR ON AVR.SKU = STOK.Ref " +
				
				"WHERE SKU.Service = @service AND Contains(SKU.Description, @st) ORDER BY SKU.Description");
		qry.AddParameter("curTask", curTskId);
		qry.AddParameter("st", searchText);
		qry.AddParameter("service", "0");
		qry.AddParameter("sName", "Новая");
		qry.AddParameter("ssName", "Отправлена");
		var c = qry.Execute().Unload();		
		return c; 
	
	}else{
		
		var qry = new Query("SELECT SKU.Id, SKU.Description, (IFNULL(STOK.Count, 0) - IFNULL(GCount, 0) - IFNULL(MATCount, 0)) AS MyCount, UN.Description AS Unit, UN.Id AS UnId " +
				"FROM Catalog_SKU SKU " +
				"LEFT JOIN Catalog_SKU_Stocks STOK ON SKU.Id = STOK.Ref " +
				"LEFT JOIN Catalog_Unit UN ON SKU.Unit = UN.Id " +
				
				"LEFT JOIN (SELECT GDS.SKU, SUM(GDS.Count) AS GCount FROM Document_Moving M	" +
				"			INNER JOIN Enum_MovingStatus S ON S.Id = M.Status " +
				"			INNER JOIN Document_Moving_Goods GDS ON GDS.Ref = M.Id " +
				"			WHERE (S.Name = @sName OR S.Name = @ssName) " +
				"			GROUP BY GDS.SKU) M	ON M.SKU = STOK.Ref " +
				
				"LEFT JOIN (SELECT MAT.SKU, SUM(MAT.Count) AS MATCount FROM Document_bitmobile_AVR AVR " +
				"			INNER JOIN Document_bitmobile_AVR_Materials MAT ON MAT.Ref = AVR.Id " +
				"			LEFT JOIN Document_AVR AVRT ON AVRT.Task = AVR.Task " +
				"			LEFT JOIN Document_AVR_SKU AVRTM ON AVRTM.Ref = AVRT.Id AND AVRTM.SKU = MAT.SKU	" +
				"			WHERE AVRTM.DocumentsWritten = 0 OR AVRTM.DocumentsWritten IS NULL " +
				"			GROUP BY MAT.SKU) AVR ON AVR.SKU = STOK.Ref " +
				"WHERE SKU.Service = @service ");
		qry.AddParameter("curTask", curTskId);
		qry.AddParameter("service", "0");
		qry.AddParameter("sName", "Новая");
		qry.AddParameter("ssName", "Отправлена");
		var c = qry.Execute().Unload();
		//$.Add("sKUCount", c.Count());
		return c;		
	}
}

function GetCntSKU(sKUs){
	return sKUs.Count();
}


function checkSKUCount(sKUCount){
	if(sKUCount<0){
		sKUCount = 0;
	}
	return sKUCount;
}

function AddSKU(sender,sKUId,Unit,addCountText,curTskId, edtSearch) {
	
	//записываем данные в таблицу материалов заявки материалов
	var qry = new Query("SELECT GDS.Id FROM Document_InternalOrder_Goods GDS WHERE GDS.Ref = @curTask AND GDS.SKU = @sKUId");
	qry.AddParameter("curTask", curTskId);
	qry.AddParameter("sKUId", sKUId);
	var rf = qry.ExecuteScalar();
			
	var SecQry = new Query("SELECT UNC.Id FROM Catalog_Unit _UN " +
			"INNER JOIN Catalog_UnitCat UNC ON UNC.Description = _UN.Description WHERE _UN.Id = @Unit LIMIT 1");
	SecQry.AddParameter("Unit", Unit);
	var UnitCat = SecQry.ExecuteScalar();
				
	var addCount = sender.Parent.GetControl(0).GetControl(0).Text;
		
	if (rf != null){
		
		if (addCount != null && addCount != "" && addCount != 0){
			
			var obj = rf.GetObject();
			var objCount = obj.Count;
			
			if (objCount == null) {
				objCount = parseFloat(addCount);
			}else{
				objCount = objCount + parseFloat(addCount);
			}
			obj.Count = objCount;
			obj.Save();			
		}
	}else{
		
		if (addCount != null && addCount != "" && addCount != 0){
			
			var obj = DB.Create("Document.InternalOrder_Goods");
			obj.Ref = curTskId;
			obj.SKU = sKUId;
			
			var q = new Query("SELECT Id FROM Enum_StatusComplect " +
					"WHERE Id = @SetsOut");			
			q.AddParameter("SetsOut", "@ref[Enum_StatusComplect]:978ed8cd-0ecb-638a-4426-ecbe79188b92");			
			var SetsOut = q.ExecuteScalar();
						
			obj.SetsOut = SetsOut;
			
			obj.Count = parseFloat(addCount);
			if (UnitCat != null){
				obj.UnitCat = UnitCat;
			}
			obj.Save();
		}
	}
	
	// записываем данные в регистр накопления внутренних заказов
	var qry = new Query("SELECT SS.Id FROM Document_InternalOrder_StateShipment SS WHERE SS.Ref = @curTask AND SS.SKU = @sKUId");
	qry.AddParameter("curTask", curTskId);
	qry.AddParameter("sKUId", sKUId);
	var rf = qry.ExecuteScalar();
	
	if (rf != null){
		
		if (addCount != null){
			var obj = rf.GetObject();
			var objCount = obj.Count;
			
			if (objCount == null) {
				objCount = parseFloat(addCount);
			}else{
				objCount = objCount + parseFloat(addCount);
			}
			obj.Count = objCount;
			obj.Save();			
		}
	}else{
		if (addCount != null){
			var obj = DB.Create("Document.InternalOrder_StateShipment");
			obj.Ref = curTskId;
			obj.SKU = sKUId;
			obj.Count = parseFloat(addCount);
			
			obj.Save();
		}
	}
	
	Workflow.Refresh([edtSearch, curTskId]);
}

function SetDatePlanNow(key, arr) {
	var vizitId = arr[0];
	var datePlan = arr[1];
	Variables[datePlan].Text = String.Format("{0:dd/MM/yy}", key);
	//$.datePlan.Text = key;
//	Dialog.Debug(vizitId);
	var obj = vizitId.GetObject();
	obj.DatePlan = key;
	obj.Save();
}






//КОММЕНТАРИЙ МАТЕРИАЛОВ

function GetComment(curTskId){
	var qry = new Query("SELECT CM.Id, CM.Comment FROM Document_InternalOrder_Comment CM WHERE Ref = @curTask");
	qry.AddParameter("curTask", curTskId);
	var c = qry.Execute();
	return c; 
}

function GreateComment(comment, ref) {

	var doc = DB.Create("Document.InternalOrder_Comment");
	doc.Ref = ref;
	doc.Comment = comment;
		
	doc.Save();

	Workflow.Back();

}

function EditComment(comment, commentId) {
	var doc = commentId.GetObject();
	doc.Comment = comment;
		
	doc.Save();

	Workflow.Back();

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



//ОБЩАЯ ФУНЦИЯ ФОРМАТ ДАТЫ

function GetDate_ddMMyy(Period)
{
	var s = String.Format("{0:dd/MM/yy}", DateTime.Parse(Period));
	return s;
}

//ОБЩАЯ ФУНЦИЯ РАЗНОСТИ

function Minus(First,Second){
	var m = First - Second;
	return m;
}


//ОБЩАЯ ФУНЦИЯ ДЛЯ ТЕСТОВ

function Test(p){
	Dialog.Debug(p);
	return p;
}
