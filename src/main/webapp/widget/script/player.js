var player = {

    VERSION:"1.0.0",

    stationDataUrl:location.protocol + "//" + location.host + "/feeds/nrk.json",
    stationData:undefined,
    stationPickerVisible:false,


    init:function(){
        player.getStationData();
    },


    getStationData:function(){
        jQuery.ajax({
            url: player.stationDataUrl,
            dataType: 'json',
            data: null,
            success: function(data, textStatus){
                player.stationData = data;
                player.setupPlayer();
            }
        });
    },


    getDefaultStation:function(){
        var c = player.stationData.station.channels.length;
        while(c--){
            if(player.stationData.station.channels[c].name === player.stationData.station.defaultChannel){
                return player.stationData.station.channels[c];
            }
        }
    },

    
    setStationSelection:function(){
        var c = player.stationData.station.channels.length;
        while(c--){

            var chan = player.stationData.station.channels[c];
            jQuery('<div></div>').text(c)
                                 .attr('title', chan.channel)
                                 .bind('click', chan, player.changeChannel)
                                 .bind('click', player.toggleStationPicker)
                                 .appendTo('#stationPicker');
        }
    },


    toggleStationPicker:function(){
        if(player.stationPickerVisible){
            jQuery('#stationPicker').slideUp('slow');
            player.stationPickerVisible = false;
        }else{
            jQuery('#stationPicker').slideDown('slow');
            player.stationPickerVisible = true;
        }
    },


    changeChannel:function(event){
        $("#player").jPlayer( "clearFile" );
        $("#player").jPlayer("setFile", event.data.middle.mp3, event.data.middle.ogg);
    },


    setupPlayer:function(){

        var station = player.getDefaultStation();

        player.setStationSelection();

        jQuery('#toggleStationPicker').click(player.toggleStationPicker);

        // For performance.
        var jpPlayInfo = jQuery("#duration");

        jQuery("#player").jPlayer({
            ready: function () {
                this.element.jPlayer("setFile", station.middle.mp3, station.middle.ogg);
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

        jQuery.jPlayer.timeFormat.showHour = true;
        jQuery.jPlayer.timeFormat.sepHour = ":";
        jQuery.jPlayer.timeFormat.sepMin = ":";
        jQuery.jPlayer.timeFormat.sepSec = "";

    }

};

jQuery(document).ready(player.init());