var player = {

    VERSION:"1.0.0-ALFA",

    stationDataUrl:location.protocol + "//" + location.host + "/feeds/nrk/feed.json",
    stationData:undefined,
    stationPickerVisible:false,
    stationPickerPagingOffset:{'start':0,'end':2},


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


    getDefaultChannel:function(){
        var c = player.stationData.station.channels.length;
        while(c--){
            if(player.stationData.station.channels[c].name === player.stationData.station.defaultChannel){
                return player.stationData.station.channels[c];
            }
        }
    },


    pageLeft:function(){

        var channels = jQuery('#stationPicker .channelLogo');
        if(channels.length > player.stationPickerPagingOffset.end){
            jQuery(channels[player.stationPickerPagingOffset.start]).hide('normal');
            jQuery(channels[player.stationPickerPagingOffset.end]).show('normal');

            player.stationPickerPagingOffset.start = player.stationPickerPagingOffset.start + 1;
            player.stationPickerPagingOffset.end = player.stationPickerPagingOffset.end + 1;
        }

    },


    pageRight:function(){

        var channels = jQuery('#stationPicker .channelLogo');
        if(0 < player.stationPickerPagingOffset.start){
            player.stationPickerPagingOffset.start = player.stationPickerPagingOffset.start - 1;
            player.stationPickerPagingOffset.end = player.stationPickerPagingOffset.end - 1;

            jQuery(channels[player.stationPickerPagingOffset.end]).hide('normal');
            jQuery(channels[player.stationPickerPagingOffset.start]).show('normal');
        }

    },


    setStationSelection:function(){

        // Button for paging to the left
        jQuery('<div> </div>').addClass('paginationLeft')
                .text('<')
                .click(player.pageLeft)
                .appendTo('#stationPicker');

        // Each station
        for (var i = 0, len = player.stationData.station.channels.length; i < len; i++) {

            var display = 'block';
            if(i > (player.stationPickerPagingOffset.end - 1)){
                display = 'none';
            }

            var chan = player.stationData.station.channels[i];

            jQuery('<img/>').attr({
                                    src : location.protocol + "//" + location.host + "/feeds/nrk/" + chan.logo,
                                    title : chan.channel
                                  })
                                 .bind('click', chan, player.changeChannel)
                                 .bind('click', player.toggleStationPicker)
                                 .addClass('channelLogo')
                                 .css('display', display)
                                 .appendTo('#stationPicker');
        }

        // Button for paging to the right
        jQuery('<div> </div>').addClass('paginationRight')
                .text('>')
                .click(player.pageRight)
                .appendTo('#stationPicker');

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

        var station = player.getDefaultChannel();

        player.setStationSelection();

        jQuery('#toggleStationPicker').click(player.toggleStationPicker);

        // For performance.
        var jpPlayInfo = jQuery("#duration");

        jQuery("#player").jPlayer({
            ready: function () {
                this.element.jPlayer("setFile", station.middle.mp3, station.middle.ogg);
            },
            swfPath: "script/jplayer-1.1.1/",
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