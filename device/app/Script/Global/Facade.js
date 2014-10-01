
//---------------Common functions-----------

function ToFloat(text) {
    if (String.IsNullOrEmpty(text))
        return parseFloat(0, 10);
    return parseFloat(text, 10);
}

function AddGlobalAndAction(name, value, actionName) {
    Variables.AddGlobal(name, value);
    Workflow.Action(actionName, []);
}

function GetSKU(val) {
    return DB.Current.Catalog.SKU.SelectBy("Id", val).First();
}

function ToInteger(text) {
    return parseInt(text);
}

function GetSum(val1, val2) {
    return Converter.ToDecimal(val1) + Converter.ToDecimal(val2);
}

function GetSumInt(val1, val2) {
    return parseInt(val1) + parseInt(val2);
}

function GetDifference(val1, val2) {
    return val1 - val2;
}

function GetGreater(val1, val2) {
    var r = val1 - val2;
    if (r > 0) {
        return false;
    }
    else
        return true;
}

function CountCollection(collection) {
    return parseInt(collection.Count());
}

function AreEqual(val1, val2) {
    if (val1.ToString() == val2.ToString())
        return true;
    else
        return false;
}

function NotEqualInt(val1, val2) {
    if (parseInt(val1) == parseInt(val2))
        return false;
    else
        return true;
}

function GetMultiple(val1, val2) {
    return (val1 * val2)
}

function AssignValue(entity, attribute, value, type) { //delete it
    if (type == "int") {
        if (value == "")
            entity[attribute] = parseInt(0);
        else
            entity[attribute] = parseFloat(value);
    }
    else
        entity[attribute] = value;
    return entity;
}

function FormatValue(value) {
    return String.Format("{0:F2}", value);
}

function ConvertToBoolean(val) {
    if (val == "true" || val == true)
        return true;
    else
        return false;
}

function ConvertToBoolean1(val1) {
    if (val1 > 0)
        return true;
    else
        return false;
}

function IsNullOrEmpty(val1) {
    return String.IsNullOrEmpty(val1);
}

function GetLookupList(entity, attribute) {
    var objectType = entity.Metadata[attribute].Type;
    var objectName = entity.Metadata[attribute].Name;
    var query = new Query();
    query.Text = String.Format("select * from {0}.{1}", objectType, objectName);
    return query.Execute();
}

function UpdateEntity(entity, value) {

    if (getType(entity) == "DefaultScope.Catalog.Outlet") {
        entity.ConfirmationStatus = DB.Current.Constant.OutletConfirmationStatus.New;
    }

    return entity;
}

function UpdateValueAndBack(entity, attribute, value) {
    if (attribute != "Answer" && attribute != "Value") {  //for Visit_Questions
        entity[attribute] = value;
        entity = UpdateEntity(entity, value); //set status 'New' for Outelt
        if (attribute == "PriceList") {
            var n = CountEntities("Document", "Order_SKUs", Variables["workflow"]["order"].Id, "Ref");
            if (parseInt(n) != parseInt(0))
                Dialog.Message("#SKUWillRevised#");
        }
    }
    else {
        entity[attribute] = value.Value;
    }

    Workflow.Back();

}

function CheckIfEmptyAndBack(entity, attribute, objectType, objectName) {

    if (entity.IsNew) {
        if (entity[attribute] == "" || String(entity[attribute]) == "0")//String(entity[attribute]) == "0")
            DB.Current[objectType][objectName].Delete(entity);
        var r = entity.RefAsObject;
        if (getType(r) == "DefaultScope.Catalog.Outlet") {
            UpdateOtletStatus();
        }

        Workflow.Back();
    }
    else {
        if (entity[attribute] == "" || String(entity[attribute]) == "0")//String(entity[attribute]) == "0")
            Dialog.Message("#empty_field#")
        else
            Workflow.Back();
    }

}

