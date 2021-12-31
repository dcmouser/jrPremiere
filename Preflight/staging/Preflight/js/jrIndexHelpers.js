// helpers for running the index.html extension panel ui communication with jsx extendscript code

//---------------------------------------------------------------------------
// this MUST match the value set in appName.jsx
var myUniqueAppId = "Preflight";
//---------------------------------------------------------------------------

//---------------------------------------------------------------------------
var globalAutoAdvanceTimer = undefined;
//---------------------------------------------------------------------------




//---------------------------------------------------------------------------
function onLoadJrExtension() {
    // normal ext.js setup code
    onLoaded();

    // now our stuff
    setupAccordionGui(true);
    loadUiOptions();

    // check requirements
    checkJrLibRequirement(2.0);

    // init
    doInitializeExtension();
    }
//---------------------------------------------------------------------------















//---------------------------------------------------------------------------
function clickProcessFind() {
    setResultSimpleText("<p>Please wait while active sequence is processed...</p>");
    saveAndSendUiOptions();
    jrEvalScript('doProcessActiveSequenceFind()', (result) => {processResult(result)});
}
//---------------------------------------------------------------------------



//---------------------------------------------------------------------------
function clickProcessPlayPoi() {
    //setResultSimpleText("<p>Playing sequence points of interest...</p>");
    saveAndSendUiOptions();
    disengageAutoAdvanceTimer();
    jrEvalScript('doProcessPlayPoi()', (result) => {processResult(result)});
}


function clickProcessPlayAllPoi() {
    saveAndSendUiOptions();
    disengageAutoAdvanceTimer();
    jrEvalScript('doProcessPlayAllPoi()', (result) => {processResult(result)});
    // auto advance timer..
    engageAutoAdvanceTimerIfAppropriate();
}


function clickStopProcessPlayAllPoi() {
    saveAndSendUiOptions();
    disengageAutoAdvanceTimer();
    jrEvalScript('doStopProcessPlayAllPoi()');
}
//---------------------------------------------------------------------------




//---------------------------------------------------------------------------
function engageAutoAdvanceTimerIfAppropriate() {
    var intervalMs = 200;
    //
    disengageAutoAdvanceTimer();
    globalAutoAdvanceTimer = window.setInterval(checkAutoAdvanceTimer, intervalMs);
}

function checkAutoAdvanceTimer() {
    //alert("IN checkAutoAdvanceTimer.");
    jrEvalScript('autoAdvancePoiPreviewIfAppropriate()', (result) => {autoAdvancePoiPreviewIfAppropriateResult(result)});
}

function autoAdvancePoiPreviewIfAppropriateResult(result) {
    var retv = JSON.parse(result);
    //alert(JSON.stringify(result));
    if (!retv) {
        // turn off checking
        disengageAutoAdvanceTimer();
    }
}

function disengageAutoAdvanceTimer() {
    if (globalAutoAdvanceTimer) {
        // disable timer
        //alert("ATTN: Disabling timer disengageAutoAdvanceTimer.");
        clearInterval(globalAutoAdvanceTimer);
        globalAutoAdvanceTimer = undefined;
    }
}
//---------------------------------------------------------------------------















//---------------------------------------------------------------------------
function convertDatalinksToHtml(datalinks) {
    // built table in html
    // this is very ugly but my front end js/html skills are nada
    var str = "";
    for (var i=0; i<datalinks.length; ++i) {
        var alink = datalinks[i];

        // hide it?
        var hide = alink.hide;
        if (hide) {
            continue;
        }

        var calink = jrCleanDatalinkForClickEmbed(datalinks[i]);
        var timelabel = alink.label;
        var atext = alink.text;
        var subtext = alink.subtext;
        if (subtext === undefined) {
            subtext = "";
        }
        //
        var clickgo = "clickGoItemRoot(\"" + encodeURI(JSON.stringify(calink)) +"\");";	
        //
        var selclickgo = "clickGoItem(\"" + encodeURI(JSON.stringify(calink)) +"\");";	
        var selanchor = " <a href='#/' onclick='" + selclickgo + "'>" + "(sel)" + "</a>";
        //
        var aline = "<tr><td><a href='#/' onclick='" + clickgo + "'>" + timelabel + "</a></td>" + "<td>" + selanchor + "</td>" + "<td> " + atext + "</td>" + "<td>" + subtext + "</td>";

        aline += "</tr>";
        str += aline + "\n";
    }
    str = "<table>" + str + "</table>";
    // return it
    return str;
}
//---------------------------------------------------------------------------

