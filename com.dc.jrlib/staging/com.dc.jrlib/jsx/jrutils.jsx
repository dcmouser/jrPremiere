// generic extendscript helper stuff

$.jrutils = {


    //---------------------------------------------------------------------------
    // global access
    jrSetGlobalExtensionContextString: function (extensionContextString) {
        // set this
        if ($.jrGlobal == undefined) {
            $.jrGlobal = {};
        }
        // remember it
        $.jrGlobal.extensionContextString = extensionContextString;

        // initialize contents IFF empty (this function will get called before EVERY function call)
        var extensionContextKey = this.jrGetGlobalExtensionContextKey();
        if ($.jrGlobal[extensionContextKey] === undefined) {
            $.jrGlobal[extensionContextKey] = {};
        }
    },

    jrGetGlobalExtensionContextKey: function () {
        // set this
        if ($.jrGlobal == undefined) {
            throw "jrGetGlobalExtensionContextKey jrGlobal is undefined.";
        }
        var val = $.jrGlobal.extensionContextString;
        if (!val) {
            throw "jrGetGlobalExtensionContextString yields false.";
        }
        return val + ".Globals";
    },


    jrSetGlobal: function (key, val) {
        var extensionContextKey = this.jrGetGlobalExtensionContextKey();
        //$.jrGlobal[key] = val;
        $.jrGlobal[extensionContextKey][key] = val;
        // alert("ATTN: jrSetGlobal with extensionContextKey = " + extensionContextKey + " and key = " + key + " and val = " + this.jstringify(val));
    },

    jrGetGlobal: function (key) {
        var extensionContextKey = this.jrGetGlobalExtensionContextKey();
        //var val = $.jrGlobal[key];
        var val = $.jrGlobal[extensionContextKey][key];
        return val;
    },

    jrGetAllGlobal: function () {
        return $.jrGlobal;
    },

    jrGetAppGlobal: function () {
        var extensionContextKey = this.jrGetGlobalExtensionContextKey();
        return $.jrGlobal[extensionContextKey];
    },

    jrGetEnsureJrGlobalContextKey: function () {
        var extensionContextKey = this.jrGetGlobalExtensionContextKey();
        if ($.jrGlobal == undefined) {
            $.jrGlobal = {};
        }
        if ($.jrGlobal[extensionContextKey] == undefined) {
            $.jrGlobal[extensionContextKey] = {};
        }
        return extensionContextKey;
    },
    //---------------------------------------------------------------------------












    //---------------------------------------------------------------------------
    jrSetGlobalFlag: function (key, flagName, flagVal) {
        var v = this.jrGetGlobal(key);
        if (v == undefined) {
            this.jrSetGlobal(key, {});
            v = this.jrGetGlobal(key);
        }
        v[flagName] = flagVal;
    },


    jrIncrementGlobalCounter: function (key) {
        var val = this.jrGetGlobal(key);
        if (val == undefined) {
            this.jrSetGlobal(key, 1);
        } else {
            this.jrSetGlobal(key, val + 1);
        }
    },
    //---------------------------------------------------------------------------



    //---------------------------------------------------------------------------
    jrGetGlobalOptions: function () {
        var options = this.jrGetGlobal("options");
        /*
        // too weird to do this automatically
        if (options=undefined) {
            // try to load from file
            this.jrLoadGlobalOptionsFromSettingsFile();
        }
        */

        return options;
    },

    jrSetGlobalOptions: function (options) {
        this.jrSetGlobal("options", options);
        // save persistently to file?
        //jrSaveGlobalOptionsToSettingsFile();
    },
    //---------------------------------------------------------------------------





    //---------------------------------------------------------------------------
    jrGetGlobalOptionsStringified: function () {
        // get current saved options from the extension
        var options = this.jrGetGlobalOptions();
        var optionsjsoned = this.jstringify(options);
        return optionsjsoned;
    },

    jrSetGlobalOptionsFromStringified: function (optionsjsoned) {
        // send current options to the extension
        try {
            var options = JSON.parse(decodeURI(optionsjsoned));
        } catch (e) {
            // exception error
            $.jrutils.consoleerror("Exception in jrSetGlobalOptions with options: " + $.jrutils.jrEnsureStringForDebug(optionsjsoned));
            alert("EXCEPTION jrSetGlobalOptions with: " + $.jrutils.jstringify(optionsjsoned));
            return;
        }
        //alert("IN jrSetGlobalOptions with: " + $.jrutils.jstringify(options));
        this.jrSetGlobalOptions(options);
    },


    getIsDebugModeEnabled: function () {
        return this.jrGetGlobal("options").debugMode;
    },
    //---------------------------------------------------------------------------

































    //---------------------------------------------------------------------------
    consolelog: function (str) {
        $.writeln(str);
        //if (console) { console.log(str); }
    },


    consoleerror: function (str) {
        this.consolelog("ERROR" + str);
    },
    //---------------------------------------------------------------------------



    //---------------------------------------------------------------------------
    jstringify: function (obj, replacer, space) {
        return JSON.stringify(obj, replacer, space);
    },


    getCurrentDateTimeAsNiceString: function () {
        var d = new Date();
        var str = d.toLocaleDateString() + " at " + d.toLocaleTimeString();
        return str;
    },


    jrStringStartsWith: function (str, prefix) {
        if (str === undefined) {
            return false;
        }
        if (str.length < prefix.length) {
            return false;
        }
        if (str.substr(0, prefix.length) == prefix) {
            return true;
        }
        return false;
    },

    jrEnsureStringForDebug: function (obj) {
        if (obj === undefined) {
            return "undefined";
        }
        if (typeof obj == "string") {
            return obj;
        }
        return this.jstringify(obj);
    },


    jrShortenPaths: function (pathStr, subPathLen) {
        if (subPathLen < 2) {
            subPathLen = 2;
        }
        var parts = pathStr.split("/");
        for (var i = 0; i < parts.length; ++i) {
            var part = parts[i];
            if (part.length > subPathLen) {
                parts[i] = part.substr(0, subPathLen - 2) + "..";
            }
        }
        return parts.join("/");
    },


    jrNiceExceptionDescription: function (e) {
        return e.message;
    },
    //---------------------------------------------------------------------------



    //---------------------------------------------------------------------------
    jrMakeJsonDeepCopyOfObject: function (obj) {
        var objCopy = JSON.parse(this.jstringify(obj));
        return objCopy;
    },

    jrAreObjectsEqual: function (obj1, obj2) {
        return (this.jstringify(obj1) == this.jstringify(obj2));
    },
    //---------------------------------------------------------------------------


    //---------------------------------------------------------------------------
    jrArrayContains: function (ary, val) {
        for (var i = 0; i < ary.length; ++i) {
            if (ary[i] == val) {
                return true;
            }
        }
        return false;
    },
    //---------------------------------------------------------------------------


    //---------------------------------------------------------------------------
    doOpenFilePathInexplorer: function (filePath) {
        // open the file in explorer
        var f = new File(filePath);
        f.execute();
    },
    //---------------------------------------------------------------------------










    //---------------------------------------------------------------------------
    jrAuditSaveResultsLineSeparator: function (outFile) {
        outFile.writeln("");
        outFile.writeln("");
        outFile.writeln("------------------------------------------------------------------------------------------------------------------------");
        outFile.writeln("");
    },


    jrAnnounceSectionToOutputFile: function (outFile, str) {
        this.jrAuditSaveResultsLineSeparator(outFile);
        outFile.writeln("========== " + str + " ==========");
        outFile.writeln("");
    },
    //---------------------------------------------------------------------------








    //---------------------------------------------------------------------------
    jrMyPatternMatchesName: function (pat, name) {
        // simple check if it pat substring is in name, case insensitive
        if (pat === undefined || name === undefined) {
            return false;
        }
        if (pat == "*") {
            return true;
        }
        if (name.toLowerCase().indexOf(pat.toLowerCase()) != -1) {
            return true;
        }
        return false;
    },
    //---------------------------------------------------------------------------








    //---------------------------------------------------------------------------
    jrGetExtensionInitialized: function () {
        return this.jrGetGlobal("initialized")
    },
    jrSetExtensionInitialized: function () {
        this.jrSetGlobal("initialized", true);
    },
    //---------------------------------------------------------------------------



    //---------------------------------------------------------------------------
    jrFileExists: function (fpath) {
        var myFile = new File(fpath);
        if (myFile.exists) {
            return true;
        }
        return false;
    },

    jrFolderExists: function (fpath) {
        var myFolder = new Folder(fpath);
        if (myFolder.exists) {
            return true;
        }
        return false;
    },


    jrMakeFolder: function (fpath) {
        var myFolder = new Folder(fpath);
        var retv = myFolder.create();
        return retv;
    },

    jrGetFileExtension: function (fname) {
        var ext = "";
        var pos = fname.lastIndexOf(".");
        if (pos > -1) {
            ext = fname.substr(pos + 1);
        }
        return ext;
    },

    jrGetNamePartOfPath: function (fpath) {
        var name = "";
        var pos = fpath.lastIndexOf(this.adobeGetSep());
        if (pos > -1) {
            name = fpath.substr(pos + 1);
        }
        return name;
    },


    jrMoveFileToFolder: function (fpath, outDir) {
        // we assume outDir exists
        // return true on success
        var myFile = new File(fpath);
        if (myFile.exists) {
            var namePart = this.jrGetNamePartOfPath(fpath);
            if (namePart != "") {
                var newFpath = outDir + this.adobeGetSep() + namePart;
                var retv = myFile.rename(newFpath);
                return retv;
            }
        }
        // fail
        return false;
    },



    jrIncrementStringWithNumberAtEnd: function (str) {
        var numSuffix = 0;

        const regexMatch = /([\d]*)$/i;
        const regexReplace = /[\d]*$/i;
        var results = str.match(regexMatch);
        if (results.length >= 1) {
            // get the number
            var numSuffixAsString = results[1];
            numSuffix = parseInt(numSuffixAsString);
            // remove the end digits
            str = str.replace(regexReplace, "");
        }
        // incremenet
        ++numSuffix;
        // add
        str += numSuffix.toString();
        return str;
    },


    toFloat: function(val) {
        if (typeof val != "number") {
            val = parseFloat(val);
        }
        return val;
    },
    toInt: function(val) {
        if (typeof val != "number") {
            val = parseInt(val);
        }
        return val;
    },


    jrDeleteFileIfExists: function (fpath) {
        var myFile = new File(fpath);
        if (!myFile.exists) {
            return true;
        }
        myFile.remove();
        return true;
    },
    //---------------------------------------------------------------------------






    //---------------------------------------------------------------------------
    jrMergeObjectFunctionsFromTo: function (fromObj, toObj) {
        for (var attrname in fromObj) {
            if (typeof fromObj[attrname] == "function") {
                toObj[attrname] = fromObj[attrname];
            }
        }
    },
    //---------------------------------------------------------------------------




    
    //---------------------------------------------------------------------------
    adobeGetSep: function () {
        if (Folder.fs == 'Macintosh') {
            return '/';
        } else {
            return '\\';
        }
    },
    //---------------------------------------------------------------------------




    //---------------------------------------------------------------------------
    wrapResultInfoSummary: function (str) {
        var resultObj = {
            infoSummary: str,
        };
        return this.jstringify(resultObj);
    },
    //---------------------------------------------------------------------------






    //---------------------------------------------------------------------------
    debugObj : function(obj) {
        var str = "";
        for (var key in obj) {
            str += key + "|";
        }

        return str;
    },
    //---------------------------------------------------------------------------


    //---------------------------------------------------------------------------
    sleepForNewFileAccess: function(fpath) {
        // sleep for a bit to let file become accessible
        $.sleep(1500);
    },
    //---------------------------------------------------------------------------

    

    //---------------------------------------------------------------------------
    parseOptionsFilter : function(optionsSepStrings, optionsEnable) {
        if (!optionsEnable || !optionsSepStrings) {
            return [];
        }
        return optionsSepStrings.split("|");
    },
    //---------------------------------------------------------------------------



    //---------------------------------------------------------------------------
    jrAddCommonCallables: function (jrcallables) {

        addCallables = {
            // common
            jrSetGlobalContext: function (extensionContextString) {
                // called before every other call below to make sure the functions know their global context
                $.jrutils.jrSetGlobalExtensionContextString(extensionContextString);
            },
            about: function () {
                //alert("IN jrutils about.");
                //return "HIABOUT";

                if ($.jrutils.jrGetGlobal("appname") === undefined) {
                    return "";
                }
                var msg = $.jrutils.jrGetGlobal("appname") + " v" + $.jrutils.jrGetGlobal("appversion") + " by " + $.jrutils.jrGetGlobal("appauthor");
                return msg;
            },
            //
            doGetGlobalOptions: function () {
                return $.jrutils.jrGetGlobalOptionsStringified();
            },
            doSetGlobalOptions: function (optionsjsoned) {
                return $.jrutils.jrSetGlobalOptionsFromStringified(optionsjsoned);
            },

        };

        // merge in some
        $.jrutils.jrMergeObjectFunctionsFromTo(addCallables, jrcallables);
    },
    //---------------------------------------------------------------------------



};