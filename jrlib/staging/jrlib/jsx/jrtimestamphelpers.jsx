// TimeStamper
// Adbe Premiere CEP Extendscript extension
// Helps you navigate your project deep into sequences, and creates YouTube timestamp listings for your videos
// 8/28/21 by mouser@donationcoder.com
//---------------------------------------------------------------------------


$.jrtshelpers = {


    //---------------------------------------------------------------------------
    // global app specific stuff

    jrGetGlobalTimeStampData: function () {
        return $.jrutils.jrGetGlobal("timeStampSequenceData");
    },

    jrSetGlobalTimeStampData: function (val) {
        return $.jrutils.jrSetGlobal("timeStampSequenceData", val);
    },


    jrGetGlobalTimeStampDataBuildIfNeeded: function () {
        var sequenceData = this.jrGetGlobalTimeStampData();
        if (sequenceData === undefined) {
            sequenceData = {};
            this.jrSetGlobalTimeStampData(sequenceData);
        };
        return sequenceData;
    },
    //---------------------------------------------------------------------------






    //---------------------------------------------------------------------------
    jrCalcDurationOfItem: function (item) {
        var startTicks = item.startTicks;
        var endTicks = item.endTicks;
        if (!endTicks || startTicks == endTicks) {
            return "";
        }
        var durTicks = endTicks - startTicks;
        var durString = $.jrcep.jrconvertAdobeTimeTicksToYoutubeFriendly(durTicks);
        return durString;
    },
    //---------------------------------------------------------------------------






    //---------------------------------------------------------------------------
    jrDoExtractTimeStampsFromActiveSequence: function() {
        //
        var seqid = $.jrcep.jrCalcActiveSequenceId();

        // don't rebuild if not needed
        var sequenceData = this.jrGetGlobalTimeStampDataBuildIfNeeded();

        // rediscover known sequences
        $.jrts.jrReDiscoverProjectSequences(sequenceData);

        // do extraction
        var resultObj = this.jrExtractTimeStampsFromSequence(seqid, sequenceData);

        // store that we processed this sequence id
        $.jrts.jrSetGlobalLastScannedSequenceId(seqid);

        // return it
        return resultObj;
    },
    //---------------------------------------------------------------------------



    //---------------------------------------------------------------------------
    jrExtractTimeStampsFromSequence: function (seqid, sequenceData) {
        var resultObj;

        if (sequenceData == undefined) {
            resultObj = $.jrcep.jrMakeErrorRequest("Global timestamp sequence data is not set.", false);
        } else if (seqid) {
            // resolve if needed
            $.jrts.jrReDiscoverProjectSequences(sequenceData);
            $.jrts.jrRecursivelyResolveSequenceIfNeeded(sequenceData, seqid);

            // return links for gui
            resultObj = this.jrGetTimeStampsFromSequenceForDisplay(seqid, sequenceData, $.jrutils.jrGetGlobalOptions());

        } else {
            resultObj = $.jrcep.jrMakeErrorRequestResultSequenceNotFound("active", false);
        }

        // return results
        return resultObj;
    },
    //---------------------------------------------------------------------------





    //---------------------------------------------------------------------------
    jrGetTimeStampsFromSequenceForDisplay: function (seqid, sequenceData, options) {
        // now link data for interactive panel timestamps
        var datalinks = this.jrMakeResultsList(seqid, sequenceData, options);

        // now built result obj
        var resultObj = {
            "datalinks": datalinks,
            "datalinksSummary": datalinks.length == 0 ? "<p>No timestamp items found (click 'options' above to adjust filter).</p>" : "",
        };

        // return results
        return resultObj;
    },
    //---------------------------------------------------------------------------


















    //---------------------------------------------------------------------------
    jrCopyAndRemovePropsFromItem: function (item) {
        var itemCopy = $.jrutils.jrMakeJsonDeepCopyOfObject(item);
        if (itemCopy.props) {
            //delete itemSimplified.props;
            itemCopy.props = undefined;
        }
        return itemCopy;
    },
    //---------------------------------------------------------------------------


    //---------------------------------------------------------------------------
    jrSimplifiedItemDetails: function (item, showCompact, showPath, showDuration) {
        var flagShowSomeItemTypes = false;

        var retstr = "";
        var itype = item.itype;
        var hitGoodVal = false;

        if (item.eprops) {
            var epropstr = "";
            for (var j = 0; j < item.eprops.length; ++j) {
                if (epropstr != "") {
                    epropstr += " | ";
                }
                var val = item.eprops[j].value;
                if (showCompact) {
                    epropstr += val;
                    if (val != "" && val != "n/a") {
                        hitGoodVal = true;
                    }
                } else {
                    epropstr += item.eprops[j].pname + " = " + val;
                    hitGoodVal = true;
                }
            }
            if (showCompact) {
                retstr += epropstr;
            } else {
                retstr += " [" + epropstr + "]";
            }
        }

        var dispName = item.name ? item.name : "n/a";

        // clarify generic Text Graphic name
        if (dispName == "Graphic" && item.hasText) {
            dispName = "Graphic/Text";
        }

        // path
        if (item.sourceName && showPath) {
            if (showCompact) {
                var optionSubPathLen = 10;
                dispName = $.jrutils.jrShortenPaths(item.sourceName, optionSubPathLen) + "/" + dispName;
            } else {
                dispName = item.sourceName + "/" + dispName;
            }
        }

        // decorations
        if (flagShowSomeItemTypes) {
            if (item.itype == "audio") {
                dispName += "(A)";
            }
        }

        if (itype == "marker") {
            // marker
            var flagDisplayMarkerColorIndex = false;
            if (dispName == "" || dispName == "n/a") {
                dispName = "Marker";
            }
            retstr = dispName + " (" + item.type + (flagDisplayMarkerColorIndex ? "." + item.colorIndex : "") + ")" + (item.comments ? " - " + item.comments : "") + " " + retstr;
            hitGoodVal = true;
        }
        else {
            if (retstr == "") {
                // just the name
                retstr = dispName;
            } else if (showCompact && !hitGoodVal) {
                // compact mode but the line is basically blank, so show display name even in compact mode
                retstr = dispName + " - " + retstr;
            } else if (!showCompact) {
                // full name and label
                retstr = dispName + retstr;
            }
        }

        if (showDuration) {
            // add duration to end
            var durstr = this.jrCalcDurationOfItem(item);
            if (durstr) {
                retstr += " - " + durstr;
            }
        }

        // replace newlines
        retstr = retstr.replace(/(?:\r\n|\r|\n)/g, '[\\n]');

        return retstr;
    },
    //---------------------------------------------------------------------------






















    //---------------------------------------------------------------------------
    jrMakeResultsList: function (seqid, sequenceData, options) {
        // important: see jrCleanDatalinkForClickEmbed() in jrindexHelpers for things that are cleaned from this when making gui clickable
        var datalinks = [];

        // get the items for this sequence
        var seqSection = sequenceData.seqs[seqid];
        var items = seqSection.items;
        var ilen = items.length;

        // options
        var showVideoClips = options["showVideoClips"];
        var showAudioClips = options["showAudioClips"];
        var showMarkers = options["showMarkers"];
        var showMogrt = options["showMogrt"];
        var showTextGraphics = options["showTextGraphics"];
        var showSpecialFx = options["showSpecialFx"];
        var showRecurse = options["showRecurse"];
        var showDuration = options["showDuration"];
        //
        var showMasterClipMarkersWithMarkers = true;
        //
        var showCompact = options["showCompact"];
        var showPath = options["showPath"];
        var flagNeverCombineItems = options["neverCombineItems"];
        //
        // filters
        var resultObj = this.jrProcessResolveWorkOptions(options);
        var optionReferences = resultObj.references;
        var mogrtInclusions = optionReferences.mogrtInclusions;
        var mogrtExclusions = optionReferences.mogrtExclusions;

        /*
        var useFilter = options["useFilter"];
        var filterItems = [];
        if (useFilter) {
            var filterText = options["filterText"];
            if (filterText && filterText != "*") {
                filterItems = filterText.split("|");
            }
        }
        */


        //
        var flagForceZeroItem = options["forceZeroItem"];
        //


        // 
        var workingItem = undefined;
        var workingLinestr = "";
        //
        var thislinestr = "";
        var prevlinestr = "";
        //
        var oitem;
        var item;
        var itype;
        var startTicks;
        var showitem;

        // walk (note that we go to <= ilen, as the last loop iteration is used to clean up)
        var linesout = 0;
        for (var i = 0; i <= ilen; ++i) {
            //alert("ATTN: " + i.toString() + " of "+ ilen.toString());
            if (i == ilen) {
                // this is our +1 of the index to force built up item to write out
                // just drop down
            } else {
                // here is a new item, do we want to include it in our output?
                oitem = items[i];
                item = this.jrCopyAndRemovePropsFromItem(oitem);
                itype = item.itype;
                startTicks = item.startTicks;

                // show this item?
                showitem = true;

                // first we turn OFF the showing of the items based on some basic checks
                // marker?
                if (itype == "marker") {
                    if (!showMarkers || (item.markerstype == "clip" && !showMasterClipMarkersWithMarkers)) {
                        showitem = false;
                    }
                }
                // video?
                if (!showVideoClips && itype == "video") {
                    // by default we wouldn't want to see this; at least if its just a plain video clip
                    // we will drop down and re-enable it if other conditions met
                    // ATTN: do we want to check non trivial?
                    if (true || !item.isNonTrivial || (!showTextGraphics && !showMogrt)) {
                        showitem = false;
                    }
                }

                // new 4/17/22 - default to not show non-trivial video clips unless enabled below due to being graphic or mogrt
                if (showVideoClips && itype == "video") {
                    // this may will be overriden and set to show below
                    if (item.isNonTrivial) {
                        showitem = false;
                    }
                }

                // audio?
                if (itype == "audio" && !showAudioClips) {
                    showitem = false;
                }

                // now some overrides to turn it back on
                // if it has features we care about then show it
                if (showTextGraphics && (item.hasGraphic || item.hasText)) {
                    showitem = true;
                }
                if (showMogrt && item.hasMogrt) {
                    showitem = true;
                }
                if (itype=="video" && showSpecialFx && item.hasSpecialFx) {
                    // show it
                    showitem = true;
                }

                // lastly some final force hide overrides

                // nested override to disable it
                if (!showRecurse && item.sourceName) {
                    showitem = false;
                }

                // filters to disable
                if (mogrtInclusions.length > 0 && showitem == true) {
                    // check if at least one filter matched
                    var filtMatched = false;
                    for (var f = 0; f < mogrtInclusions.length; ++f) {
                        var afiltpat = mogrtInclusions[f];
                        if ($.jrutils.jrMyPatternMatchesName(afiltpat, item.name)) {
                            // yes use it
                            filtMatched = true;
                            break;
                        }
                        if ($.jrutils.jrMyPatternMatchesName(afiltpat, item.comments)) {
                            // yes use it
                            filtMatched = true;
                            break;
                        }
                        if ($.jrutils.jrMyPatternMatchesName(afiltpat, item.type)) {
                            // yes use it
                            filtMatched = true;
                            break;
                        }
                        // match against properties?
                        if (item.eprops) {
                            for (var j = 0; j < item.eprops.length; ++j) {
                                var val = item.eprops[j].value;
                                if ($.jrutils.jrMyPatternMatchesName(afiltpat, val)) {
                                    // yes use it
                                    filtMatched = true;
                                    break;
                                }
                            }
                            if (filtMatched) {
                                // break out of outer loop
                                break;
                            }
                        }
                    }
                    if (!filtMatched) {
                        // no filters matched
                        showitem = false;
                    }
                }

                // exclusions
                if (mogrtExclusions.length > 0 && showitem == true) {
                    var filtMatched = false;
                    for (var f = 0; f < mogrtExclusions.length; ++f) {
                        var afiltpat = mogrtExclusions[f];
                        if ($.jrutils.jrMyPatternMatchesName(afiltpat, item.name)) {
                            // yes use it
                            filtMatched = true;
                            break;
                        }
                        if ($.jrutils.jrMyPatternMatchesName(afiltpat, item.type)) {
                            // yes use it
                            filtMatched = true;
                            break;
                        }
                        if ($.jrutils.jrMyPatternMatchesName(afiltpat, item.sourceName)) {
                            // yes use it
                            filtMatched = true;
                            break;
                        }
                    }
                    if (filtMatched) {
                        // no filters matched
                        showitem = false;
                    }
                }



                // now, do we want to see it or not?
                if (!showitem) {
                    continue;
                }

                thislinestr = this.jrSimplifiedItemDetails(item, showCompact, showPath, showDuration);
                if (!thislinestr) {
                    continue;
                }

                // add specialfx?
                if (showSpecialFx && item.hasSpecialFx) {
                    thislinestr += " [specialfx: " + item.specialFxList.join() + "]";
                }
            }

            // ok we are going to use this item

            if (workingItem) {
                // but first check that our first line out starts at 0 time
                if (flagForceZeroItem && linesout == 0 && workingItem.startTicks > 0) {
                    // create a 0 item
                    var ditem = {
                        "label": "00:00",
                        "text": "Start of video",
                        "ticks": 0,
                        "sid": seqid,
                        "oticks": 0,
                        "asid": seqid,
                    };
                    datalinks.push(ditem);
                    ++linesout;
                }

                // we are building one up
                if (i == ilen || startTicks != workingItem.startTicks || flagNeverCombineItems) {
                    // time changed so any pending built up linestr we want to display before continuing to this one
                    //
                    // make item and add it
                    var ditem = {
                        "label": $.jrcep.jrconvertAdobeTimeTicksToYoutubeFriendly(workingItem.startTicks),
                        "text": workingLinestr,
                        "ticks": workingItem.startTicks,
                        "eticks": workingItem.endTicks,
                        "sid": workingItem.sid,
                        "oticks": workingItem.oticks,
                        "asid": seqid,
                        "nodeId": workingItem.nodeId,
                        "projectId": workingItem.projectId,
                        "guid": workingItem.guid,
                        "itype": workingItem.itype,
                    };

                    // master clip marker is a bit odd we need to tell anyone trying to use this datalink to jump to the clip in source monitor
                    if (workingItem.itype == "marker" && workingItem.markerstype == "clip") {
                        ditem.goSource = true;
                    }
                    // add it
                    datalinks.push(ditem);
                    ++linesout;
                    // clear working item
                    workingItem = undefined;
                    workingLinestr = "";
                } else {
                    // we are just going to ADD to our current workingItem since the timestamps are identical
                    // just drop down
                }
            }

            if (i == ilen) {
                // all done
                break;
            }

            if (!workingItem) {
                // start working on new one
                workingItem = item;
                workingLinestr = thislinestr;
            } else {
                // add to existing
                if (thislinestr == prevlinestr) {
                    // no point adding dupicate lines
                } else {
                    workingLinestr += "; " + thislinestr;
                }
            }

            // remember last linestr
            prevlinestr = thislinestr;
        }

        return datalinks;
    },
    //---------------------------------------------------------------------------







        //---------------------------------------------------------------------------
        jrProcessResolveWorkOptions: function (options) {
            var errors = [];
            // inclusions and exclusions
            var mogrtInclusions = $.jrutils.parseOptionsFilter(options.mogrtInclusions, options.useFilterInclude);
            var mogrtExclusions = $.jrutils.parseOptionsFilter(options.mogrtExclusions, options.useFilterExclude);
            // results
            return {
                "references": {
                    "mogrtInclusions": mogrtInclusions,
                    "mogrtExclusions": mogrtExclusions,
                },
                "errors": errors,
            }
        },
        //---------------------------------------------------------------------------


    

};