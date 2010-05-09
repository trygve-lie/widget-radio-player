jQuery(document).ready(function(){

	// For performance.
	var jpPlayInfo = jQuery("#duration");


	jQuery("#player").jPlayer({
		ready: function () {
            this.element.jPlayer("setFile", "http://radio.hiof.no/nrk-p2-128", "http://radio.hiof.no/nrk-jazz-172.ogg");
		},
		nativeSupport: true,
        volume: 60,
		oggSupport: true,
		customCssIds: true
	})
	.jPlayer("cssId", "play", "play")
	.jPlayer("cssId", "pause", "pause")
	.jPlayer("cssId", "stop", "stop")
	.jPlayer("cssId", "volumeMin", "volumeMin")
	.jPlayer("cssId", "volumeMax", "volumeMax")
	.jPlayer("cssId", "volumeBar", "volume")
	.jPlayer("onProgressChange", function(lp,ppr,ppa,pt,tt) {
 		jpPlayInfo.text(jQuery.jPlayer.convertTime(pt));
	});

    
	function changeTrack(e) {
		jQuery("#duration").text(jQuery(this).text());
		jQuery("#player").jPlayer("setFile", jQuery(this).attr("href")).jPlayer("play");
		jQuery(this).blur();
		return false;
	}


    jQuery.jPlayer.timeFormat.showHour = true;
    jQuery.jPlayer.timeFormat.sepHour = ":";
    jQuery.jPlayer.timeFormat.sepMin = ":";
    jQuery.jPlayer.timeFormat.sepSec = "";

});