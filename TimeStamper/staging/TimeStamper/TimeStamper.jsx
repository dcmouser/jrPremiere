// mouser@donationcoder.com


//---------------------------------------------------------------------------
// generic
// tiny loader that will load other jsx files into adobe cep namespace
#include "./../com.dc.jrlib/jsx/ext.jsx"

//ATTN: I believe this is useful to the visual studio code debugger..
//@include "./../com.dc.jrlib/jsx/jrceputils.jsx"
//@include "./../com.dc.jrlib/jsx/jrqe.jsx"
//@include "./../com.dc.jrlib/jsx/jrutils.jsx"
//@include "./../com.dc.jrlib/jsx/jrtimestamper.jsx"
//@include "./../com.dc.jrlib/jsx/jrtimestamphelpers.jsx"
//---------------------------------------------------------------------------


//---------------------------------------------------------------------------
// app specific
//@include "./jsx/jrtimestamputils.jsx"
//---------------------------------------------------------------------------










//---------------------------------------------------------------------------
// create the functions that can be invoked from js
// exposed functions intended to be callable from the panel index html/js, just make normal calls into our functions
// note the extreme lengths we have to go to in order to avoid global namespace clashing
//
function setupCallablesTimeStamper(uniqueAppId) {
	// create global callables and an entry for us under our uniqueid
	if ($._jrcallables === undefined) {
		$._jrcallables = {};
	}
	$._jrcallables[uniqueAppId] = {

		// app specific overrides
		doInitializeExtension: function () {
			// extension specific init
			return $.jrtsu.jrInitializeExtensionTimeStamper();
		},
		debug: function () {
			// NOTE: we can use "this." to refer to another function within this object
			//alert(this.testFunc());
			return $.jrtsu.jrDebugTimeStamper();
		},

		// app added implementations
		doReExtractTimeStampsForActiveSequence: function () {
			return $.jrtsu.jrClearAllAndExtractTimeStampsFromActiveSequence(false);
		},
		doRefreshTimeStampsForActiveSequence: function () {
			return $.jrtsu.jrExtractTimeStampsFromActiveSequence();
		},
		doSaveActiveSequenceToFile: function () {
			return $.jrtsu.jrExtractTimeStampsFromActiveSequenceAndSave();
		},
	}

	// now add some common helpers
	$.jrcep.jrAddCommonCepCallables($._jrcallables[uniqueAppId]);
}
//---------------------------------------------------------------------------


