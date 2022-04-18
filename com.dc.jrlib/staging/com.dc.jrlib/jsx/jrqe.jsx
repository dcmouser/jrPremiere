// cep qe related helpers

////@include "jrutils.jsx"

$.jrqe = {


    jrGoSourceMonitorLocation: function (ticks, projItem) {

        // there is currently no way to do this without kludge using qe method
        // see https://community.adobe.com/t5/premiere-pro-discussions/setting-source-playhead-position-without-app-enableqe/td-p/11089263

        var fallbackQeScrubMethod = true;
        if (fallbackQeScrubMethod) {
            app.enableQE();
            // scrub source monitor to timecode  
            qe.source.player.startScrubbing();

            // ATTN; scrub wants seconds.frames (yuck)
            var scrubTimeString = $.jrcep.jrConvertProjectTicksToScrubTimeString(ticks, projItem);

            //alert("ATTN: scrubbing source monitor to posiition: "+scrubTimeString);
            qe.source.player.scrubTo(scrubTimeString);
            qe.source.player.endScrubbing();
            // stop qe? is there an efficiency cost to enabling it? there is no way to stop it once enabled
            //app.disableQE();
            return true;
        }
        return false;
    },


    /*
    // this is bugged since qe has no good way to loop over all sequences it seems..
    findQeSequenceFromNonQeSequence: function(nonQeSequence) {
        app.enableQE();
        var searchGuid = nonQeSequence.sequenceID;
        var numSequences =  qe.project.numSequences;
        for (var i = 0; i < numSequences; i++) {
            var seq = qe.project.getSequenceAt(i);
            var thisid = seq.guid;
            if (thisid === searchGuid){
                return seq;
            } 
        }
        return undefined;
    },
    */


    forceActiveSequenceGetActiveSequenceQe: function(nonQeSequence) {
        // force the sequence in timeline then return active qe sequence -- easier than above
        $.jrcep.jrSetActiveSequence(nonQeSequence);
        // now get active
        return qe.project.getActiveSequence();
    },


    getQeClipListInQeSequence: function(qeSequence, trackindex) {
        // for now lets assume always on first video track
        var qeClipList = [];

        var videoTrackCount = qeSequence.numVideoTracks;
        //var methods = qeSequence.reflect.methods;
        //$.jrutils.consolelog(methods);
        //methods = qe.reflect.methods;
        //$.jrutils.consolelog(methods);

        for (var i = 0; i < videoTrackCount; ++i) {
            if (trackindex !== i && trackindex !== undefined) {
                continue;
            }
            var qeTrack = qeSequence.getVideoTrackAt(i);
            var numItems = qeTrack.numItems;
            var itype;
            for (var j=0; j<numItems; ++j) {
                try {
                    itype = undefined;
                    var item = qeTrack.getItemAt(j);
                    itype = item.type;
                    //var itemstring = item.name;
                    //var itemstring = $.jrutils.jstringify(item);
                    //$.jrutils.consolelog(itemstring);
                    //$.jrutils.consolelog(itype);
                } catch (e) {
                    $.jrutils.consolelog("exception (skipping) trying to access qe track item "+j.toString());
                    continue;
                }
                // if its a clip then return it
                if (itype=="Clip") {
                    qeClipList.push(item);
                }
            }
        }

        // not found
        return qeClipList;
    },


    getQeClipsOnLowestNonMutedAudioTrack: function(qeSequence) {
        var qeClipList = [];

        var audioTrackCount = qeSequence.numAudioTracks;
        for (var i = 0; i < audioTrackCount; ++i) {
            var qeTrack = qeSequence.getAudioTrackAt(i);
            if (qeTrack.isMuted()) {
                continue;
            }
            var numItems = qeTrack.numItems;
            for (var j=0; j<numItems; ++j) {
                try {
                    itype = undefined;
                    var item = qeTrack.getItemAt(j);
                    itype = item.type;
                } catch (e) {
                    $.jrutils.consolelog("exception (skipping) trying to access qe track item "+j.toString());
                    continue;
                }
                // if its a clip then return it
                if (itype=="Clip") {
                    qeClipList.push(item);
                }
            }
            if (qeClipList.length>0) {
                break;
            }
        }
        return qeClipList;
    },


    findFirstQeVideoClipInQeSequence: function(qeSequence) {
        // for now lets assume always on first video track

        var videoTrackCount = qeSequence.numVideoTracks;
        for (var i = 0; i < videoTrackCount; ++i) {
            var qeTrack = qeSequence.getVideoTrackAt(i);
            var numItems = qeTrack.numItems;
            var itype;
            for (var j=0; j<numItems; ++j) {
                try {
                    itype = undefined;
                    var item = qeTrack.getItemAt(j);
                    itype = item.type;
                    //var itemstring = item.name;
                    //var itemstring = $.jrutils.jstringify(item);
                    //$.jrutils.consolelog(itemstring);
                    //$.jrutils.consolelog(itype);
                } catch (e) {
                    $.jrutils.consolelog("exception (skipping) trying to access qe track item "+j.toString());
                    continue;
                }
                // if its a clip then return it
                if (itype=="Clip") {
                    return item;
                }
            }
        }

        // not found
        return undefined;
    },


    findQeClipFromClip: function(clip, trackindex) {
        var name = clip.name;
        var startTicks = clip.start.ticks;
        var qesequence = qe.project.getActiveSequence();
        var qeClipList = this.getQeClipListInQeSequence(qesequence, trackindex);
        var numItems = qeClipList.length;
        for (var i=0; i<numItems; ++i) {
            var qeClip = qeClipList[i];
            var debugObj = $.jrutils.debugObj(qeClip);
            var qStartTicks = qeClip.start.ticks;
            var qname = qeClip.name;
            if (qname == clip.name && qStartTicks==startTicks) {
                // match
                return qeClip;
            }
        }
        return undefined;
    },


    getEffectByName: function(effectName) {
        var effect = qe.project.getVideoEffectByName(effectName); 
        if (!effect.name) {
            // it does this when it can't find it
            return undefined;
        }
        return effect;
    },

    getAudioEffectByName: function(effectName) {
        var effect = qe.project.getAudioEffectByName(effectName); 
        if (!effect.name) {
            // it does this when it can't find it
            return undefined;
        }
        return effect;
    },


    getVideoTransitiontByName: function(name) {
        var effect = qe.project.getVideoTransitionByName(name); 
        if (!effect.name) {
            // it does this when it can't find it
            var methods = qe.reflect.methods;
            $.jrutils.consolelog(methods);
            return undefined;
        }
        return effect;
    },


    makeNewVideoTrackReturnItNonQe: function(nonQeSequence, position, trackCount) {
        app.enableQE();
        // first force the sequence active
        this.forceActiveSequenceGetActiveSequenceQe(nonQeSequence);
        var sequence = qe.project.getActiveSequence();
        // now add 1 video track (audio will get added too)
        // IMPORTANT UNDOCUMENT TRICK I DISCOVERED -- pass the second 1 to put the new track ABOVE (instead of default below) the existing tracks
        sequence.addTracks(trackCount, position);
        // now we want to return it as NORMAL track
        // ATTN: this is a bit iffy..
        // test
        if (position == 1) {
            var bughappenshere = true;
        }
        return nonQeSequence.videoTracks[position];
    },


    makeSomeNewTrack: function(nonQeSequence, vidCountToadd, vidPosToInsert, audCountToAdd, audPosToInsert) {
        app.enableQE();
        // first force the sequence active
        this.forceActiveSequenceGetActiveSequenceQe(nonQeSequence);
        var sequence = qe.project.getActiveSequence();
        // num video to add
        // vid pos to inser
        // num audio to add
        // aud pos to insert
        //sequence.addTracks(vidCountToadd, vidPosToInsert, audCountToAdd, -1);
        // bug in adding audio positions so skip it
        //audCountToAdd = 0;
        mysteryParam = 1;
        sequence.addTracks(vidCountToadd, vidPosToInsert, audCountToAdd, mysteryParam, audPosToInsert);
    },

    makeSomeNewTracksAtEnd: function(nonQeSequence, vidCountToadd, audCountToAdd) {
        return this.makeSomeNewTrack(nonQeSequence, vidCountToadd, nonQeSequence.videoTracks.length, audCountToAdd, nonQeSequence.audioTracks.length);
    },


    removeEmptyTracks: function(nonQeSequence, flagVideo, flagAudio) {
        app.enableQE();
        // first force the sequence active
        this.forceActiveSequenceGetActiveSequenceQe(nonQeSequence);
        var sequence = qe.project.getActiveSequence();
        if (flagVideo) {
            sequence.removeEmptyVideoTracks();
        }
        if (flagAudio) {
            sequence.removeEmptyAudioTracks();
        }
    },


    removeAudioTrack: function(nonQeSequence, index) {
        app.enableQE();
        // first force the sequence active
        this.forceActiveSequenceGetActiveSequenceQe(nonQeSequence);
        var sequence = qe.project.getActiveSequence();
        sequence.removeAudioTrack(index);
    },





    applySoundEffectToAllClipsOnLowestNonMutedTrackOfActiveSequence: function(effectName, effectOptions) {

        // ATTN: TEST
        var flagTestCustomizeNoAdd = false;

        app.enableQE();
        var qesequence = qe.project.getActiveSequence();
        var activeSequence = $.jrcep.jrCalcActiveSequence();

        // get the audio effect
        var qeEffect = this.getAudioEffectByName(effectName);
        if (!qeEffect) {
            return "Required audio effect not found: "+effectName;
        }

        // get list of clips effected
        var qeClipList = this.getQeClipsOnLowestNonMutedAudioTrack(qesequence);
        var clipList = $.jrcep.getClipsOnLowestNonMutedAudioTrack(activeSequence);
        // sanity check
        if (qeClipList.length != clipList.length) {
            return "Mismatch in clip list counts ("+qeClipList.length.toString()+ " vs " + clipList.length.toString(); 
        }

        //
        var numItems = qeClipList.length;
        for (var i=0; i<numItems; ++i) {
            var qeClip = qeClipList[i];
            var clip = clipList[i];
            // add effect
            if (!flagTestCustomizeNoAdd) {
                retv = qeClip.addAudioEffect(qeEffect);
            }
            // customize it
            $.jrcep.customizeEffectForClip(clip, effectName, effectOptions);
        }

        return "";
    },



    //---------------------------------------------------------------------------
    playNonQeSequence: function (sequence, inPointTicks, outPointTicks, playbackSpeedMultiplier) {
        //sequence.stop();
        app.enableQE();
        var qeSequence = this.forceActiveSequenceGetActiveSequenceQe(sequence);
        var qeSequencePlayer = qeSequence.player;
        // not sure what args to pass to play
        qeSequencePlayer.stop();

        // position it
        sequence.setInPoint(inPointTicks.toString());
        sequence.setOutPoint(outPointTicks.toString());
        sequence.setPlayerPosition(inPointTicks.toString());
        //
        qeSequencePlayer.play(playbackSpeedMultiplier);
    },
    //---------------------------------------------------------------------------


    //---------------------------------------------------------------------------
    getCurrentPlayheadTimeAsTicks: function(sequence) {
        // get time
        var qesequence = this.forceActiveSequenceGetActiveSequenceQe(sequence);
        if (!qesequence) {
            return null;
        }
        var playheadPosTicks = qesequence.CTI.ticks;
        return playheadPosTicks;
    },
    //---------------------------------------------------------------------------





}