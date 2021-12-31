// mouser@donationcoder.com


//---------------------------------------------------------------------------
// generic
// tiny loader that will load other jsx files into adobe cep namespace
#include "./../jrlib/jsx/ext.jsx"

//ATTN: I believe this is useful to the visual studio code debugger..
//@include "./../jrlib/jsx/jrceputils.jsx"
//@include "./../jrlib/jsx/jrqe.jsx"
//@include "./../jrlib/jsx/jrutils.jsx"
//
//@include "./../jrlib/jsx/jrkeyframes.jsx"
//---------------------------------------------------------------------------


//---------------------------------------------------------------------------
// app specific
//@include "./jsx/jrcftutils.jsx"
//---------------------------------------------------------------------------










//---------------------------------------------------------------------------
// create the functions that can be invoked from js
// exposed functions intended to be callable from the panel index html/js, just make normal calls into our functions
// note the extreme lengths we have to go to in order to avoid global namespace clashing
//
function setupCallablesCft(uniqueAppId) {
	// create global callables and an entry for us under our uniqueid
	if ($._jrcallables === undefined) {
		$._jrcallables = {};
	}
	$._jrcallables[uniqueAppId] = {

		// app specific overrides
		doInitializeExtension: function () {
			// extension specific init
			return $.jrcft.jrInitializeExtensionCft();
		},
		debug: function () {
			return $.jrcft.jrDebugCft();
		},


		// app added implementations
		doProcessMediaExport: function () {
			return $.jrcft.jrDoProcessMediaExport();
		},
		doProcessThumbnailExport: function (flatImportToProject) {
			return $.jrcft.jrDoProcessThumbnailExport(flatImportToProject);
		},
		doProcessSavePlusVersion: function () {
			return $.jrcft.jrDoProcessSavePlusVersion();
		},
		//
		doInsertIntro: function() {
			return $.jrcft.doInsertIntro();
		},
		doAddSoundProcessing: function() {
			return $.jrcft.doAddSoundProcessing();
		},
		doOpenProjectFolder: function() {
			return $.jrcft.doOpenProjectFolder();
		},
		//
		doAddCensorBleep: function() {
			return $.jrcft.doAddCensorBleep();
		}
	};

	// now add some common helpers
	$.jrcep.jrAddCommonCepCallables($._jrcallables[uniqueAppId]);
}
//---------------------------------------------------------------------------


