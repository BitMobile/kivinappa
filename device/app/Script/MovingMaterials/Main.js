var movingPeremModul
//СКРИН СПИСКА ПЕРЕМЕЩЕНИЙ

function SetListType() {
	if($.Exists("visitsType") == false){
	  $.AddGlobal("visitsType", "in");
	}else{
	  return $.visitsType;
	}
}

function ChangeListAndRefresh(control) {
	$.Remove("visitsType");
	$.AddGlobal("visitsType", control);
	Workflow.Refresh([]);
}

function GetCount(par1, par2){
	var summaPar = parseFloat(par1) + parseFloat(par2);
	return summaPar;
}

function GetInMoving(getCount){
	
	var userId = $.common.UserId;
		
	var stst = "Отправлена";
			
	if (getCount == 0) {
		var qry = new Query("SELECT _MOV.Id, _MOV.Date, _MOV.MoveFrom AS Depart, _STAT.Description AS Stat " +
				"FROM Document_Moving _MOV " +
				"INNER JOIN Catalog_Sklad_Department _DEP ON _DEP.Ref = _MOV.MoveTo " +
				"INNER JOIN Catalog_Department DEP ON DEP.Id = _DEP.Depart " +
				"INNER JOIN Catalog_User _US ON _US.Department = DEP.Id " +
				"LEFT JOIN Enum_MovingStatus _STAT ON _MOV.Status = _STAT.Id " +
				"WHERE _US.Id = @userId AND _STAT.Name = @stst ORDER BY _MOV.Date DESC");
		qry.AddParameter("userId", "@ref[Catalog_User]:" + userId);
		qry.AddParameter("stst", stst);
		var c = qry.Execute();
		return c; 
	} else {
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
}

function GetInMovingDone(getCount){
	
	var userId = $.common.UserId;
	var stst = "Принята";
	var dfdf = "Отменена";
		
	if (getCount == 0) {
		var qry = new Query("SELECT _MOV.Id, _MOV.Date, _MOV.MoveFrom AS Depart, _STAT.Description AS Stat " +
				"FROM Document_Moving _MOV " +
				"INNER JOIN Catalog_Sklad_Department _DEP ON _DEP.Ref = _MOV.MoveTo " +
				"INNER JOIN Catalog_Department DEP ON DEP.Id = _DEP.Depart " +
				"INNER JOIN Catalog_User _US ON _US.Department = DEP.Id " +
				"LEFT JOIN Enum_MovingStatus _STAT ON _MOV.Status = _STAT.Id " +
				"WHERE _US.Id = @userId AND (_STAT.Name = @stst OR _STAT.Name = @dfdf) ORDER BY _MOV.Date DESC");
		qry.AddParameter("userId", "@ref[Catalog_User]:" + userId);
		qry.AddParameter("stst", stst);
		qry.AddParameter("dfdf", dfdf);
		var c = qry.Execute();
		return c; 
	} else {
		var qry = new Query("SELECT _MOV.Id " +
				"FROM Document_Moving _MOV " +
				"INNER JOIN Catalog_Sklad_Department _DEP ON _DEP.Ref = _MOV.MoveTo " +
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
}

function GetOutMoving(getCount){
	
	var userId = $.common.UserId;
	var stst = "Новая";
	var dfdf = "Отправлена";
	
	if (getCount == 0) {
		var qry = new Query("SELECT _MOV.Id, _MOV.Date, _MOV.MoveTo AS Depart, _STAT.Description AS Stat " +
				"FROM Document_Moving _MOV " +
				"INNER JOIN Catalog_Sklad_Department _DEP ON _DEP.Ref = _MOV.MoveFrom " +
				"INNER JOIN Catalog_Department DEP ON DEP.Id = _DEP.Depart " +
				"INNER JOIN Catalog_User _US ON _US.Department = DEP.Id " +
				"LEFT JOIN Enum_MovingStatus _STAT ON _MOV.Status = _STAT.Id " +
				"WHERE _US.Id = @userId AND (_STAT.Name = @stst OR _STAT.Name = @dfdf) ORDER BY _MOV.Date DESC");
		qry.AddParameter("userId", "@ref[Catalog_User]:" + userId);
		qry.AddParameter("stst", stst);
		qry.AddParameter("dfdf", dfdf);
		var c = qry.Execute();
		return c; 
	} else {
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
}

function GetOutMovingDone(getCount){
	
	var userId = $.common.UserId;
	var stst = "Принята";
	var dfdf = "Отменена";
	
	if (getCount == 0) {
		var qry = new Query("SELECT _MOV.Id, _MOV.Date, _MOV.MoveTo AS Depart, _STAT.Description AS Stat " +
				"FROM Document_Moving _MOV " +
				"INNER JOIN Catalog_Sklad_Department _DEP ON _DEP.Ref = _MOV.MoveFrom " +
				"INNER JOIN Catalog_Department DEP ON DEP.Id = _DEP.Depart " +
				"INNER JOIN Catalog_User _US ON _US.Department = DEP.Id " +
				"LEFT JOIN Enum_MovingStatus _STAT ON _MOV.Status = _STAT.Id " +
				"WHERE _US.Id = @userId AND (_STAT.Name = @stst OR _STAT.Name = @dfdf) ORDER BY _MOV.Date DESC");
		qry.AddParameter("userId", "@ref[Catalog_User]:" + userId);
		qry.AddParameter("stst", stst);
		qry.AddParameter("dfdf", dfdf);
		var c = qry.Execute();
		return c; 
	} else {
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
}

function MyDoAction(OpenMovement, param1, param2){
	movingPeremModul = param1;
	Workflow.Action(OpenMovement, [param1, param2]);
}

function MovingPeremModulGet(){
	return movingPeremModul;
}


// СКРИН ДОКУМЕНТА ПЕРЕМЕЩЕНИЯ

function GetMoving(curMoving){
	//Dialog.Debug(curMoving);
	if (curMoving == null){
		
		var stst = "Новая";
		var userId = $.common.UserId;
		var query = new Query();
	    query.Text = "SELECT SKLAD.Ref AS Sklad, _US.Department, _ST.Id AS Stat FROM Catalog_User _US " +
	    		"LEFT JOIN Enum_MovingStatus _ST ON _ST.Name = @stst " +
	    		"LEFT JOIN Catalog_Department DEP ON DEP.Id = _US.Department " +
	    		"LEFT JOIN Catalog_Sklad_Department SKLAD ON SKLAD.Depart = DEP.Id " +
	    		"WHERE _US.Id = @userId";
	    
	    query.AddParameter("stst", stst);
	    query.AddParameter("userId", "@ref[Catalog_User]:" + userId);
	    
	    var q = query.Execute();
	    
	    var doc = DB.Create("Document.Moving");
	    doc.Date = DateTime.Now;
	    if (q.Next()) {
	    	doc.MoveFrom = q.Sklad;
			doc.Status = q.Stat;			
	    }
	    doc.Save();
	    
	  //очистим глоб переменные для повторного исполнения запросов на основном экране
	    $.Remove("peremOutMovingMain");
		$.AddGlobal("peremOutMovingMain", null);
	    
	    curMoving = doc.Id;	   
	    
	    //Dialog.Debug(curMoving);
	}
	
	movingPeremModul = curMoving;
	
	var qry = new Query("SELECT _MOV.Id, _MOV.Date, _DEP.Description AS Sklad, _ST.Description AS Status " +
			"FROM Document_Moving _MOV " +
			"LEFT JOIN Catalog_Sklad _DEP ON _DEP.Id = _MOV.MoveTo " +
			"LEFT JOIN Enum_MovingStatus _ST ON _ST.Id = _MOV.Status " +
			"WHERE _MOV.Id = @curMoving");
	qry.AddParameter("curMoving", curMoving);
	var c = qry.Execute();
	c.Next()
	return c; 
	
}

function GetsKUs(curTskId, getCount){
	if (getCount == 0) {
		var qry = new Query("SELECT GDS.Id AS Id, GDS.Count AS Cnt, SKU.Id AS SKUId, SKU.Description AS Description, _UN.Description AS Un " +
				"FROM Document_Moving_Goods GDS " +
				"LEFT JOIN Catalog_SKU SKU ON GDS.SKU = SKU.Id " +
				"LEFT JOIN Catalog_Unit _UN ON SKU.Unit = _UN.Id " +
				"WHERE GDS.Ref = @curTask");
		qry.AddParameter("curTask", curTskId);
		var c = qry.Execute();
		return c; 
	} else {
		var qry = new Query("SELECT GDS.Id AS Id " +
				"FROM Document_Moving_Goods GDS " +
				"LEFT JOIN Catalog_SKU SKU ON GDS.SKU = SKU.Id " +
				"WHERE GDS.Ref = @curTask");
		qry.AddParameter("curTask", curTskId);
		var c = qry.ExecuteCount();	
		return c;		
	}
}

function KillSKU(sender, curTskId, goodsId, sKUId, sKUCnt){
	// удаляем строку материалов из Заявки на материалы
	DB.Delete(goodsId);			
	Workflow.Refresh([curTskId, 1]);
}

function StatusDoSelect(entity) {
	var userId = $.common.UserId;
	var query = new Query();
    query.Text = "SELECT distinct SKLAD.Id, SKLAD.Description " +
    		"FROM Catalog_Department _DEP " +
    		"INNER JOIN Catalog_Sklad_Department SKLADDep ON SKLADDep.Depart = _DEP.Id " +
    		"INNER JOIN Catalog_Sklad SKLAD ON SKLAD.Id = SKLADDep.Ref " +
    		"INNER JOIN Catalog_User _US ON _US.Department = _DEP.Id " +
    		"WHERE _DEP.Id not in (SELECT Department FROM Catalog_User WHERE Id = @userId)";
    
    query.AddParameter("userId", "@ref[Catalog_User]:" + userId);
    
    Dialog.Select("#select_answer#", query.Execute(), StatusDoSelectCallback1, [entity]);
            
    return;
}

function StatusDoSelectCallback1(key, args) {
	var entity = args[0];
		
    var obj = entity.GetObject();
    obj.MoveTo = key;
//        	
	
//	           
//    
    obj.Save();
    //control.Text = key.Description;
    
    Workflow.Refresh([entity,1]);
    
    return;
}

function DelMovingAndDoBack(curMoving){
	
	var qry = new Query("SELECT Id FROM Document_Moving_Goods WHERE Ref = @curMoving");
	qry.AddParameter("curMoving", curMoving);
	var c = qry.Execute();
	
	while (c.Next()){ 
		DB.Delete(c.Id);
	}
	
	DB.Delete(curMoving);	
	Workflow.Back();
}

function QuestAcceptRefuseMoving(curMovingId, acRef){
	
	if (acRef == 1) {
		var textQuest = "Принять перемещение?";
	}else{
		var textQuest = "Отменить перемещение?";
	}
	Dialog.Question(Translate[textQuest], AcceptRefuseMoving, [curMovingId, acRef]);
}


function AcceptRefuseMoving(answ, mass){
	var curMovingId = mass[0];
	var acRef = mass[1];
		
	if (answ == DialogResult.Yes) {
		if (acRef == 1) {
			var qry = new Query("SELECT Id FROM Enum_MovingStatus WHERE Name = @nStat");
			qry.AddParameter("nStat", "Принята");
			
			var c = qry.Execute();
		}else{
			var qry = new Query("SELECT Id FROM Enum_MovingStatus WHERE Name = @nStat");
			qry.AddParameter("nStat", "Отменено");
			
			var c = qry.Execute();
		}
		
		if (c.Next()) { 
			var obj = curMovingId.GetObject();
			obj.Status = c.Id; 
			obj.Save(false);
			
			//очистим глоб переменные для повторного исполнения запросов на основном экране
		    $.Remove("peremInMovingMain");
			$.AddGlobal("peremInMovingMain", null);			
		}		
	}
	Workflow.Refresh([curMovingId,0]);
}





// 	СКРИН СПИСКА МАТЕРИАЛОВ

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
		qry.AddParameter("sName", "Новая");
		qry.AddParameter("ssName", "Отправлена");
		qry.AddParameter("curTask", curTskId);
		qry.AddParameter("service", "0");
		qry.AddParameter("st", searchText);
		var c = qry.Execute().Unload();;		
		return c; 
		
	}else{
		
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
				"WHERE (IFNULL(S.Count, 0) - IFNULL(GCount, 0) - IFNULL(MATCount, 0)) > 0 AND SKU.Service = @service " +
				"ORDER BY SKU.Description");
		qry.AddParameter("sName", "Новая");
		qry.AddParameter("ssName", "Отправлена");
		//qry.AddParameter("curTask", curTskId);
		qry.AddParameter("service", "0");
		var c = qry.Execute().Unload();;		
		return c; 
		
	}
}

function GetCntSKU(sKUs){
	return sKUs.Count();
}

function AddSKU(sender, sKUId, sKUUnId, addCountText, curMovId, edtSearch) {

	var addCount = sender.Parent.GetControl(0).GetControl(0).Text;
	
	//контроль остатков 
	var qry = new Query("SELECT (IFNULL(S.Count, 0) - IFNULL(GCount, 0) - IFNULL(MATCount, 0))	AS MyCount " +
					"FROM Catalog_SKU_Stocks S " +
					"INNER JOIN Catalog_SKU SKU ON SKU.Id = S.Ref AND SKU.Id = @sKUId " +
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
					"WHERE (IFNULL(S.Count, 0) - IFNULL(GCount, 0) - IFNULL(MATCount, 0)) > 0");
	qry.AddParameter("sKUId", sKUId);
	qry.AddParameter("sName", "Новая");
	qry.AddParameter("ssName", "Отправлена");
	var stokCnt = qry.Execute();
	
	if (stokCnt.Next()) {
		var cnt = stokCnt.MyCount;
		var stokId = stokCnt.Id;
			
		if (addCount != null && addCount != "" && parseFloat(addCount) != parseFloat(0)){
			if (cnt >= addCount){
				//записываем данные в таблицу материалов MOVING
				
				var qry = new Query("SELECT Id, Count FROM Document_Moving_Goods WHERE Ref = @curMovId AND SKU = @sKUId");
				qry.AddParameter("sKUId", sKUId);
				qry.AddParameter("curMovId", curMovId);
				//Dialog.Debug(curMovId);
				var stokRow = qry.Execute();
																
				if (stokRow.Next()) {
					var stokRowId = stokRow.Id;
					var obj = stokRowId.GetObject();
					var stokRowCount = parseFloat(stokRow.Count);
					obj.Count = stokRowCount + parseFloat(addCount); 
					obj.Save();
					
				}else{
					if (addCount != null){
						
						var tqry = new Query("SELECT Id, Count FROM Document_Moving_Goods WHERE Ref = @curMovId");
						tqry.AddParameter("curMovId", curMovId);
						//Dialog.Debug(curMovId);
						var stokRowCount = tqry.ExecuteCount();
						
						var obj = DB.Create("Document.Moving_Goods");
						obj.LineNumber = stokRowCount + 1;
						obj.Ref = curMovId;
						obj.SKU = sKUId;
						obj.Count = parseFloat(addCount);
						
						obj.Save();
					}
				}
								
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
	
	Workflow.Refresh([edtSearch, curMovId]);
}






//ОБЩИЕ		

function GetDate_ddMMyy(Period)
{
	var s = String.Format("{0:dd/MM/yyyy}", DateTime.Parse(Period));
	return s;
}


function Minus(First,Second){
	var m = First - Second;
	return m;
}



function Test(p){
	Dialog.Debug(p);
	return p;
}