function CheckIfEmpty(entity, attribute, objectType, objectName, deleteIfEmpty) {

    if (entity[attribute].Trim() == "" || String(entity[attribute]) == "0") {
        if (entity.IsNew && ConvertToBoolean(deleteIfEmpty)) {
            DB.Current[objectType][objectName].Delete(entity);
            return true;
        }
        else
            return false;
    }
    else
        return true;
}

function CheckIfEmptyAndForward(entity, attribute, objectType, objectName, deleteIfEmpty) {

    var doaction = CheckIfEmpty(entity, attribute, objectType, objectName, deleteIfEmpty);
    if (doaction) {
        var parameters = [];
        Workflow.Forward(parameters);
    }
}

function DeleteAndBack(entity, objectType, objectName, varToDelete) {

    if (entity.IsNew)
        DB.Current[objectType][objectName].Delete(entity);
    if (varToDelete != null)
        Variables["workflow"][varToDelete] = null;

    Workflow.Back();
}


function SetDateTime(entity, attribute) {
    var NewDateTime = DateTime.Parse(entity[attribute]);
    var Header = Translate["#enterDateTime#"];
    Dialog.ShowDateTime(Header, NewDateTime, DateTimeDialog, entity);
}

function DateTimeDialog(entity, dateTime) {
    entity.DeliveryDate = dateTime;
    Variables["deliveryDate"].Text = dateTime; //refactoring is needed
}

function GenerateGuid() {

    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}

function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

function GetSharedImagePath(objectType, objectID, pictID, pictExt) {

    return "/shared/" + objectType + "/" + objectID.ToString() + "/" + pictID.ToString() + pictExt;

}


//--------------------Common Querys------------------

function GetEntity(type, name, paramValue, parameter) {
    var query = new Query();
    query.AddParameter("v", paramValue);
    query.Text = String.Format("select single(*) from {0}.{1} where {2}==@v", type, name, parameter);
    return query.Execute();
}


function GetEntities(type, name, paramValue, parameter) {
    var query = new Query();
    query.AddParameter("v", paramValue);
    query.Text = String.Format("select * from {0}.{1} where {2}==@v", type, name, parameter);
    return query.Execute();
}


function CountEntities(type, name, paramValue, parameter) {
    var query = new Query();
    query.AddParameter("v", paramValue);
    query.Text = String.Format("select count(Id) from {0}.{1} where {2}==@v", type, name, parameter);
    return query.Execute();
}


//-----------------Main-------------------------------

function OpenMenu() {
    var sl = Variables["swipe_layout"];
    if (sl.Index == 1) {
        sl.Index = 0;
    }
    else if (sl.Index == 0) {
        sl.Index = 1;
    }
}

function CloseMenu() {
    var sl = Variables["swipe_layout"];
    if (sl.Index == 1) {
        sl.Index = 0;
    }
    else if (sl.Index == 0) {
        sl.Index = 1;
    }
}




function ShowMapIfNotNew(outlet) {
    if (outlet.IsNew == false) {
        Workflow.Action("ShowMap", [outlet]);
    }
}



//---------------------------------------------Sync--------------------------------

function Sync() {

    //Variables["dbIndicator"].Start();
    DB.Sync();//StopIndicator);
}

function StopIndicator() {
    Variables["dbIndicator"].Stop();
}

function SyncFTP() {
    Variables["fotoIndicator"].Start();
    FileSystem.UploadPrivate(UploadPrivateCallback);
}

function UploadPrivateCallback(args) {
    if (args.Result) {
        FileSystem.SyncShared(SyncSharedCallback);
    }
    else
        FileSystem.HandleLastError();
    Variables["fotoIndicator"].Stop();
}

function SyncSharedCallback(args) {
    if (!args.Result) {
        FileSystem.HandleLastError();
    }
}


function ShowBarrel() {

    var items = [];
    for (var i = 0; i < 3; i++) {
        var row = [];
        row.push(i);
        row.push(i);
        items.push(row);
    }

    Dialog.Select("Hohohoh", items, Haha);

}

function Haha(item, state) {
}
