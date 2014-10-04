function OnLoad() {
	DrawDataReport();

	DrawFtpReport();
}

// -------------------- Sync Data ------------
function SyncData() {
		
	$.dataSyncReport.Visible = false;
    $.dataSyncLayout.Visible = true;
    $.dataSyncIndicator.Start();

    DB.Sync(SyncDataFinish);
}

function SyncDataFinish() {
    $.dataSyncIndicator.Stop();
    $.dataSyncLayout.Visible = false;
    $.dataSyncReport.Visible = true;

    Variables.Remove("lastDataSync");
    Variables.AddGlobal("lastDataSync", DateTime.Now.ToString("dd MMM yyyy HH:mm"));
    $.dataSyncReport.Text = $.lastDataSync;
    	
	DrawDataReport()
}

function DrawDataReport() {
	 var at = Translate["#at#"];
	 var date = DB.LastSyncTime.ToString("dd.MM.yy ");
	 var time = DB.LastSyncTime.ToString(" HH:mm");

	 if (DB.SuccessSync) {
	  $.dataSyncReport.Text = date + at + time;
	  $.dataSyncReport.Visible = true;
	  $.dataSyncError.Visible = false;
	 } else {
	  $.dataSyncError.Text = Translate["#error#"] + ": " + date + at + time;
	  $.dataSyncError.Visible = true;
	  $.dataSyncReport.Visible = false;
	 }
}


// -------------------- Sync Ftp ------------

function SyncFtp() {
    $.ftpSyncReport.Visible = false;
    $.ftpSyncLayout.Visible = true;
    $.ftpSyncIndicator.Start();

    FileSystem.UploadPrivate(UploadPrivateCallback);
}

function UploadPrivateCallback(args) {
    if (args.Result) {
        FileSystem.SyncShared(SyncSharedCallback);
    }
    else {
        FileSystem.HandleLastError();
        SyncFtpFinish();
    }
}

function SyncSharedCallback(args) {
    if (!args.Result) {
        FileSystem.HandleLastError();
    }

    SyncFtpFinish();
}

function SyncFtpFinish() {
    $.ftpSyncIndicator.Stop();
    $.ftpSyncLayout.Visible = false;
    $.ftpSyncReport.Visible = true;

    Variables.Remove("lastFtpSync");
    Variables.AddGlobal("lastFtpSync", DateTime.Now.ToString("dd MMM yyyy HH:mm"));
    $.ftpSyncReport.Text = $.lastFtpSync;
    
    DrawFtpReport();    
}

function DrawFtpReport() {
	 var at = Translate["#at#"];
	 var date = FileSystem.LastSyncTime.ToString("dd.MM.yy ");
	 var time = FileSystem.LastSyncTime.ToString(" HH:mm");

	 if (FileSystem.SuccessSync) {
	  $.ftpSyncReport.Text = date + at + time;
	  $.ftpSyncReport.Visible = true;
	  $.ftpSyncError.Visible = false;
	 } else {
	  if (isDefault(FileSystem.LastSyncTime))
	   $.ftpSyncError.Text = Translate["#Synchronization_has_not_been_performed#"];
	  else
	   $.ftpSyncError.Text = Translate["#error#"] + ": " + date + at + time;
	  $.ftpSyncError.Visible = true;
	  $.ftpSyncReport.Visible = false;
	 }
}
