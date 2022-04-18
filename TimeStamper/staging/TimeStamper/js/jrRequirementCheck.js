// helper functions INCLUDED (REPEATED) with extension that will work and complain even if jrlib not installed
// ATTN: as of 4/18/22 this is not working because an error is triggering in adobe premiere when jrlib is not installed

//---------------------------------------------------------------------------
function checkJrLibRequirement(minVersion) {
    // check and complain about jr version requirements
    try {
        var jrLibVersion = jrLibGetVersion();
        if (jrLibVersion < minVersion) {
            reportError("ERROR: jrLib common extension library needs to be updated. Version [" + jrLibVersion.toString() + "] found, but this extension requires at least version [" + minVersion.toString() + "]. This extension will not work correctly until you upgrade the jrLib common extension library.");
        }
    } catch (e) {
        reportError("ERROR: jrLib common extension library not loaded; please see instructions on how to install. This extension will not work without it.<br/>\nERRCODE: "+e.message);
        return;
    }
}

function reportError(str) {
    //alert(str);
    var htmlstr = "<hr/><p class=\"error\">" + str + "</p>";
    $("#errorinfo").html(htmlstr);
}
//---------------------------------------------------------------------------




