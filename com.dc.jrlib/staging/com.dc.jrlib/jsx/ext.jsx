// for json support?
#include "./JSON-js-master/json2.js";

//---------------------------------------------------------------------------
if(typeof($)=='undefined')
	$={};

$._jrext = {
    //Evaluate a file and catch the exception.
    evalFile : function(path) {
        try {
            $.evalFile(path);
        } catch (e) {alert("Exception:" + e);}
    },
    // Evaluate all the files in the given folder 
    evalFiles: function(jsxFolderPath) {
		//alert("ATTN: IN ext.jsx evalFiles running on path " + jsxFolderPath);
		var folder = new Folder(jsxFolderPath);
        if (folder.exists) {
            var jsxFiles = folder.getFiles("*.jsx");
            for (var i = 0; i < jsxFiles.length; i++) {
                var jsxFile = jsxFiles[i];
                //alert("ATTN: evail files "+ jsxFile)
                $._jrext.evalFile(jsxFile);
            }
        }
    }
};
//---------------------------------------------------------------------------



