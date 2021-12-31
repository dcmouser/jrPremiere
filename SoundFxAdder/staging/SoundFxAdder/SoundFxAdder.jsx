// mouser@donationcoder.com


//---------------------------------------------------------------------------
// generic
// tiny loader that will load other jsx files into adobe cep namespace
#include "./../jrlib/jsx/ext.jsx"

//ATTN: I believe this is useful to the visual studio code debugger..
//@include "./../jrlib/jsx/jrceputils.jsx"
//@include "./../jrlib/jsx/jrqe.jsx"
//@include "./../jrlib/jsx/jrutils.jsx"
//@include "./../jrlib/jsx/jrtimestamper.jsx"
//@include "./../jrlib/jsx/jrtimestamphelpers.jsx"
//---------------------------------------------------------------------------


//---------------------------------------------------------------------------
// app specific
//@include "jsx/jrsoundfxutils.jsx"
//---------------------------------------------------------------------------










//---------------------------------------------------------------------------
// create the functions that can be invoked from js
// exposed functions intended to be callable from the panel index html/js, just make normal calls into our functions
// note the extreme lengths we have to go to in order to avoid global namespace clashing
//
function setupCallablesSoundFxAdder(uniqueAppId) {
	// create global callables and an entry for us under our uniqueid
	if ($._jrcallables === undefined) {
		$._jrcallables = {};
	}
	$._jrcallables[uniqueAppId] = {

		// app specific overrides
		doInitializeExtension: function () {
			// extension specific init
			return $.jrsfx.jrInitializeExtensionSoundFxAdder();
		},
		debug: function () {
			return $.jrsfx.jrDebugSoundFxAdder();
		},


		// app added implementations
		doProcessActiveSequenceFind: function () {
			return $.jrsfx.jrProcessActiveSequenceFind();
		},
		doProcessActiveSequenceAddAll: function () {
			return $.jrsfx.jrProcessActiveSequenceAddAll();
		},
		addToItem: function (jlink) {
			return $.jrsfx.jrProcessAddToItemJsoned(jlink);
		},
	};

	// now add some common helpers
	$.jrcep.jrAddCommonCepCallables($._jrcallables[uniqueAppId]);
}
//---------------------------------------------------------------------------


