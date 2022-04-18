
// cep related helpers

////@include "jrutils.jsx"

$.jrcep = {

    //---------------------------------------------------------------------------
    ceplog: function (str) {
        app.setSDKEventMessage(str, "info");
        $.jrutils.consolelog($.jrutils.getCurrentDateTimeAsNiceString() + ": " + str);
    },
    //---------------------------------------------------------------------------




    //---------------------------------------------------------------------------
    jrConvertTicksToSeconds: function (ticks) {
        if (typeof ticks != "number") {
            ticks = this.jrConvertTicksToNumeric(ticks);
        }
        return (ticks / 254016000000.0);
    },


    jrConvertTicksToNumeric: function (ticks) {
        if (typeof ticks != "number") {
            ticks = parseFloat(ticks);
        }
        return ticks;
    },


    jrConvertSecondsToTicks: function (seconds) {
        if (typeof seconds != "number") {
            seconds = this.jrConvertTicksToNumeric(seconds);
        }
        return (seconds * 254016000000.0);
    },


    jrConvertMsToTicks: function (ms) {
        return this.jrConvertSecondsToTicks(ms / 1000.0);
    },
    //---------------------------------------------------------------------------





    //---------------------------------------------------------------------------
    jrGetSequenceIdFromSequence: function (seq) {
        if (!seq) {
            return undefined;
        }
        var pitem = seq.projectItem;
        if (!pitem) {
            return undefined;
        }
        var seqnodeId = pitem.nodeId;
        return seqnodeId;
    },


    jrCalcActiveSequence: function () {
        // get active sequence
        return app.project.activeSequence;
    },


    jrCalcActiveSequenceId: function () {
        // get active sequence
        var sequence = this.jrCalcActiveSequence();
        if (!sequence) {
            return undefined;
        }
        return sequence.projectItem.nodeId;
    },


    jrSetActiveSequence: function(sequence) {
        app.project.openSequence(sequence.sequenceID);
        app.project.activeSequence = sequence;
    },


    jrLookupSequnceById: function (seqid) {
        // we could cache these but instead we look up each time fore now
        //
        var projectSequences = app.project.sequences;
        for (var i = 0; i < projectSequences.numSequences; ++i) {
            var seq = projectSequences[i];
            var pitem = seq.projectItem;
            if (!pitem) {
                continue;
            }
            var seqnodeId = pitem.nodeId;
            if (seqnodeId == seqid) {
                return seq;
            }
        }
        // not found
        //consolelog("Could not find sequence for id "+seqid);
        //throw "seq not found: "+seqid;
        return undefined;
    },


    jrGetSequnceNameById: function (seqid) {
        var sequence = this.jrLookupSequnceById(seqid);
        if (!sequence) {
            return "undefined";
        }
        return sequence.name;
    },



    jrMakeErrorRequest: function (msg, flagAddAdobeEventForError) {
        // add an event report too?
        if (flagAddAdobeEventForError) {
            app.setSDKEventMessage(msg, "error");
        }
        //
        var resultObj = {
            "datalinks": [],
            "datalinksSummary": "",
            "infoSummary": msg,
        };
        return resultObj;
    },


    jrMakeErrorRequestResultSequenceNotFound: function (seqLabel, flagAddAdobeEventForError) {
        return this.jrMakeErrorRequest("ERROR: Could not find " + seqLabel + " sequence to process.", flagAddAdobeEventForError);
    },



    jrLookupProjectItemById: function (projItemId) {
        return this.jrLookupProjectItemByFieldUnderChild(projItemId, app.project.rootItem, "nodeId");
    },

    jrLookupProjectItemByFieldUnderChild: function (fieldval, itemNode, fieldname) {
        // ATTN: this is not recursing properly??
        if (!itemNode || !itemNode.children) {
            return undefined;
        }
        var numChildren = itemNode.children.numItems;
        for (var i = 0; i < numChildren; i++) {
            var currentItem = itemNode.children[i];
            if (currentItem[fieldname] == fieldval) {
                return currentItem;
            }
            // recurse
            var retv = this.jrLookupProjectItemByFieldUnderChild(fieldval, currentItem, fieldname);
            if (retv) {
                return retv;
            }
        }
        // not found
        return undefined;
    },


    jrLookupProjectItemByName: function (name) {
        return this.jrLookupProjectItemByFieldUnderChild(name, app.project.rootItem, "name");
        /*
        try {
            var rootitem = app.project.rootItem;
            return this.jrLookupProjectItemByFieldUnderChild(name, rootitem, "name");
        } catch (e) {
            // no project open
            return undefined;
        }
        */
    },


    jrLookupProjectItemUnderProjectItemByName: function (parent, name) {
        return this.jrLookupProjectItemByFieldUnderChild(name, parent, "name");
    },




    jrRenameProjectItems: function(targetBin, projectItemExpectedName, newNameval) {
        var numChildren = targetBin.children.numItems;
        for (var i = 0; i < numChildren; i++) {
            var currentItem = targetBin.children[i];
            if (currentItem.name == projectItemExpectedName) {
                currentItem.name = newNameval
                currentItem.deleteBin();
            }
            // recurse
            if (currentItem.children && currentItem.children.numItem>0) {
                this.jrRenameProjectItems(currentItem, projectItemExpectedName, newNameval);
            }
        }
    },
    //---------------------------------------------------------------------------





    //---------------------------------------------------------------------------
    jrLookupTrackInSequenceByName: function (sequence, targetTrackName, trackTypeStr) {
        if (!sequence) {
            return undefined;
        }

        // walk video tracks
        if (trackTypeStr == "video") {
            var videoTrackCount = sequence.videoTracks.length;
            for (var i = 0; i < videoTrackCount; ++i) {
                var track = sequence.videoTracks[i];
                var tracknameNice = this.jrCalcTrackNameNice(track.name, "V", i);
                if (tracknameNice == targetTrackName || track.name == targetTrackName) {
                    return track;
                }
            }
        }

        // walk audio tracks
        if (trackTypeStr == "audio") {
            var audioTrackCount = sequence.audioTracks.length;
            for (var i = 0; i < audioTrackCount; ++i) {
                var track = sequence.audioTracks[i];
                var tracknameNice = this.jrCalcTrackNameNice(track.name, "A", i);
                if (tracknameNice == targetTrackName || track.name == targetTrackName) {
                    return track;
                }
            }
        }

        // not found
        return undefined;
    },


    jrCalcTrackNameNice: function (name, trackTypePrefix, index) {
        if ($.jrutils.jrStringStartsWith(name, "Audio ")) {
            name = "A" + name.substr(6);
        } else if ($.jrutils.jrStringStartsWith(name, "Video ")) {
            name = "V" + name.substr(6);
        } else {
            // should we just drop down or let it continue?
            name = trackTypePrefix + index.toString();
        }
        return name;
    },
    //---------------------------------------------------------------------------

















    //---------------------------------------------------------------------------
    jrPlayHeadGotoTick: function (tickVal) {
        var nqactiveSeq = app.project.activeSequence;
        if (!nqactiveSeq) {
            app.setSDKEventMessage("No active sequence found to go to.", "error");
            return false;
        }

        nqactiveSeq.setPlayerPosition(tickVal.toString());
        return true;
    },


    jrPlayHeadGotoItem: function (jlinkjsoned) {
        // important: see jrCleanDatalinkForClickEmbed() in jrindexHelpers for things that are cleaned from this when making gui clickable
        var jlink = JSON.parse(decodeURI(jlinkjsoned));

        // we have these values
        var sid = jlink.sid;
        var nodeId = jlink.nodeId;
        var guid = jlink.guid;
        var ticks = jlink.ticks;
        var oticks = jlink.oticks;
        // where id is either nodeid.# (clip) or guid#. (marker)

        var flagSelectMidpoints = this.getOptionSelectMidpoints();
        if (flagSelectMidpoints) {
            ticks = (jlink.ticks + jlink.eticks) / 2;
            oticks = oticks + (jlink.eticks - jlink.ticks) / 2;
        }

        //alert("ATTN: jrPlayHeadGotoItemB to " + $.jrutils.jstringify(jlink) + " with oticks " + oticks);

        var bretv = false;
        if (sid) {
            if (jlink.goSource) {
                // this is special case where we want to open the sequence (Or actually the seqid can refer to a more general clip id) in the SOURCE MONITOR
                bretv = $.jrcep.jrOpenProjectItemInSourceMonitor(sid, oticks, ticks);
            } else {
                bretv = $.jrcep.jrSetActiveSequenceAndSelectClipItem(sid, nodeId, guid, oticks, ticks);
            }
        }

        if (!bretv) {
            // fallback
            bretv = $.jrcep.jrPlayHeadGotoTick(jlink.ticks);
        }

        return bretv;
    },



    jrPlayHeadGotoItemRoot: function (jlinkjsoned) {
        var jlink = JSON.parse(decodeURI(jlinkjsoned));

        // we have these values, which point to the ORIGINAL sequence
        var ticks = jlink.ticks;
        var sid = jlink.asid;
        var nodeId = jlink.nodeId;
        var guid = jlink.guid;

        var flagSelectMidpoints = this.getOptionSelectMidpoints();
        if (flagSelectMidpoints) {
            ticks = (jlink.ticks + jlink.eticks) / 2;
        }

        //alert("ATTN: jrPlayHeadGotoItemRoot to " + $.jrutils.jstringify(jlink));

        // where id is either nodeid.# (clip) or guid#. (marker)

        var bretv = false;
        if (sid) {
            bretv = $.jrcep.jrSetActiveSequenceAndSelectClipItem(sid, "", guid, ticks, ticks);
        } else {
            // fallback
            bretv = $.jrcep.jrPlayHeadGotoTick(jlink.ticks);
        }

        return bretv;
    },
    //---------------------------------------------------------------------------




    //---------------------------------------------------------------------------
    getOptionSelectMidpoints: function() {
        var options = $.jrutils.jrGetGlobalOptions();
        if (options["selectMidpoints"]) {
            return true;
        }
        return false;
    },
    //---------------------------------------------------------------------------


    //---------------------------------------------------------------------------
    jrconvertAdobeTimeTicksToYoutubeFriendly: function (ticks) {
        // format as hours:mins:secs with leading zeros
        var parts = [];

        var seconds = this.jrConvertTicksToSeconds(ticks);

        if (false || Math.floor(seconds / 3600) > 0) {
            parts.push(this.jrPadDoubleDigit(Math.floor(seconds / 3600)));
        }
        parts.push(this.jrPadDoubleDigit(Math.floor(seconds % 3600 / 60)));
        parts.push(this.jrPadDoubleDigit(Math.floor(seconds % 60)));
        var separator = ":";
        var retstr = parts.join(typeof separator !== 'undefined' ? separator : ':');
        return retstr;
    },


    jrPadDoubleDigit: function (input) {
        return input < 10 ? "0" + input : input;
    },


    jrconvertAdobeTimeTicksToAdobeTimeString: function (ticks) {
        // format as hours:mins:secs:FF with leading zeros
        var parts = [];

        var seconds = this.jrConvertTicksToSeconds(ticks);

        if (false || Math.floor(seconds / 3600) > 0) {
            parts.push(this.jrPadDoubleDigit(Math.floor(seconds / 3600)));
        }
        parts.push(this.jrPadDoubleDigit(Math.floor(seconds % 3600 / 60)));
        parts.push(this.jrPadDoubleDigit(Math.floor(seconds % 60)));

        // frames as last digits
        var secsFrac = seconds - Math.floor(seconds);

        // guess framerate part
        var framerate;

        // does not work
        //var sequence = this.jrCalcActiveSequence();
        //framerate = sequence.projectItem.getFootageInterpretation().frameRate;
        //alert(frameRate);

        // fallback
        if (!framerate) {
            frameRate = 24.0; // close enough?
        }

        var frameFrac = secsFrac * frameRate;
        parts.push(this.jrPadDoubleDigit(Math.floor(frameFrac)));

        var separator = ":";
        var retstr = parts.join(typeof separator !== 'undefined' ? separator : ':');
        return retstr;
    },
    //---------------------------------------------------------------------------




























    //---------------------------------------------------------------------------
    jrSetActiveSequenceAndSelectClipItem: function (seqid, nodeid, guid, oticks, ticks) {
        // this can fail if sequence is not open in timeline
        if (!seqid) {
            return;
        }

        // ATTN: 11/1/21 -- this stopped working properly

        var seq = this.jrLookupSequnceById(seqid);
        if (!seq) {
            alert("Failed to find sequence " + seqid + " (do you need to rescan for changed timestamps?)");
            return false;
        }
        if (seq) {
            //alert("Trying to go to sequence " + seqid +": " + seq.name);
        }
        app.project.openSequence(seq.sequenceID);
        app.project.activeSequence = seq;

        // go to playhead
        //alert("ATTN: jrSetActiveSequenceAndSelectClipItem going to oticks " + oticks.toString());
        this.jrPlayHeadGotoTick(oticks);

        // now select item

        // nodeid or guid
        var nodeid, guid;
        if (nodeid) {
            var trackItem = $.jrcep.jrFindTrackItemOnSequence(seqid, nodeid);
            if (trackItem) {
                // unselect all
                $.jrcep.jrUnselectAllOnSequence(seqid, 0);
                trackItem.setSelected(1, 1);
            }
        } if (guid) {
            // marker
            // we don't have to select it we have jumped to it
            var marker = $.jrcep.jrFindTmarkerOnSequence(seqid, guid);
            if (marker) {
                // ATTN: unfinished
                // select it? open it?
            }
        }

        // success
        return true;
    },
    //---------------------------------------------------------------------------




    //---------------------------------------------------------------------------
    jrOpenProjectItemInSourceMonitor: function (projItemId, oticks, ticks) {
        // location project item
        var projItem = $.jrcep.jrLookupProjectItemById(projItemId);
        if (!projItem) {
            alert("Failed to find project item " + projItemId + " to jump to (do you need to rescan for changed timestamps?)");
            return false;
        }

        // ok we found it, now open it in source monitor
        app.sourceMonitor.openProjectItem(projItem);

        // go to location
        var bretv = $.jrqe.jrGoSourceMonitorLocation(oticks, projItem);

        // ALSO go in main timeline
        if (ticks !== undefined) {
            $.jrcep.jrPlayHeadGotoTick(ticks);
        }

        return bretv;
    },





    jrConvertProjectTicksToScrubTimeString: function (ticks, projItem) {
        // first convert ticks to secionts
        var secs = this.jrConvertTicksToSeconds(ticks);
        // now split secs into fractional and int parts
        var secsFloor = Math.floor(secs);
        var secsFrac = secs - secsFloor;
        // now convert fractional seconds to frames
        var frameRate = projItem.getFootageInterpretation().frameRate;
        var frameFrac = secsFrac * frameRate;
        var scrubTimeString = String(secsFloor) + "." + String(Math.floor(frameFrac));
        return scrubTimeString;
    },
    //---------------------------------------------------------------------------





    //---------------------------------------------------------------------------
    jrFindTrackItemOnSequence: function (seqid, nodeid) {

        sequence = this.jrLookupSequnceById(seqid);
        if (!sequence) {
            return undefined;
        }

        // walk video tracks
        var videoTrackCount = sequence.videoTracks.length;
        for (var i = 0; i < videoTrackCount; ++i) {
            var track = sequence.videoTracks[i];
            var clip = this.jrFindTrackItemOnTrack(track, nodeid);
            if (clip) {
                return clip;
            }
        }

        // walk audio tracks
        var audioTrackCount = sequence.audioTracks.length;
        for (var i = 0; i < audioTrackCount; ++i) {
            var track = sequence.audioTracks[i];
            var clip = this.jrFindTrackItemOnTrack(track, nodeid);
            if (clip) {
                return clip;
            }
        }

        return undefined;
    },


    jrFindTrackItemOnTrack: function (track, nodeid) {
        var numItems = track.clips.numItems;
        for (var i = 0; i < numItems; i++) {
            // add items from this clip to sequence item list
            var clip = track.clips[i];
            if (clip.nodeId == nodeid) {
                return clip;
            }
        }
        return undefined;
    },


    jrFindTmarkerOnSequence: function (seqid, guid) {
        sequence = this.jrLookupSequnceById(seqid);
        if (!sequence) {
            return undefined;
        }

        var markers = sequence.markers;
        if (!markers) {
            return undefined;
        }
        var numMarkers = markers.numMarkers;
        if (numMarkers == 0) {
            return undefined;
        }

        var currentMarker = markers.getFirstMarker()
        for (var i = 0; i < numMarkers; ++i) {
            if (currentMarker.guid == guid) {
                return currentMarker;
            }
            // advance to next marker
            currentMarker = markers.getNextMarker(currentMarker);
            if (!currentMarker) {
                // this should never happen
                break;
            }
        }

        return undefined;
    },



    jrUnselectAllOnSequence: function (seqid, refresh) {

        sequence = this.jrLookupSequnceById(seqid);
        if (!sequence) {
            return undefined;
        }

        // walk video tracks
        var videoTrackCount = sequence.videoTracks.length;
        for (var i = 0; i < videoTrackCount; ++i) {
            var track = sequence.videoTracks[i];
            $.jrcep.jrUnselectAllOnTrack(track, refresh);
        }

        // walk audio tracks
        var audioTrackCount = sequence.audioTracks.length;
        for (var i = 0; i < audioTrackCount; ++i) {
            var track = sequence.audioTracks[i];
            $.jrcep.jrUnselectAllOnTrack(track, refresh);
        }
    },


    jrUnselectAllOnTrack: function (track, refresh) {
        var numItems = track.clips.numItems;
        for (var i = 0; i < numItems; i++) {
            // add items from this clip to sequence item list
            var clip = track.clips[i];
            if (clip.isSelected()) {
                clip.setSelected(0, refresh);
            }
        }
    },
    //---------------------------------------------------------------------------




    //---------------------------------------------------------------------------
    jrCalcCepSettingsFilePath: function (myname) {
        // project directory
        var dataDir = app.getAppPrefPath;

        // open output file
        var outFileName = myname + 'Settings.json';
        var outFileFullPath = dataDir + $.jrutils.adobeGetSep() + outFileName;
        return outFileFullPath;
    },
    //---------------------------------------------------------------------------




    //---------------------------------------------------------------------------
    jrWriteJsonToFile: function (filePath, obj) {
        try {
            //alert("ATTN: TEST Writing to " + filePath);
            var file = new File(filePath);
            file.encoding = "UTF8";
            file.open("w", "TEXT", "????");
            file.writeln($.jrutils.jstringify(obj, null, 4));
            file.close();
            return true;
        }
        catch (e) {
            alert("EXCEPTION in jrWriteJsonToFile" + $.jrutils.jrNiceExceptionDescription(e));
            return false;
        }
    },


    jrReadJsonFromFile: function (filePath) {
        try {
            //alert("ATTN: TEST READING FROM " + filePath);
            var file = new File(filePath);
            file.encoding = "UTF8";
            file.open("r", "TEXT", "????");
            var fileContentsString = file.read();
            var obj = JSON.parse(fileContentsString);
            file.close();
            return obj;
        }
        catch (e) {
            alert("EXCEPTION in jrReadJsonFromFile" + $.jrutils.jrNiceExceptionDescription(e));
            return undefined
        }
    },
    //---------------------------------------------------------------------------













    //---------------------------------------------------------------------------
    jrCalculateMediaTypeFromProjectItem: function (projItem, item) {
        // we would like to know if this VIDEO item is actually a GRAPHIC or a GRAPHI IMAGE FILE or a FILM FILE, etc.
        var mediaType = undefined;

        // pmediapath can give us a file name which we could check EXTENSION for
        var mediaPath = projItem.getMediaPath();
        if (item) {
            // store extra property
            item["pMediaPath"] = mediaPath;
        }

        // get type from metadata -- might be most reliable way
        if (!mediaType) {
            // get it from metaData
            var metaData = projItem.getProjectMetadata();
            var re = new RegExp("Intrinsic\.MediaType\>([^<]*)\<\/");
            var reresult = metaData.match(re);
            if (reresult.length >= 1) {
                var mtype = reresult[1];
                if (item) {
                    // store extra property
                    item["mMediaType"] = mtype;
                }
                //
                if (mtype) {
                    if (mtype == "Still Image") {
                        mediaType = "image";
                    } else if (mtype == "Video") {
                        mediaType = "video";
                    } else if (mtype == "Movie") {
                        // this is used for like Bars and Tone or other adobe procedureal video clips?
                        // ATTN: do we want to label this mediaType differently than video?
                        mediaType = "video";
                    } else if (mtype == "Audio") {
                        mediaType = "audio";
                    } else {
                        mediaType = mtype.toLowerCase();;
                    }
                }
            }
        }

        // failed? guess type from extension
        if (!mediaType) {
            var extension = "";
            var pos = mediaPath.lastIndexOf(".");
            if (pos > -1) {
                extension = mediaPath.substr((pos + 1), 3);
            }
            mediaType = this.jrGuessMediaTypeFromFileExtension(extension);
        }

        // another way?
        if (!mediaType) {
            if (projItem.canProxy()) {
                // must be a video if it can be proxied
                mediaType = "video";
            } else {
                // but some things can't proxy but are not images, like Bars+Tones or generated video..
            }
        }

        return mediaType;
    },


    jrGuessMediaTypeFromFileExtension: function (extension) {
        // try hard to identify images -- the others dont really matter for our purposes
        // see https://helpx.adobe.com/premiere-pro/using/supported-file-formats.html
        var extensionsImage = ["jpg", "jpeg", "png", "webm", "png", "tiff", "tif", "gif", "bmp", "ai", "eps", "dib", "rle", "dpx", "eps", "ico", "psd", "ptl", "prtl", "tga", "icb", "vda", "vst"];
        var extensionsVideo = ["mp4", "avi", "mpg", "mpeg", "mov", "m4a", "wmv"];
        var extensionsMogrt = ["aeg", "aegraphic"];
        extension = extension.toLowerCase();


        if ($.jrutils.jrArrayContains(extensionsImage, extension)) {
            return "image";
        }
        if ($.jrutils.jrArrayContains(extensionsVideo, extension)) {
            return "video";
        }
        if ($.jrutils.jrArrayContains(extensionsMogrt, extension)) {
            return "mogrt";
        }
        return undefined;
    },
    //---------------------------------------------------------------------------





























    //---------------------------------------------------------------------------
    jrSaveGlobalOptionsToSettingsFile: function () {
        return false;
        var settingsFilePath = $jrcep.jrCalcSettingsFilePath();
        return $jrcep.jrWriteJsonToFile(settingsFilePath, $.jrutils.jrGetGlobal("options"));
    },


    jrLoadGlobalOptionsFromSettingsFile: function () {
        // start blank
        $.jrutils.jrSetGlobalOptions({});

        /*
        // ATTN: TODO
        var settingsFilePath = $jrcep.jrCalcSettingsFilePath();
        options = $jrcep.jrReadJsonFromFile(settingsFilePath);
        if (options !== undefined) {
            $.jrutils.jrSetGlobalOptions(options);
        }
        */

        return $.jrutils.jrGetGlobalOptions();
    },


    jrCalcSettingsFilePath: function () {
        return this.jrCalcCepSettingsFilePath($.jrutils.jrGetGlobal("appname"));
    },
    //---------------------------------------------------------------------------
































    //---------------------------------------------------------------------------
    JrCheckForClipInterference: function (track, projectItem, ticks) {
        // check if anything else is on track at location ticks (other than possibly projectItem);
        // if so, return that clip item
        //alert("ATTN: stage0: " + $.jrutils.jstringify(projectItem));

        var pstart = ticks;
        // ideally we would get duration of PROJECT ITEM
        // see https://community.adobe.com/t5/premiere-pro-discussions/get-project-item-duration/m-p/11708401
        var pduration = this.jrGuessDurationOfProjectItem(projectItem);
        var pend = pstart + pduration;

        // alert("ATTN: stage0b " + pstart.toString() + " - " + pend.toString() + " dur = "+ pduration.toString());

        var numItems = track.clips.numItems;
        for (var j = 0; j < numItems; j++) {
            // add items from this clip to sequence item list
            var clip = track.clips[j];
            var clipstart = clip.start.ticks;
            var clipend = clip.end.ticks;

            //alert("ATTN: stage1");
            if ((clipstart >= pstart && clipstart <= pend) || (clipend > pstart && clipend <= pend) || (clipstart > pstart && clipend <= pend) || (clipstart <= pstart && clipend >= pend)) {
                // overlap!
                // alert("ATTN: stage2");
                var toleranceInTicks = this.jrConvertSecondsToTicks(0.05);
                if (clip.projectItem && clip.projectItem.nodeId == projectItem.nodeId) {
                    // same object -- are they both same actual item already
                    // alert("clip duration = " + (clipend-clipstart).toString() +" vs projur = " + (pend-pstart).toString());
                    if (Math.abs(clipstart - pstart) < toleranceInTicks && (Math.abs(clipend - pend) < toleranceInTicks)) {
                        // EXACTLY THE SAME ALREADY; we return undefined meaning you can safely overwrite with no change
                        return false;
                    }
                    // alert($.jrutils.jstringify(clip));
                }

                return clip;
            }
        }
        //  nothing hit
        return undefined;
    },



    jrGuessDurationOfProjectItem: function (projItem) {
        // see https://community.adobe.com/t5/premiere-pro-discussions/get-project-item-duration/m-p/11708401
        // see https://community.adobe.com/t5/premiere-pro-discussions/how-to-get-source-clip-times/m-p/9523075
        // see https://stackoverflow.com/questions/40186600/how-to-convert-timecode-string-to-seconds
        // for now if not important return 0
        var metaData = projItem.getProjectMetadata();
        var re = new RegExp("Intrinsic\.MediaDuration\>([^<]*)\<\/");
        var reresult = metaData.match(re);
        //alert(metaData);

        // framereate
        var framerate;

        // lets try with hz in audio file
        var refr = new RegExp("Intrinsic.MediaTimebase\>([^<]*)\<\/");
        var reresultfr = metaData.match(refr);
        if (reresultfr.length >= 1) {
            // this value is not in frames per second.. im not sure what its in..
            framerate = parseFloat(reresultfr[1]);
        }

        /*
        framerate = projItem.getFootageInterpretation().frameRate;  // this doesnt seem to work
        alert("FRAMERATE1 = " + framerate.toString());
        var refr = new RegExp("\:frame_rate\>([^<]*)\<\/");
        var reresultfr = metaData.match(refr);
        if (reresultfr.length >= 1) {
            // this value is not in frames per second.. im not sure what its in..
            framerate = parseFloat(reresultfr[1]);
        }
        */
        //alert("FRAMERATE2 = " + framerate.toString());


        if (reresult.length >= 1) {
            var mediaDurationString = reresult[1];
            //alert("Test this.jrGuessDurationOfProjectItem = " + mediaDurationString);

            var mediaDurationSecs = this.jrConvertIntrinsicMediaDurationMetaDataStringToTicks(mediaDurationString, framerate);
            var mediaDurationTicks = this.jrConvertSecondsToTicks(mediaDurationSecs);
            // alert("Test mediaDurationSecs = " + mediaDurationSecs.toString() + " and ticks = " + mediaDurationTicks.toString());
            return mediaDurationTicks;
        }
        return 0;
    },
    //---------------------------------------------------------------------------




    //---------------------------------------------------------------------------
    jrConvertIntrinsicMediaDurationMetaDataStringToTicks: function (mediaDurationString, framerate) {
        var secParts = mediaDurationString.split(":");
        if (secParts.length != 4) {
            return 0;
        }
        var secsFull = (parseInt(secParts[0]) * 60 * 60) + (parseInt(secParts[1]) * 60) + (parseInt(secParts[2]));
        // what is the parts at the end
        secsFull = secsFull + parseInt(secParts[3]) / framerate;
        return secsFull;
    },
    //---------------------------------------------------------------------------









    //---------------------------------------------------------------------------
    jrCalcProjectDirectory: function () {
        var docPath = app.project.path;
        var lastSepPos = docPath.lastIndexOf($.jrutils.adobeGetSep());
        var projDir = docPath.substr(0, lastSepPos);
        return projDir;
    },

    jrCalcProjectFileBaseName: function () {
        var baseName = app.project.name;
        basename = baseName.replace(".prproj", "");
        return basename;
    },
    //---------------------------------------------------------------------------






















    //---------------------------------------------------------------------------
    jrAddCommonCepCallables: function (jrcallables) {
    
    	$.jrutils.jrAddCommonCallables(jrcallables);

        addCallables = {
            // common cep actions
            // notice we can't use THIS. below since we are in an inner context
            playHeadGotoTick: function (tickVal) {
                return $.jrcep.jrPlayHeadGotoTick(tickVal);
            },
            playHeadGotoItemRoot: function (jlink) {

                return $.jrcep.jrPlayHeadGotoItemRoot(jlink);
            },
            playHeadGotoItem: function (jlink) {
                return $.jrcep.jrPlayHeadGotoItem(jlink);
            },
        };

        // merge in some
        $.jrutils.jrMergeObjectFunctionsFromTo(addCallables, jrcallables);
    },
    //---------------------------------------------------------------------------







    //---------------------------------------------------------------------------
    unselectAllClipsOnSequence: function(sequence, updateUI) {
        // video tracks
        var videoTrackCount = sequence.videoTracks.length;
        for (var i = 0; i < videoTrackCount; ++i) {
            var track = sequence.videoTracks[i];
            this.unselectAllClipsOnTrack(track, updateUI);
        }

        // audio tracks
        var audioTrackCount = sequence.audioTracks.length;
        for (var i = 0; i < audioTrackCount; ++i) {
            var track = sequence.audioTracks[i];
            this.unselectAllClipsOnTrack(track, updateUI);
        }
    },


    unselectAllClipsOnTrack: function(track, updateUI) {
        // note we tell premiere not to bother updating visuall
        var numItems = track.clips.numItems;
        for (var i = 0; i < numItems; i++) {
            // add items from this clip to sequence item list
            var clip = track.clips[i];
            if (clip.isSelected()) {
                clip.setSelected(0, updateUI);
            }
        }
    },


    soloTargetTrackOnSequence: function(sequence, trackIndex, updateUI, flagTargetAudio) {
        // untarget all audio and video tracks except the video track mentioned
        // video tracks
        var videoTrackCount = sequence.videoTracks.length;
        for (var i = 0; i < videoTrackCount; ++i) {
            var track = sequence.videoTracks[i];
            if (i == trackIndex) {
                track.setTargeted(1, updateUI);
            } else {
                track.setTargeted(0, updateUI);
            }
        }

        // audio tracks
        var audioTrackCount = sequence.audioTracks.length;
        for (var i = 0; i < audioTrackCount; ++i) {
            var track = sequence.audioTracks[i];
            if (flagTargetAudio && i == trackIndex) {
                track.setTargeted(1, updateUI);
            } else {
                track.setTargeted(0, updateUI);
            }
        }
    },


    targetV1A1: function(sequence) {
        var updateUI = true;
        //
        // target first audio and video stracks
        var videoTrackCount = sequence.videoTracks.length;
        for (var i = 0; i < videoTrackCount; ++i) {
            var track = sequence.videoTracks[i];
            if (i == 0) {
                track.setTargeted(1, updateUI);
            } else {
                track.setTargeted(0, updateUI);
            }
        }
        // audio tracks
        var audioTrackCount = sequence.audioTracks.length;
        for (var i = 0; i < audioTrackCount; ++i) {
            var track = sequence.audioTracks[i];
            if (i == 0) {
                track.setTargeted(1, updateUI);
            } else {
                track.setTargeted(0, updateUI);
            }
        }
    },


    shiftAllClipsOnSequenceByTicks: function(sequence, ticks) {
        if (ticks==0) {
            // nothing to do
            return;
        }
        // move all items on all tracks
        var videoTrackCount = sequence.videoTracks.length;
        for (var i = 0; i < videoTrackCount; ++i) {
            var track = sequence.videoTracks[i];
            this.shiftAllClipsOnTrackByTicks(track, ticks);
        }

        // audio tracks
        var audioTrackCount = sequence.audioTracks.length;
        for (var i = 0; i < audioTrackCount; ++i) {
            var track = sequence.audioTracks[i];
            this.shiftAllClipsOnTrackByTicks(track, ticks);
        }
    },


    shiftAllClipsOnTrackByTicks: function(track, offsetAsTicks) {
        // we may need to go backward to not have them go on top of each other

        var numItems = track.clips.numItems;
        var startIndex, endIndex, stepIndex;

        // make sure we walk in direction suitable that the moves clips dont land on subequence ones
        if (offsetAsTicks>0) {
            startIndex = numItems-1;
            endIndex = -1;
            stepIndex = -1;
        } else {
            startIndex = 0;
            endIndex = numItems;
            stepIndex = 1;
        }

        for (var i = startIndex; i != endIndex; i+=stepIndex) {
            // add items from this clip to sequence item list
            var clip = track.clips[i];
            var newStartTime = this.makeOffsetTimeFromTime(clip.start, offsetAsTicks);
            var newEndTime = this.makeOffsetTimeFromTime(clip.end, offsetAsTicks);
            clip.start = newStartTime;
            clip.end = newEndTime;

            // ATTN: THERE SEEMS TO BE A BUG (?) with move in that we should have to move each clip but it fixes ALL after the first clip move, and susbsequents seem to do bad thing
            // so now we change clip start and end times manually.
        }
    },


    makeOffsetTimeFromTime: function(curTime, offsetAsTicks) {
        var offsetAsSeconds = this.jrConvertTicksToSeconds(offsetAsTicks);
        var offsetTime = new Time();
        var timeTicks = this.jrConvertTicksToNumeric(curTime.ticks);
        var timeSeconds = curTime.seconds;
        var newTimeTicks = timeTicks + offsetAsTicks;
        var newTimeSeconds = timeSeconds + offsetAsSeconds;
        offsetTime.ticks = newTimeTicks.toString();
        offsetTime.seconds = newTimeSeconds;
        return offsetTime;
    },


    makeTimeFromTicks: function(offsetAsTicks) {
        var offsetAsSeconds = this.jrConvertTicksToSeconds(offsetAsTicks);
        var offsetTime = new Time();
        offsetTime.ticks = offsetAsTicks.toString();
        offsetTime.seconds = offsetAsSeconds;
        return offsetTime;
    },



    findFirstClipItemOnTrack: function(track) {
        // just the first (and should be only) clip on the video track
        // ATTN: though note that if we have a JOINED video from multiple source we could have more than one -- check and complain
        var numItems = track.clips.numItems;
        if (numItems==0) {
            return undefined;
        }
        return track.clips[0];
    },


    findFirstVideoClipInSequence: function(sequence) {
        var videoTrackCount = sequence.videoTracks.length;
        for (var i = 0; i < videoTrackCount; ++i) {
            var track = sequence.videoTracks[i];
            if (track.clips.numItems>0) {
                return track.clips[0];
            }
        }
        return undefined;
    },


    getClipListInSequenceWithTracks: function(sequence) {
        var clipList = [];
        var clipTrackList = [];
        var videoTrackCount = sequence.videoTracks.length;
        for (var i = 0; i < videoTrackCount; ++i) {
            var track = sequence.videoTracks[i];
            if (track.clips.numItems>0) {
                for (j=0; j<track.clips.numItems; ++j) {
                    var clip = track.clips[j];
                    clipList.push(clip);
                    clipTrackList.push(i);
                }
            }
        }
        return {
            clipList: clipList,
            clipTrackList: clipTrackList
        }
    },
    //---------------------------------------------------------------------------


    //---------------------------------------------------------------------------
    customizeEffectForAllClipsOnSequence: function (sequence, effectName, effectOptions) {
        var retv = this.getClipListInSequenceWithTracks(sequence);
        var clipList = retv.clipList;
        var clipTrackList = retv.clipTrackList;
        //
        for (var i = 0; i<clipList.length;++i) {
            var clip = clipList[i];
            this.customizeEffectForClip(clip, effectName, effectOptions);
        }
    },
    //---------------------------------------------------------------------------


    //---------------------------------------------------------------------------
    customizeEffectForClip: function(clip, effectName, effectOptions) {
        var success = false;
        var flagDebug = false;

        // walk components of clip
        var components = clip.components;
        var numItems = components.numItems;
        //var numItems = components.length;
        for (var i = 0; i<numItems; i++){
            var component = components[i];
            var displayName = component.displayName;
            if (flagDebug) {
                $.jrutils.consolelog("Looking at qe item component named: " + displayName);
            }
            if ( displayName == effectName) {
                // found it now walk properties
                var properties = component.properties;
                var numProps = properties.numItems;
                var blankIndex = 0;
                for (var j = 0; j<numProps; j++){
                    var prop = properties[j];
                    var propDisplayName = prop.displayName;
                    if (propDisplayName == "") {
                        propDisplayName = "_" + (++blankIndex).toString();
                    }
                    var pval = prop.getValue();
                    if (flagDebug) {
                        $.jrutils.consolelog("   P: " + propDisplayName + " = '" + pval + "' is type: " + typeof pval);
                    }
                    var opval = effectOptions[propDisplayName];
                    if (opval !== undefined) {
                        // set it!
                        if (typeof opval == "string" && opval.length==7 && opval[0]=="#") {
                            // setting color
                            var colorAlpha = parseInt("FF", 16);
                            var colorRed = parseInt(opval.substr(1,2), 16);
                            var colorGreen = parseInt(opval.substr(3,2), 16);
                            var colorBlue = parseInt(opval.substr(5,2), 16);
                            prop.setColorValue(colorAlpha, colorRed, colorGreen, colorBlue, 0);
                        } else {
                            //prop.setValue(opval, 0);
                            prop.setValue(opval, 1);
                        }
                        if (flagDebug) {
                            // reget it to test
                            pval = prop.getValue();
                            $.jrutils.consolelog("  NP: " + propDisplayName + " = " + pval + " should have set to " + opval.toString());
                            //$.jrutils.consolelog("  methods: " + propDisplayName + " = '" + prop.reflect.methods);
                        }
                        //
                        success = true;
                    }
                }
            } else {
                if (flagDebug) {
                    var properties = component.properties;
                    var numProps = properties.numItems;
                    var blankIndex = 0;
                    for (var j = 0; j<numProps; j++){
                        var prop = properties[j];
                        var propDisplayName = prop.displayName;
                        if (propDisplayName == "") {
                            propDisplayName = "_" + (++blankIndex).toString();
                        }
                        var pval = prop.getValue();
                        if (flagDebug) {
                            $.jrutils.consolelog("   P: " + propDisplayName + " = '" + pval + "'");
                        }
                    }
                }
            }
        }
        return success;
    },
    //---------------------------------------------------------------------------



    //---------------------------------------------------------------------------
    guessNewlyClonedSequence: function(sequence) {
        // we've just cloned a sequence, adobe wont give us a reference easily so we have to guess it

        // we MIGHT be able to just guess its the last sequence
        var oldSequenceName = sequence.name;
        var searchName = oldSequenceName + " Copy";
        //
        // walk all project sequences backward
        var projectSequences = app.project.sequences;
        var numSequences = projectSequences.numSequences;
        for (var i = numSequences-1; i >=0 ; --i) {
            var seq = projectSequences[i];
            var seqname = seq.name;
            //if (seqname != searchName && $.jrutils.jrStringStartsWith(seqname, searchName)) {
            if ($.jrutils.jrStringStartsWith(seqname, searchName)) {
                // found it
                return seq;
            }
        }
        // not found
        return undefined;
    },
    //---------------------------------------------------------------------------



    //---------------------------------------------------------------------------
    findParentProjectItemUnderRoot: function(projItem) {
        return this.findParentProjectItemUnderProjectItem(projItem, app.project.rootItem);
    },

    findParentProjectItemUnderProjectItem: function(projItem, parentItem) {
        var pnodeId = projItem.nodeId;
        var numChildren = parentItem.children.numItems;
        for (var i = 0; i < numChildren; i++) {
			var curChild = parentItem.children[i];
            if (curChild.nodeId == pnodeId) {
                return parentItem;
            }
            if (curChild.children && curChild.children.numItems>0) {
                // recursive search
                var retv = this.findParentProjectItemUnderProjectItem(projItem, curChild);
                if (retv) {
                    return retv;
                }
            }
		}
        // not found
        return undefined;
    },


    findMatchingBinNameUnderRoot: function(name) {
        return this.findMatchingBinNameUnderProjectItem(name, app.project.rootItem);
    },

    findMatchingBinNameUnderProjectItem: function(name, parentItem) {
        var numChildren = parentItem.children.numItems;
        for (var i = 0; i < numChildren; i++) {
			var curChild = parentItem.children[i];
            if (curChild.name == name) {
                return curChild;
            }
            if (curChild.children && curChild.children.numItems>0) {
                // recursive search
                var retv = this.findMatchingBinNameUnderProjectItem(name, curChild);
                if (retv) {
                    return retv;
                }
            }
		}
        // not found
        return undefined;
    },


    uniqueifyProjectItemName: function(baseName) {
        var maxtries = 200;
        for (var i=1;i<maxtries;++i) {
            var tryName = baseName;
            if (i>1) {
                tryName += i.toString();
            }
            var existingItem = $.jrcep.findMatchingBinNameUnderRoot(tryName);
            if (!existingItem) {
                // found an unused one
                return tryName;
            }
        }
        // couldn't find an unused one
        return undefined;
    },
    //---------------------------------------------------------------------------


    //---------------------------------------------------------------------------
    deleteAllCipsOnTrack: function(track) {
        var numItems = track.clips.numItems;
        for (var i = numItems-1; i >= 0; i--) {
            // add items from this clip to sequence item list
            var clip = track.clips[i];
            clip.remove(0,0);
        }
    },
    //---------------------------------------------------------------------------



    //---------------------------------------------------------------------------
    insertClipIntoSequenceSplittingItMoveEverythingOver: function(sequence, clipProjectItem, targetTime, targetVideoTrackIndex) {
        // one tricky thing here is that we will have to "insert" it on every video track and then DELETE it from all but the one we care about
        // ATTN: UNFINISHED: premiere bug during insert moves markers in sequence around.. we might try to fix this up later
        var retclip;
        var videoinsertionCounts = 0;

        // first insert it on ALL tracks
        var videoTrackCount = sequence.videoTracks.length;
        for (var i = 0; i < videoTrackCount; ++i) {
            var track = sequence.videoTracks[i];
            if (track.clips.numItems==0) {
                continue;
            }
            // insert it IFF there are items on the track
            var retv = track.insertClip(clipProjectItem, targetTime);
            ++videoinsertionCounts;
            //
            // delete it if we should
            var clip = this.findClipOnTrackAtStartTime(track, targetTime, clipProjectItem);
            if (i != targetVideoTrackIndex) {
                // delete it
                if (clip) {
                    clip.remove(0,0);
                }
            } else {
                // remember this for returning
                retclip = clip;
            }
        }

        // delete it from matchine audio tracks which get auto inserted; we ASSUME A1 matches to V1 etc
        var audioTrackCount = sequence.audioTracks.length;
        for (var i = 0; i < audioTrackCount; ++i) {
            var track = sequence.audioTracks[i];
            if (track.clips.numItems==0) {
                continue;
            }
            var clip = this.findClipOnTrackAtStartTime(track, targetTime, clipProjectItem);
            if (i != targetVideoTrackIndex) {
                /// delete from here if found
                if (clip) {
                    clip.remove(0,0);
                }
            }
        }

        var fixupMarkers = true;
        if (fixupMarkers) {
            // ATTN: UNFINISHED - bug kludge of adobe premiere workaround
            // move all markers occuring >= our targetTime left N times (videoinsertionCounts)
        }

        //
        return retclip;
    },


    findClipOnTrackAtStartTime: function(track, targetTime, targetProjectItem) {
        var numItems = track.clips.numItems;
        for (var i = 0; i < numItems; i++) {
            // add items from this clip to sequence item list
            var clip = track.clips[i];
            if (targetTime.ticks == clip.start.ticks) {
                if (clip.projectItem && targetProjectItem.nodeId == clip.projectItem.nodeId)
                return clip;
            }
        }
        // not found
        return undefined;
    },


    findClipOnTrackAtEndTime: function(track, targetTime, targetProjectItem) {
        var numItems = track.clips.numItems;
        for (var i = 0; i < numItems; i++) {
            // add items from this clip to sequence item list
            var clip = track.clips[i];
            if (targetTime.ticks == clip.end.ticks) {
                if (targetProjectItem === undefined || (clip.projectItem && targetProjectItem.nodeId == clip.projectItem.nodeId))
                return clip;
            }
        }
        // not found
        return undefined;
    },




    overwriteClipIntoSequenceVideoOnly: function(sequence, clipProjectItem, targetTime, targetVideoTrackIndex) {

        // first insert it onto our track
        var track = sequence.videoTracks[targetVideoTrackIndex];
        // overwrite it onto track
        var retv = track.overwriteClip(clipProjectItem, targetTime);

        // find it
        var retclip = this.findClipOnTrackAtStartTime(track, targetTime, clipProjectItem);

        // remove from audio track
        track = sequence.audioTracks[targetVideoTrackIndex];
        var clip = this.findClipOnTrackAtStartTime(track, targetTime, clipProjectItem);
        if (clip) {
            clip.remove(0,0);
        }

        return retclip;
    },
    //---------------------------------------------------------------------------






    //---------------------------------------------------------------------------
    shortenClipToTicks: function(clip, ticks) {
        var newEndTime = this.makeOffsetTimeFromTime(clip.start, ticks);
        clip.end = newEndTime;
    },

    offsetInPointTicksofClip: function(clip, ticks) {
        var newStartTime = this.makeOffsetTimeFromTime(clip.start, ticks);
        //var newEndTime = this.makeOffsetTimeFromTime(clip.end, -1*ticks);
        //clip.end = newEndTime;
        clip.start = newStartTime;
        clip.inPoint = this.makeTimeFromTicks(ticks);
    },


    addFrameHoldAfterClip: function(track, clip, ticks, freezeFrameProjectItem) {
        // ok this is a bit tricky, but we can do it

        // premiere wont let us just make a new clip like this unfortunately
        var clipProjectItem = clip.projectItem;
        // our new hold frame clip will start where previous one ends
        var newClipStartTime = clip.end;
        // it's IN time will be the out time of previou
        var newClipInPoint = clip.outPoint;
        // our out point shoudl be our in point since we are held
        var newClipOutPoint = clip.outPoint;
        // our end time is plus ticks
        var newClipEndPoint = this.makeOffsetTimeFromTime(clip.start, ticks);;


        // just extend our existing clip
        var oldEndTime = clip.end;
        var newEndTime = this.makeOffsetTimeFromTime(clip.end, ticks);
        clip.end = newEndTime;

        // and now SPLIT it by overwriting with new temp sequence? no this does not work
        /*
        var newSeq = app.project.createNewSequence("tempHelper","tempHelperId");
        // overwrite sequence on top of our clip
        var retv = track.overwriteClip(newSeq.projectItem, oldEndTime);
        */


        var freezeClip;
        if (true) {
            freezeFrameProjectItem
            // insert it
            var retv = track.overwriteClip(freezeFrameProjectItem, oldEndTime);
            // find it
            freezeClip = this.findClipOnTrackAtStartTime(track, oldEndTime, freezeFrameProjectItem);
        }

        /*
        if (false) {
            // test, using existing still that MUST have short duration
            // how about we SAVE a still image into project, and then insert that in
            var freezeFrameProjectItem = this.jrLookupProjectItemByName("FreezeFrame.jpg");
            // insert it
            var retv = track.overwriteClip(freezeFrameProjectItem, oldEndTime);
            // find it
            freezeClip = this.findClipOnTrackAtStartTime(track, oldEndTime, freezeFrameProjectItem);
        } else {
            // can we try to make it dynamically from video
            //var freezeFrameProjectItem = clip.projectItem.createSubClip(clip.name + "_freezeFrame", clip.inPoint, clip.outPoint, 0, 0, 0);
            //var freezeFrameProjectItem = clip.projectItem.createSubClip(clip.name + "_freezeFrame", clip.outPoint, clip.outPoint, 0, 0, 0);
            // find it
            freezeClip = this.findClipOnTrackAtStartTime(track, oldEndTime, freezeFrameProjectItem);
        }
        */



        // set duration
        freezeClip.end = this.makeOffsetTimeFromTime(freezeClip.start, ticks);

    
        // now lets see if we can get the split main clip that should have been created
        var newMainBadClip = this.findClipOnTrackAtEndTime(track, newEndTime, clip.projectItem);
        if (newMainBadClip) {
            newMainBadClip.remove(0,0);
        }

        return freezeClip;
    },
    //---------------------------------------------------------------------------



    //---------------------------------------------------------------------------
    takeStillAtPlayheadAddToProject: function (basefname) {
        // ok take a still and save it somewhere good

        app.enableQE();
		var qeactiveSequence = qe.project.getActiveSequence(); // note: make sure a sequence is active in PPro UI
        var activeSequence = $.jrcep.jrCalcActiveSequence();

        var baseThumbnailDirName = "ArtEtc"
        var parentBinName = "ArtEtc";
    
        var thumbnailDir = $.jrcep.jrCalcProjectDirectory() + $.jrutils.adobeGetSep() + baseThumbnailDirName;
        //var outFileBasename = $.jrcep.jrCalcProjectFileBaseName() + "_" + basefname;
        var outFileBasename = basefname;
        var extension = "png";
        var outfname = outFileBasename + "." + extension;
        var thumbnailPath = thumbnailDir + $.jrutils.adobeGetSep() + outfname;

        // delete the file if it exists!


        // make target directory if doesn't exist
        if (!$.jrutils.jrFolderExists(thumbnailDir)) {
            var bretv = $.jrutils.jrMakeFolder(thumbnailDir);
            if (!bretv) {
                return "ERROR: Faied to create subdirectory (" + thumbnailDir + ").";
            }
            // sleep for a bit
            $.sleep(500);
        }
    
        var time = qeactiveSequence.CTI.timecode; 
        var retv = qeactiveSequence.exportFramePNG(time, thumbnailPath);
        if (!retv) {
            // failed.  sleep a bit?
            $.sleep(500);
            retv = qeactiveSequence.exportFramePNG(time, thumbnailPath);
            if (!retv) {
                return "ERROR: Failed to save freezeframe still to " + thumbnailPath;
            }
        }
        // sleep a bit?
        $.jrutils.sleepForNewFileAccess(thumbnailPath);

        // ok we saved it now we want to IMPORT it
        var parentBin = $.jrcep.findParentProjectItemUnderRoot(activeSequence.projectItem);
        var targetBin = this.findMatchingBinNameUnderRoot(parentBinName);
        if (!targetBin) {
            // create it
            var retv = parentBin.createBin(parentBinName);
            // now stupid adobe makes us manually find it
            targetBin = $.jrcep.findMatchingBinNameUnderRoot(parentBinName);
        }
        if (!targetBin) {
            return "ERROR: Failed to create bin to hold freezeframe named " + parentBinName;
        }

        // now DELTE it if it already exists !
        var projectItemExpectedName = outfname;
        this.jrRenameProjectItems(targetBin, projectItemExpectedName, "Old_" + projectItemExpectedName);

        // import the thumbnail
        // ATTN: I think this was failing due to file not being ready so we sleep a bit
        $.jrutils.sleepForNewFileAccess(thumbnailPath);
        //
        var suppressWarnings = false;
        var retv = app.project.importFiles([thumbnailPath], suppressWarnings, targetBin, false);
        if (!retv) {
            $.jrutils.sleepForNewFileAccess(thumbnailPath);
            retv = app.project.importFiles([thumbnailPath], suppressWarnings, targetBin, false);
            if (!retv) {
                return "ERROR: Failed to import still image " + thumbnailPath + " to bin " + targetBin.name + ".";
            }
        }

        // ok we added it

        // find it
        var freezeFrameProjectItem = $.jrcep.jrLookupProjectItemUnderProjectItemByName(targetBin, projectItemExpectedName);
        if (!freezeFrameProjectItem) {
            return "ERROR: Failed to find imported still image " + thumbnailPath + " in bin " + targetBin.name + " with name " + projectItemExpectedName + ".";
        }

        // set duration to essentially 0 by default?
        freezeFrameProjectItem.setInPoint("0",4);
        freezeFrameProjectItem.setOutPoint("0",4);

        // return it
        return freezeFrameProjectItem;
    },
    //---------------------------------------------------------------------------


    //---------------------------------------------------------------------------
    bugFixKludgeShiftedTimers: function(startTimeTicks, sequence, offsetTicks) {
        var markers = sequence.markers;
        if (!markers) {
            return undefined;
        }
        var numMarkers = markers.numMarkers;
        if (numMarkers == 0) {
            return undefined;
        }

        var currentMarker = markers.getFirstMarker()
        for (var i = 0; i < numMarkers; ++i) {
            var markerStartTime = this.jrConvertTicksToNumeric(currentMarker.start.ticks);
            if (markerStartTime > startTimeTicks) {
                var newStart = this.makeOffsetTimeFromTime(currentMarker.start, offsetTicks);
                var newEnd = this.makeOffsetTimeFromTime(currentMarker.end, offsetTicks);
                //$.jrutils.consolelog(currentMarker.reflect.methods);
                // note how marker setting is not consistent with other time settings -- almost gave up on this
                // see https://community.adobe.com/t5/premiere-pro-discussions/setting-a-marker-duration/m-p/6886989
                currentMarker.start = newStart.seconds;
                currentMarker.end = newEnd.seconds;

            }
            // advance to next marker
            currentMarker = markers.getNextMarker(currentMarker);
            if (!currentMarker) {
                // this should never happen
                break;
            }
        }
    },
    //---------------------------------------------------------------------------


    //---------------------------------------------------------------------------
    ensureMinimumVideoTrackCound: function(sequence, minTrackCount) {
        var videoTrackCount = sequence.videoTracks.length;
        if (videoTrackCount < minTrackCount) {
            var numTracksToAdd = minTrackCount - videoTrackCount;
            var track = $.jrqe.makeNewVideoTrackReturnItNonQe(sequence, videoTrackCount, numTracksToAdd);
        }
    },


    ensureEmptyTargetVideoTrackReturnIndex: function(sequence) {
        var videoTrackCount = sequence.videoTracks.length;
        for (var i =0; i<videoTrackCount; ++i) {
            // check out the last track
            var track = sequence.videoTracks[i];
            if (track.clips.numItems==0) {
                // it's empty, just return it
                return i;
            }
        }
        // not empty need to add one
        var track = $.jrqe.makeNewVideoTrackReturnItNonQe(sequence, videoTrackCount, 1);
        return videoTrackCount;
    },
    //---------------------------------------------------------------------------









    //---------------------------------------------------------------------------
    getClipsOnLowestNonMutedAudioTrack: function(sequence) {
        var clipList = [];

        var audioTrackCount = sequence.audioTracks.length;
        for (var i = 0; i < audioTrackCount; ++i) {
            var track = sequence.audioTracks[i];
            if (track.isMuted()) {
                continue;
            }
            var numItems = track.clips.numItems;
            for (var j=0; j<numItems; ++j) {
                var clip = track.clips[j];
                clipList.push(clip);
                }
            if (clipList.length>0) {
                break;
            }
        }
        return clipList;
    },
    //---------------------------------------------------------------------------



    //---------------------------------------------------------------------------
    addSequenceListVideoTracksToSequence: function (sequenceList, sequence) {
        for (var i = 0; i<sequenceList.length;++i) {
            var seq = sequenceList[i];        
            if (seq==null) {
                continue;
            }
            // add track
            $.jrqe.makeSomeNewTracksAtEnd(sequence, 1, 0);
            // add to last track
            var projectItem = seq.projectItem;
            var numTracks = sequence.videoTracks.length;
            var targetTrackNum = numTracks - 1;
            var targetTrack = sequence.videoTracks[targetTrackNum];
            targetTrack.insertClip(projectItem, 0);
            // mute audio track
            var audioTrack = sequence.audioTracks[targetTrackNum];
            audioTrack.setMute(1);
        }
    },
    //---------------------------------------------------------------------------





    //---------------------------------------------------------------------------
    getSelectedClip: function(sequence) {
        var videoTrackCount = sequence.videoTracks.length;
        for (var i =0; i<videoTrackCount; ++i) {
            // check out the last track
            var track = sequence.videoTracks[i];
            if (track.isMuted()) {
                continue;
            }
            var numItems = track.clips.numItems;
            for (var j=0; j<numItems; ++j) {
                var clip = track.clips[j];
                if (clip.isSelected()) {
                    return clip;
                }
            }
        }
    return null;
    },



    getClipAtTimeline: function(sequence) {
        // get time
        var qesequence = $.jrqe.forceActiveSequenceGetActiveSequenceQe(sequence);
        if (!qesequence) {
            return null;
        }
        var playheadPosTicks = qesequence.CTI.ticks;

        var videoTrackCount = sequence.videoTracks.length;
        for (var i =0; i<videoTrackCount; ++i) {
            // check out the last track
            var track = sequence.videoTracks[i];
            if (track.isMuted()) {
                continue;
            }
            var numItems = track.clips.numItems;
            for (var j=0; j<numItems; ++j) {
                var clip = track.clips[j];
                var startTicks = $.jrcep.jrConvertTicksToNumeric(clip.start.ticks);
                var endTicks = $.jrcep.jrConvertTicksToNumeric(clip.end.ticks);
                if (startTicks <= playheadPosTicks && endTicks >= playheadPosTicks) {
                    return clip;
                }
            }
        }
    return null;
    },


    selectOnlyClip: function(sequence, targetClip, flagForceRe) {
        // clear all selections except the specified clip
        var videoTrackCount = sequence.videoTracks.length;
        for (var i =0; i<videoTrackCount; ++i) {
            // check out the last track
            var track = sequence.videoTracks[i];
            var numItems = track.clips.numItems;
            for (var j=0; j<numItems; ++j) {
                var clip = track.clips[j];
                if (clip.nodeId == targetClip.nodeId) {
                    if (flagForceRe) {
                        clip.setSelected(0,1);                        
                    }
                    clip.setSelected(1,1);
                } else if (clip.isSelected()) {
                    clip.setSelected(0,1);
                }
            }
        }
    },


    getCurrentClipOnSequence: function(sequence, flagTryGetSelected, flagDoSelect) {
        // get SELECTED clip if there is one
        var clip;
        if (flagTryGetSelected) {
            clip = $.jrcep.getSelectedClip(sequence);
        }
        // 
        if (!clip) {
            clip = $.jrcep.getClipAtTimeline(sequence);
            if (clip && flagDoSelect) {
                $.jrcep.selectOnlyClip(sequence, clip, false);
            }
        }

        return clip;
    },



    getClipFromTrackAtTime: function (trackList, posTicks) {
        var trackCount = trackList.length;
        for (var i =0; i<trackCount; ++i) {
            // check out the last track
            var track = trackList[i];
            if (track.isMuted()) {
                continue;
            }
            var numItems = track.clips.numItems;
            for (var j=0; j<numItems; ++j) {
                var clip = track.clips[j];
                var startTicks = $.jrcep.jrConvertTicksToNumeric(clip.start.ticks);
                var endTicks = $.jrcep.jrConvertTicksToNumeric(clip.end.ticks);
                if (startTicks <= posTicks && endTicks >= posTicks) {
                    return clip;
                }
            }
        }
        return null;
    },

    //---------------------------------------------------------------------------




    //---------------------------------------------------------------------------
    getClipProperty: function (clip, cname, pname) {
        // walk components of clip
        var debug = false;
        var components = clip.components;
        var numItems = components.numItems;
        for (var i = 0; i < numItems; i++) {
            var component = components[i];
            var compDisplayname = component.displayName;
            if (debug) {
                $.jrutils.consolelog("compDisplayname: " + compDisplayname);
            }
            if (compDisplayname == cname) {
                var properties = component.properties;
                var numProps = properties.numItems;
                var blankIndex = 0;
                for (var j = 0; j < numProps; j++) {
                    var prop = properties[j];
                    var propDisplayName = prop.displayName;
                    if (propDisplayName == "") {
                        propDisplayName = "_" + (++blankIndex).toString();
                    }
                    if (debug) {
                        $.jrutils.consolelog("propDisplayName: " + propDisplayName);
                    }
                    if (propDisplayName == pname) {
                        return prop;
                    }
                }
            }
        }
        return null;
    },
    //---------------------------------------------------------------------------



    //---------------------------------------------------------------------------
    reselectCurrentClip: function() {
        // get active sequence
        var sequence = $.jrcep.jrCalcActiveSequence();
        if (!sequence) {
            return null;
        }
        var clip = $.jrcep.getCurrentClipOnSequence(sequence, false, true);
        if (!clip) {
            return null;
        }

        $.jrcep.selectOnlyClip(sequence, clip, true);
    },
    //---------------------------------------------------------------------------











    
    //---------------------------------------------------------------------------


    addMogrtAtTime: function(sequence, mogrtId, posTicks, videoTrackIndex, audioTrackIndex) {
        // from ppro sample
        var mogrtFsName = mogrtId;
        var newTrackItem 	= sequence.importMGT(	mogrtFsName, $.jrcep.jrConvertTicksToSeconds(posTicks), videoTrackIndex, audioTrackIndex);        
        //var moComp = newTrackItem.getMGTComponent();
        return newTrackItem;
    }
    //---------------------------------------------------------------------------




};
