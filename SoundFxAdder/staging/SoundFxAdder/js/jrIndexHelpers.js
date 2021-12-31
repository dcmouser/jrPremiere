// helpers for running the index.html extension panel ui communication with jsx extendscript code

//---------------------------------------------------------------------------
// this MUST match the value set in appName.jsx
var myUniqueAppId = "SoundFxAdder";
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


function clickProcessAddAll() {
    setInfoSimpleText("<p>Please wait while audio clips are added to active sequence...</p>");
    saveAndSendUiOptions();
    jrEvalScript('doProcessActiveSequenceAddAll()', (result) => {processResult(result)});
}


function clickAddItem(jlink) {
    setInfoSimpleText("<p>Processing..</p>");
    jrEvalScript("addToItem('" + jlink + "')", (result) => {processResult(result)});
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

        var addclickgo = "clickAddItem(\"" + encodeURI(JSON.stringify(calink)) +"\");";	
        var addanchor;
        if (alink.noadd) {
            addanchor = "&nbsp;";
        } else {
            addanchor = " <a href='#/' onclick='" + addclickgo + "'>" + "(add&nbsp;now)" + "</a>";
        }
        aline += "<td>" + addanchor +"</td>";


        aline += "</tr>";
        str += aline + "\n";
    }
    str = "<table>" + str + "</table>";
    // return it
    return str;
}
//---------------------------------------------------------------------------

