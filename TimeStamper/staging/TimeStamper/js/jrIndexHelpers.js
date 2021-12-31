// helpers for running the index.html extension panel ui communication with jsx extendscript code

//---------------------------------------------------------------------------
// this MUST match the value set in appName.jsx
var myUniqueAppId = "TimeStamper";
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
function clickExtractTimeStampsForActiveSequence() {
    setResultSimpleText("<p>Please wait while active sequence is scanned...</p>");
    saveAndSendUiOptions();
    jrEvalScript('doReExtractTimeStampsForActiveSequence()', (result) => {processResult(result)});
}

function clickRefreshTimeStampsForActiveSequence() {
    setResultSimpleText("<p>Please wait while refreshing currently active sequence...</p>");
    saveAndSendUiOptions();
    jrEvalScript('doRefreshTimeStampsForActiveSequence()', (result) => {processResult(result)});
}

function clickSaveActiveSequenceToFile() {
    setResultSimpleText("<p>Please wait while active sequence timestamps are saved...</p>");
    saveAndSendUiOptions();
    jrEvalScript('doSaveActiveSequenceToFile()', (result) => {processResult(result)});
}
//---------------------------------------------------------------------------






















//---------------------------------------------------------------------------
function convertDatalinksToHtml(datalinks) {
    // built table in html
    // this is very ugly but my front end js/html skills are nada
    var str = "";
    for (var i=0; i<datalinks.length; ++i) {
        var alink = datalinks[i];
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

