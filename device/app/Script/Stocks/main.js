function GetStocksCount()
{
	var qry = new Query("SELECT ID FROM Catalog_SKU_Stocks");
	var Cnt = qry.ExecuteCount();
//	Dialog.Debug(Cnt);
	return Cnt;
}

function GetStocks()
{
	var qry = new Query("SELECT STO.Id, STO.Ref, _UN.Description, (IFNULL(STO.Count, 0) - IFNULL(GCount, 0) - IFNULL(MATCount, 0))	AS MyCount, IFNULL(STO.Count, 0) AS Stock, (IfNull(_LIM.Count, 0)) AS Lim " +
			"FROM Catalog_SKU_Stocks STO " +
			"LEFT JOIN Catalog_SKU SKU ON SKU.Id = STO.Ref " +
			"LEFT JOIN Catalog_Unit _UN ON SKU.Unit = _UN.Id " +
			"LEFT JOIN Catalog_SKU_Limits _LIM ON _LIM.Ref = SKU.Id " +
			"LEFT JOIN (SELECT GDS.SKU, SUM(GDS.Count) AS GCount FROM Document_Moving M	" +
			"			INNER JOIN Enum_MovingStatus S ON S.Id = M.Status " +
			"			INNER JOIN Document_Moving_Goods GDS ON GDS.Ref = M.Id " +
			"			WHERE (S.Name = @sName OR S.Name = @ssName) " +
			"			GROUP BY GDS.SKU) M	ON M.SKU = STO.Ref " +
			"LEFT JOIN (SELECT MAT.SKU, SUM(MAT.Count) AS MATCount FROM Document_bitmobile_AVR AVR " +
			"			INNER JOIN Document_bitmobile_AVR_Materials MAT ON MAT.Ref = AVR.Id " +
			"			LEFT JOIN Document_AVR AVRT ON AVRT.Task = AVR.Task " +
			"			LEFT JOIN Document_AVR_SKU AVRTM ON AVRTM.Ref = AVRT.Id AND AVRTM.SKU = MAT.SKU	" +
			"			WHERE AVRTM.DocumentsWritten = 0 OR AVRTM.DocumentsWritten IS NULL " +
			"			GROUP BY MAT.SKU) AVR ON AVR.SKU = STO.Ref " +
			"WHERE ((IFNULL(STO.Count, 0) - IFNULL(GCount, 0) - IFNULL(MATCount, 0)) > 0 OR (IFNULL(STO.Count, 0) > 0 OR IfNull(_LIM.Count, 0) > 0)) AND SKU.Service = @service " +
			"ORDER BY SKU.Description");			
			
//			"SELECT STO.ID, STO.Ref, UN.Description, STO.Count, (IfNull(_LIM.Count, 0)) AS Lim " +
//			"FROM Catalog_SKU_Stocks STO " +
//			"JOIN Catalog_SKU SKU ON STO.Ref = SKU.Id " +
//			"LEFT JOIN Catalog_Unit UN ON SKU.Unit = UN.Id " +
//			"LEFT JOIN Catalog_SKU_Limits _LIM ON _LIM.Ref = SKU.Id " +
//			"ORDER BY SKU.Description");
	
	qry.AddParameter("sName", "Новая");
	qry.AddParameter("ssName", "Отправлена");
	qry.AddParameter("service", "0");
	
	return qry.Execute();
}

function GetStocksSumString(stock)
{
	return "tasksumstring";
}

function CheckProcessingStatusAndForward(stock, flag)
{
}

function GetTime(value)
{
	return "time";
}

function AssignNumberIfNotExist(stock)
{
	return "number";
}


// ПЕРЕХОД НА ДРУГОЙ ВОРКФЛОУ
function ForNextWorkflowNew() {
	var UserId = $.common.UserId;
			
	var TaskMatObj = DB.Create("Document.InternalOrder");
	//TaskMatObj.Task = curTask;
	
	var orderType = "НаСклад";
	
	var q = new Query("SELECT _US.Id AS UsId, _US.Department AS Department, OrdType.Id AS OrderType, S.Ref AS Sklad " +
			"FROM Catalog_User _US	" +
			"LEFT JOIN Enum_OrderType OrdType ON OrdType.Name = @orderType " +
			"LEFT JOIN Catalog_Sklad_Department S ON S.Depart = _US.Department " +
			"WHERE _US.Id = @UserId");
	
	q.AddParameter("orderType", orderType);
	q.AddParameter("UserId", "@ref[Catalog_User]:" + UserId);
		
	var st = q.Execute();
	if (st.Next()) {
						
		TaskMatObj.Posted = 0;
		TaskMatObj.OrderType = st.OrderType;
		TaskMatObj.Date = DateTime.Now;
		//TaskMatObj.Org = st.Org;
		TaskMatObj.Department = st.Department;
		//TaskMatObj.Task = curTask;
		TaskMatObj.Sklad = st.Sklad;
		
		TaskMatObj.Save();
		
		var curTaskMatLoc = TaskMatObj.Id
		
		$.Remove("curTaskMat");
		$.AddGlobal("curTaskMat", curTaskMatLoc);
		$.Remove("tasksType");
		$.AddGlobal("tasksType", "ExpectedTask");
				
		Workflow.Action("GoTaskMaterials", []);
	}
	
}