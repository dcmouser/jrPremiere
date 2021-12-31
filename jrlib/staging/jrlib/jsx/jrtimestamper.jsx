// main functions that do the complicated work of extracting timestamp items

////@include "jrceputils.jsx"

$.jrts = {

    //---------------------------------------------------------------------------
    jrReBuildAllSequenceTimeStamps: function () {
        // iterate all sequences and build recurive list of all items
        // first we create our master associative array (dict) of sequences
        this.jrResetGlobalSequenceTimeStampData();

        // ok now begin resolving them recursively
        return this.jrRecursivelyResolveAllSequences(this.jrGetGlobalTimeStampData());
    },
    //---------------------------------------------------------------------------


    //---------------------------------------------------------------------------
    jrResetGlobalSequenceTimeStampData: function () {
        var sequenceData = $.jrtshelpers.jrGetGlobalTimeStampDataBuildIfNeeded();
        this.jrClearTimeStampSequenceData(sequenceData);
        return sequenceData;
    },
    //---------------------------------------------------------------------------




    //---------------------------------------------------------------------------
    // global app specific stuff

    jrGetGlobalLastScannedSequenceId: function () {
        return $.jrutils.jrGetGlobal("lastScannedSequenceId");
    },

    jrSetGlobalLastScannedSequenceId: function (val) {
        return $.jrutils.jrSetGlobal("lastScannedSequenceId", val);
    },
    //---------------------------------------------------------------------------



    //---------------------------------------------------------------------------
    jrClearTimeStampSequenceData: function (sequenceData) {
        sequenceData.keys = [];
        sequenceData.resolvedKeys = [];
        sequenceData.seqs = {};
        return sequenceData;
    },
    //---------------------------------------------------------------------------




    //---------------------------------------------------------------------------
    jrReDiscoverProjectSequences: function (sequenceData) {
        sequenceData.keys = [];
        var projectSequences = app.project.sequences;
        for (var i = 0; i < projectSequences.numSequences; ++i) {
            var seq = projectSequences[i];
            var seqid = $.jrcep.jrGetSequenceIdFromSequence(seq);
            if (seqid == undefined) {
                // weird, why does this happen -- it seems some IMAGES are passed as sequences??
                //consolelog("Skipping adding sequence because id could not be determined: " + seq.name + " with seqid = " + seq.sequenceID);
                continue;
            }
            sequenceData.keys.push(seqid);
        }
    },
    //---------------------------------------------------------------------------




    //---------------------------------------------------------------------------
    jrRecursivelyResolveAllSequences: function (sequenceData) {
        // first discover all known sequences
        this.jrReDiscoverProjectSequences(sequenceData);
        // now walk and do every sequence
        for (var i = 0; i < sequenceData.keys.length; i++) {
            var seqid = sequenceData.keys[i];
            //consolelog("Studying sequence " + seqid);
            this.jrRecursivelyResolveSequenceIfNeeded(sequenceData, seqid);
        }
        return sequenceData;
    },



    jrIsWorkingSequence: function (sequenceData, seqid) {
        // make sure its a seqence we know about
        return $.jrutils.jrArrayContains(sequenceData.keys, seqid);
    },

    jrIsResolvedSequence: function (sequenceData, seqid) {
        // have we already resolved this sequence?
        return $.jrutils.jrArrayContains(sequenceData.resolvedKeys, seqid);
    },
    //---------------------------------------------------------------------------
















    //---------------------------------------------------------------------------
    jrRecursivelyResolveSequenceIfNeeded: function (sequenceData, seqid) {
        if (this.jrIsResolvedSequence(sequenceData, seqid)) {
            // already resolved nothing to do
            return;
        }

        // now we also check if its not yet finished being resolved but in the process, in which case we have a circular loop we want to avoid
        if (sequenceData.seqs[seqid] !== undefined) {
            // circular reference, skip it
            return;
        }

        // resolve it
        this.jrRecursivelyResolveSequence(sequenceData, seqid);
    },


    jrRecursivelyResolveSequence: function (sequenceData, seqid) {
        // resolve the specified sequence

        // if its not in our keys list (it was added since then?) then we might as well add it
        if (!$.jrutils.jrArrayContains(sequenceData.keys, seqid)) {
            sequenceData.keys.push(seqid)
        }

        // first look it up from adobe
        // ATTN: because recursive calls happen in while we are doing operations below, we need to keep RE-GETTING this as it changes 
        sequence = $.jrcep.jrLookupSequnceById(seqid);
        var flagRegetSequenceReference = true;

        if (!sequence) {
            $.jrutils.consolelog("ERROR UNFOUND SEQUENCE:");
            $.jrutils.consolelog(seqid);
        }

        if (sequence.name == "Seq2") {
            var debugbreak = true;
            var debugbreak = debugbreak && true;
        }

        // initialize the sequence item list
        sequenceData.seqs[seqid] = {
            "seqinfo": {
                "id": sequence.id,
                "name": sequence.name,
                "sequenceId": sequence.sequenceId,
                "cachedNestedMarkerIds": [],
                "type": "sequence",
            },
            "items": [],
        };

        // walk the sequence and create timestamp entries for it, recursively evaluation interior sequences if nesc.
        var videoTrackCount = sequence.videoTracks.length;
        var audioTrackCount = sequence.audioTracks.length;

        // walk video tracks
        for (var i = 0; i < videoTrackCount; ++i) {
            if (flagRegetSequenceReference) {
                // ATTN: because recursive calls happen in process track, perhaps we need to "re-get" sequence by id
                sequence = $.jrcep.jrLookupSequnceById(seqid);
            }
            var track = sequence.videoTracks[i];
            this.jrStudyProcessTrack(sequenceData, seqid, track, 1, "video", i);
        }

        // walk audio tracks
        for (var i = 0; i < audioTrackCount; ++i) {
            if (flagRegetSequenceReference) {
                // ATTN: because recursive calls happen in process track, perhaps we need to "re-get" sequence by id
                sequence = $.jrcep.jrLookupSequnceById(seqid);
            }
            var track = sequence.audioTracks[i];
            this.jrStudyProcessTrack(sequenceData, seqid, track, 2, "audio", i);
        }

        if (flagRegetSequenceReference) {
            // ATTN: because recursive calls happen in process track, perhaps we need to "re-get" sequence by id
            sequence = $.jrcep.jrLookupSequnceById(seqid);
        }

        // walk markers
        this.jrStudyProcessMarkersFromSequence(sequence, sequenceData, seqid, 3, "seq");

        if (flagRegetSequenceReference) {
            // ATTN: because recursive calls happen in process track, perhaps we need to "re-get" sequence by id
            sequence = $.jrcep.jrLookupSequnceById(seqid);
        }

        // now SORT the timestamps
        this.jrSortSequenceItemsByTime(sequence, sequenceData, seqid);

        // mark the sequence has RESOLVED
        if (!$.jrutils.jrArrayContains(sequenceData.resolvedKeys, seqid)) {
            sequenceData.resolvedKeys.push(seqid)
        }
    },
    //---------------------------------------------------------------------------






    //---------------------------------------------------------------------------
    jrSortSequenceItemsByTime: function (sequence, sequenceData, seqid) {
        sequenceData.seqs[seqid].items.sort(function (a, b) {
            if (a.startTicks > b.startTicks) {
                return 1;
            }
            if (a.startTicks < b.startTicks) {
                return -1;
            }
            // same time
            if (a.priority > b.priority) {
                return 1;
            }
            if (a.priority < b.priority) {
                return -1;
            }
            // fall back on id?
            if (a.id > b.id) {
                return 1;
            }
            if (a.id == b.id) {
                return 0;
            }
            return -1;
        });
    },
    //---------------------------------------------------------------------------
































































    //---------------------------------------------------------------------------
    jrStudyProcessTrack: function (sequenceData, seqid, track, priority, trackTypeName, trackNum) {
        // if its muted track we skip it, yeah?
        var flagProcessEvenMutedTracks = false;
        if (track.isMuted() && !flagProcessEvenMutedTracks) {
            return;
        }


        // walk all children clips on track
        var numItems = track.clips.numItems;
        for (var i = 0; i < numItems; i++) {
            // add items from this clip to sequence item list
            var clip = track.clips[i];
            this.jrStudyProcessTrackClip(clip, i, sequenceData, seqid, track, priority, trackTypeName, trackNum);
        }
    },
    //---------------------------------------------------------------------------



    //---------------------------------------------------------------------------
    jrStudyProcessTrackClip: function (clip, index, sequenceData, seqid, track, priority, trackTypeName, trackNum) {
        // empty?
        if ((!clip) || (clip.type == 'Empty')) {
            return;
        }

        // name and id
        var name = clip.name;
        var nodeId = clip.nodeId;
        var projectId = (clip.projectItem ? clip.projectItem.nodeId : null);

        // start creating item
        var id = "S" + seqid + "." + trackTypeName + "#" + trackNum.toString() + "." + index.toString() + "." + nodeId;
        var item = {
            "id": id,
            "name": name,
            "sid": seqid,
            "oticks": $.jrcep.jrConvertTicksToNumeric(clip.start.ticks),
            //
            "startTicks": $.jrcep.jrConvertTicksToNumeric(clip.start.ticks),
            "endTicks": $.jrcep.jrConvertTicksToNumeric(clip.end.ticks),
            "startSeconds": $.jrcep.jrConvertTicksToSeconds(clip.start.ticks),
            "endSeconds": $.jrcep.jrConvertTicksToSeconds(clip.end.ticks),
            "inPointTicks": $.jrcep.jrConvertTicksToNumeric(clip.inPoint.ticks),
            "outPointTicks": $.jrcep.jrConvertTicksToNumeric(clip.outPoint.ticks),
            //
            "nodeId": nodeId,
            "projectId": projectId,
            "priority": priority,
            "itype": trackTypeName,
            //"type": clip.type,
            //
            "trackNum": trackNum,
        };

        // project stuff
        var projItem = clip.projectItem;
        var pname = "";
        var ppath = "";
        var pextension = "";
        var ptype = undefined;
        if (projItem) {
            // name and path
            ppath = projItem.treePath;
            var pos = ppath.lastIndexOf(".");
            if (pos > -1) {
                pextension = ppath.substr((pos + 1), 3);
            }
            pname = projItem.name;
            if (pname.lastIndexOf(".") == -1 && pextension != "") {
                pname += "." + pextension;
            }
            ptype = projItem.type;
            //
            item["pnodeId"] = projItem.nodeId;
            item["pTreePath"] = projItem.treePath;
            item["ptype"] = ptype;

            // we would like to understand the nature of VIDEO media clips, they should be image, video, mogrt
            if (trackTypeName == "video" && !projItem.isSequence()) {
                // we can decide now whether this clip has (IS) a graphic as opposed to a video file
                item["mediaType"] = $.jrcep.jrCalculateMediaTypeFromProjectItem(projItem, item);
                if (item["mediaType"] == "image") {
                    item["hasGraphic"] = true;
                    item["isNonTrivial"] = true;
                } else if (item["mediaType"] == "mogrt") {
                    item["hasMogrt"] = true;
                    item["isNonTrivial"] = true;
                }
            }

        }
        //
        item["pname"] = pname;
        item["ppath"] = ppath;
        item["pextension"] = pextension;

        // now look inside this clip for components and properties
        this.jrStudyProcessTrackClipContents(clip, item);

        // add the item
        sequenceData.seqs[seqid].items.push(item);

        // now recurse into nested sequnce clips
        var flagDoRecurse = true;
        if (flagDoRecurse && ptype == ProjectItemType.CLIP) {
            var subsequncepnodeid = item["pnodeId"];
            var isKnownSequence = this.jrIsWorkingSequence(sequenceData, subsequncepnodeid);

            if (!isKnownSequence) {
                // its NOT a known sequence, look for clip master makers instead; if we find master clip markers (or indeed master clip mogrts if such a thing is possible?) then we can treat this clip like a virtual sequence
                var flagAddMasterClipMakers = true;
                if (flagAddMasterClipMakers) {
                    var clipMarkers = projItem.getMarkers();
                    if (clipMarkers && clipMarkers.numMarkers > 0) {
                        // ok this master clip has markers.. we would like to add it like a subsequence
                        //alert("Master clip markers!");
                        // if we add some, then we set isKnownSequence true and drop down to recurse into it
                        var bretv = this.jrResolveClipItemMasterClipAsVirtualSequence(sequenceData, subsequncepnodeid, projItem);
                        // we could just set this true, but we could also just recalculate it now that its added
                        isKnownSequence = this.jrIsWorkingSequence(sequenceData, subsequncepnodeid);
                    }
                }
            }

            if (isKnownSequence) {
                // ok we know about this sequence.
                // now incorporate it
                this.jrPullSubsequenceIntoSequenceItems(sequenceData, subsequncepnodeid, seqid, item.startTicks, item.inPointTicks, item.outPointTicks, trackTypeName);
            }
        }
    },



    jrResolveClipItemMasterClipAsVirtualSequence: function (sequenceData, pnodeid, projItem) {
        // add master clip as if it was a virtual sequence, with inner markers
        var markers = projItem.getMarkers();
        if (!markers || markers.numMarkers == 0) {
            // no point, since there is nothing to add
            return false;
        }

        // ok
        // now we also check if its not yet finished being resolved but in the process, in which case we have a circular loop we want to avoid
        if (sequenceData.seqs[pnodeid] !== undefined) {
            // circular reference, skip it
            return;
        }

        // if its not in our keys list (it was added since then?) then we might as well add it
        if (!$.jrutils.jrArrayContains(sequenceData.keys, pnodeid)) {
            sequenceData.keys.push(pnodeid)
        }

        // initialize the sequence item list
        sequenceData.seqs[pnodeid] = {
            "seqinfo": {
                "id": pnodeid,
                "name": projItem.name,
                "sequenceId": pnodeid,
                "cachedNestedMarkerIds": [],
                "type": "masterclip",
            },
            "items": [],
        };

        // walk master clip markers
        this.jrStudyProcessMarkers(markers, sequenceData, pnodeid, 3, "clip");

        // now SORT the timestamps
        this.jrSortSequenceItemsByTime(sequence, sequenceData, pnodeid);

        // mark the sequence has RESOLVED
        if (!$.jrutils.jrArrayContains(sequenceData.resolvedKeys, pnodeid)) {
            sequenceData.resolvedKeys.push(pnodeid)
        }

        return true;
    },




    jrPullSubsequenceIntoSequenceItems: function (sequenceData, subsequncepnodeid, seqid, clipStartTicks, clipInPointTicks, clipOutPointTicks, trackTypeName) {
        // now there are TWO options
        // 1. the subsequence is RESOLVED, in which case we can just transfer/copy into items into this sequence
        // 2. the subsequence is NOT yet compolete, so we need to do that first

        // SO: resolve it if needed first
        //consolelog("jrPullSubsequenceIntoSequenceItems "+seqid +" and sub = "+subsequncepnodeid);
        this.jrRecursivelyResolveSequenceIfNeeded(sequenceData, subsequncepnodeid);

        // now walk all items for the subsequence and DEEPCOPY over those within the in and out points
        // and adjust timestamps to be relative to OUR seqeunce
        var sequenceItems = sequenceData.seqs[seqid].items;
        var subsequenceItems = sequenceData.seqs[subsequncepnodeid].items;
        for (var i = 0; i < subsequenceItems.length; ++i) {
            var item = subsequenceItems[i];

            // restrict to certain types
            var itype = item.itype;
            if (itype == "marker") {
                // markers nest in both audio and video tracks, which is tricky
                var debugbreak = true;
            } else if (itype != trackTypeName) {
                // wrong type of item, skip it
                continue;
            }


            // first thing to check is if it is out of our range
            var startTicks = item.startTicks;
            var endTicks = item.endTicks;
            // check if this item is TOTALLY OUTSIDE our bounds
            if (clipInPointTicks > endTicks) {
                // we dont start using this subsequence yet, so SKIP this item
                continue;
            }
            if (clipOutPointTicks < startTicks) {
                // we stopped using this subsequnce before this item even starts
                // we could break now i think - IFF the items are all always SORTED(!)
                // break;
                continue;
            }
            //
            // we might also exclude it if it even BEGINS outside out starint time
            var flagExcludeEarlyStarters = true;
            if (flagExcludeEarlyStarters) {
                if (startTicks < clipInPointTicks) {
                    // this item may continue INTO our subsequence range, but it started beforehand so we dont care about it
                    continue;
                }
            }
            //
            // we might also exclude it if it spans the ENTIRE range (and its not trivial)
            var flagExcludeSimpleSpanners = true;
            if (flagExcludeSimpleSpanners) {
                if (startTicks <= clipInPointTicks && endTicks >= clipOutPointTicks && !item.isNonTrivial) {
                    // this nesteditem covers the ENTIRE range of us, and contains no mogrt, so why bother
                    continue;
                }
            }


            // check for duplicative marker, added from audio or video track
            var markerCachedId;
            if (itype == "marker") {
                // IF its a marker, we need to check we didnt add it on a prevoius nested audio/video merge
                // we need a different way to ensure we don't duplicatively add marker items
                // make an id based on unique guid of marker, AND the timestamp of where we will put it; no reason to ever have 2 at same place
                markerCachedId = item.guid + "@" + (clipStartTicks + (item.startTicks - clipInPointTicks)).toString();
                if (this.jrSequenceItemsContainCachedMarker(sequenceData, seqid, markerCachedId)) {
                    // already got it
                    continue;
                }
            }

            // ok we want it

            // ok make a DEEP copy/clone of the item
            var copiedItem = $.jrutils.jrMakeJsonDeepCopyOfObject(item);

            // now modify its timestamps to be RELATIVE to us, the outer clip
            copiedItem.startTicks = clipStartTicks + (copiedItem.startTicks - clipInPointTicks);
            copiedItem.endTicks = clipStartTicks + (copiedItem.endTicks - clipInPointTicks);
            copiedItem.startSeconds = $.jrcep.jrConvertTicksToSeconds(copiedItem.startTicks);
            copiedItem.endSeconds = $.jrcep.jrConvertTicksToSeconds(copiedItem.endTicks);

            // keep track of source for debugging
            if (copiedItem.source) {
                copiedItem.source = subsequncepnodeid + "/" + copiedItem.source;
            } else {
                copiedItem.source = subsequncepnodeid;
            }
            //
            var subsequnceName = sequenceData.seqs[subsequncepnodeid].seqinfo.name;
            if (copiedItem.sourceName) {
                copiedItem.sourceName = subsequnceName + "/" + copiedItem.sourceName;
            } else {
                copiedItem.sourceName = subsequnceName;
            }

            // now add it
            sequenceItems.push(copiedItem);

            // for markers we need to keep track if we have seen it before
            if (itype == "marker") {
                this.jrSequenceItemsAddCachedMarker(sequenceData, seqid, markerCachedId);
            }
        }
    },








    jrStudyProcessTrackClipContents: function (clip, item) {
        //
        // now walk components -> properties -> parameters

        var iproperties = []
        var iextraproperties = [];
        var flagSaveAllProperties = $.jrts.getIsDebugDataEnabled();
        //
        var nonSpecialFxCdisplayNames = ["Graphic Parameters", "Motion", "Text", "Shape", "Opacity", "Volume", "Channel Volume", "Vector Motion", "Clip"];
        //
        // we use a tag called "isNonTrivial" set to true when this is not just a pure audio/video clip; we use this to avoid skipping subsequences that are pure clips that span a subsequnce [see jrPullSubsequenceIntoSequenceItems()]

        // walk components
        var ci;
        var numComponents = clip.components.length;
        var hasSpecialFx = false;
        var specialFxList = [];

        // debugging
        if (numComponents > 0) {
            item["components"] = [];
        }

        for (ci = 0; ci < numComponents; ++ci) {
            var component = clip.components[ci];
            if (!component) {
                continue;
            }

            var cdisplayname = component.displayName;
            item["components"].push(cdisplayname);


            // special fx tracking
            //$.jrutils.consolelog("ATTN: DEBUG - Examining component: " + cdisplayname);
            if (!$.jrutils.jrArrayContains(nonSpecialFxCdisplayNames, cdisplayname)) {
                hasSpecialFx = true;
                specialFxList.push(cdisplayname);
            }
            // check zoom != 100
            if (cdisplayname == "Motion") {
                var properties = component.properties;
                var numProperties = properties.numItems;
                for (var pi = 0; pi < numProperties; ++pi) {
                    // param to process
                    var param = properties[pi];
                    var pdisplayName = param.displayName;
                    //$.jrutils.consolelog("Motion param '" + pdisplayName +"'.");
                    if (pdisplayName == "Scale") {
                        // get value
                        var pval = properties.getParamForDisplayName(pdisplayName);
                        var val = pval.getValue();
                        //var oline = cdisplayname + ": " + pdisplayName + " (" + (typeof val) + "): " + $.jrutils.jstringify(val);
                        //$.jrutils.consolelog(oline);
                        if (val != 100) {
                            hasSpecialFx = true;
                            specialFxList.push("Motion.Scale=" + val.toString());
                        }
                    }
                }
            }


            //
            if (cdisplayname == "Graphic Parameters" /*|| cdisplayname == "Motion"*/ || cdisplayname == "Text") {

                // keep track if the item has certain components/properties
                if (cdisplayname == "Graphic Parameters") {
                    item["hasMogrt"] = true;
                    item["isNonTrivial"] = true;
                }
                if (cdisplayname == "Text") {
                    item["hasText"] = true;
                    item["isNonTrivial"] = true;
                }
                // what about a pure image -- how to detect and set "hasGraphic"

                // walk properties of the compoonent
                var properties = component.properties;
                var numProperties = properties.numItems;
                for (var pi = 0; pi < numProperties; ++pi) {

                    // param to process
                    var param = properties[pi];
                    var pdisplayName = param.displayName;

                    // get value
                    var pval = properties.getParamForDisplayName(pdisplayName);
                    var val = pval.getValue();

                    // any conversions
                    var jval;
                    if (typeof val == "string") {
                        // lets see if its json string
                        // old way when value returned as json string
                        if (val == "") {
                            // this can happen on Source Text properties which are not yet supported so they are blank
                            //consolelog("Got an empty parameter: " + pname);
                            jval = "";
                        } else {
                            try {
                                jval = JSON.parse(val);
                            } catch (e) {
                                // fall back to original
                                jval = val;
                            }
                        }
                    } else {
                        jval = val;
                    }

                    var jvaltype = typeof jval;

                    // uncomment to showdebug all parameters
                    //var oline = cdisplayname + ": " + "P" + pi.toString() + " " + pdisplayName + " (" + jvaltype + "): " + $.jrutils.jstringify(jval);
                    //$.jrutils.consolelog(oline);

                    // add EXTRA parsed properties of mogrts are worth recording
                    if (jvaltype == "object") {
                        if (jval.textEditValue) {
                            var extraProperty = {
                                "pname": pdisplayName,
                                "value": jval.textEditValue,
                            };
                            iextraproperties.push(extraProperty);
                        }
                    }

                    if (pdisplayName == "Source Text" && jvaltype == "string") {
                        // source text is special, can we grab it somehow
                        // see https://community.adobe.com/t5/premiere-pro/mogrt-getvalue-returns-json-in-extendscript/m-p/11899740/highlight/true
                        // this doesn't return the full text
                        var stext = val;
                        var extraProperty = {
                            "pname": pdisplayName,
                            "value": (stext.length > 2) ? stext : "n/a", // bug in adobe api cant read full text
                        };
                        // add it
                        iextraproperties.push(extraProperty);
                    }

                    // save it ALL for debugging
                    if (flagSaveAllProperties) {
                        var property = {
                            "pname": pdisplayName,
                            "value": val,
                        };
                        iproperties.push(property);
                    }
                }
            }
        }

        // add properties and extras to item
        if (iproperties.length > 0) {
            item["props"] = iproperties;
        }
        if (iextraproperties.length > 0) {
            item["eprops"] = iextraproperties;
        }

        // save specialfx list
        if (hasSpecialFx) {
            item["hasSpecialFx"] = true;
            item["specialFxList"] = specialFxList;
        }
    },
    //---------------------------------------------------------------------------








    //---------------------------------------------------------------------------
    jrSequenceItemsContainCachedMarker: function (sequenceData, seqid, markerCachedId) {
        return $.jrutils.jrArrayContains(sequenceData.seqs[seqid].seqinfo.cachedNestedMarkerIds, markerCachedId);
    },


    jrSequenceItemsAddCachedMarker: function (sequenceData, seqid, markerCachedId) {
        if (!$.jrutils.jrArrayContains(sequenceData.seqs[seqid].seqinfo.cachedNestedMarkerIds, markerCachedId)) {
            sequenceData.seqs[seqid].seqinfo.cachedNestedMarkerIds.push(markerCachedId);
        }
    },
    //---------------------------------------------------------------------------





























    //---------------------------------------------------------------------------
    jrStudyProcessMarkersFromSequence: function (sequence, sequenceData, seqid, priority, markerSubtype) {
        var markers = sequence.markers;
        return this.jrStudyProcessMarkers(sequence.markers, sequenceData, seqid, priority, markerSubtype);
    },



    jrStudyProcessMarkers: function (markers, sequenceData, seqid, priority, markerSubtype) {
        if (!markers) {
            return 0;
        }
        var numMarkers = markers.numMarkers;
        if (numMarkers == 0) {
            return 0;
        }

        var currentMarker = markers.getFirstMarker()
        for (var i = 0; i < numMarkers; ++i) {
            this.jrStudyProcessOneMarker(sequenceData, seqid, currentMarker, i, priority, markerSubtype);
            // advance to next marker
            currentMarker = markers.getNextMarker(currentMarker);
            if (!currentMarker) {
                // this should never happen
                break;
            }
        }
    },




    jrStudyProcessOneMarker: function (sequenceData, seqid, marker, index, priority, markerSubtype) {
        // add it
        var id = "Marker#" + seqid + "." + index.toString();
        var item = {
            "id": id,
            "sid": seqid,
            "oticks": $.jrcep.jrConvertTicksToNumeric(marker.start.ticks),
            "name": marker.name,
            "guid": marker.guid,
            "startTicks": $.jrcep.jrConvertTicksToNumeric(marker.start.ticks),
            "endTicks": $.jrcep.jrConvertTicksToNumeric(marker.end.ticks),
            "startSeconds": $.jrcep.jrConvertTicksToSeconds(marker.start.ticks),
            "endSeconds": $.jrcep.jrConvertTicksToSeconds(marker.end.ticks),
            "type": marker.type,
            "colorIndex": marker.getColorByIndex(),
            "comments": marker.comments,
            "priority": priority,
            "itype": "marker",
            "markerstype": markerSubtype,
        };

        // add the item
        sequenceData.seqs[seqid].items.push(item);
    },
    //---------------------------------------------------------------------------




    //---------------------------------------------------------------------------
    getIsDebugDataEnabled: function () {
        return $.jrutils.jrGetGlobal("options").saveDebugInfo;
    },
    //---------------------------------------------------------------------------



};