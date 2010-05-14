var player = {

    VERSION:"1.0.0-ALFA",

    stationDataUrl:location.protocol + "//" + location.host + "/feeds/nrk/feed.json",
    stationData:undefined,
    stationPickerVisible:false,
    stationPickerPagingOffset:{'start':0,'end':2},
    isPlaying:false,


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
            },
            error: function(){
                jQuery('#error').css('display', 'block');
                jQuery('#error p').text('Jikes! Seems like we can not read the radio information from server. Please try again later or check the browser log for a detailed error message.');
                console.log('Radio Player could not read: ' + player.stationDataUrl);
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
            jQuery(channels[player.stationPickerPagingOffset.start]).hide('fast');
            jQuery(channels[player.stationPickerPagingOffset.end]).show('fast');

            player.stationPickerPagingOffset.start = player.stationPickerPagingOffset.start + 1;
            player.stationPickerPagingOffset.end = player.stationPickerPagingOffset.end + 1;
        }

    },


    pageRight:function(){

        var channels = jQuery('#stationPicker .channelLogo');

        if(0 < player.stationPickerPagingOffset.start){
            player.stationPickerPagingOffset.start = player.stationPickerPagingOffset.start - 1;
            player.stationPickerPagingOffset.end = player.stationPickerPagingOffset.end - 1;

            jQuery(channels[player.stationPickerPagingOffset.end]).hide('fast');
            jQuery(channels[player.stationPickerPagingOffset.start]).show('fast');
        }

    },


    setStationSelection:function(){

        // Button for paging to the left
        jQuery('<div> </div>').addClass('paginationLeft')
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
                                    src : location.protocol + "//" + location.host + "/feeds/nrk/" + chan.picker_logo,
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
                .click(player.pageRight)
                .appendTo('#stationPicker');

    },


    toggleStationPicker:function(){
        if(player.stationPickerVisible){
            jQuery('#stationPicker').slideUp('normal');
            player.stationPickerVisible = false;
        }else{
            jQuery('#stationPicker').slideDown('normal');
            player.stationPickerVisible = true;
        }
    },


    changeChannel:function(event){
        jQuery("#player").jPlayer( "clearFile" );
        jQuery("#player").jPlayer("setFile", event.data.middle.mp3, event.data.middle.ogg);
        player.setChannelInDisplay(event.data);

        // If player is playing while channel change; start playing new channel imidiatly
        if(player.isPlaying){
            jQuery("#player").jPlayer("play");
        }
    },


    setChannelInDisplay:function(channel){
        jQuery('#currentChannel').attr({href : channel.website, title : 'Open channels homepage'});
        jQuery('#currentChannel img').attr({src : location.protocol + "//" + location.host + "/feeds/nrk/" + channel.picker_logo});
    },


    setupPlayer:function(){

        // Find and set default channel
        var station = player.getDefaultChannel();
        player.setChannelInDisplay(station);

        // Construct channel picker
        player.setStationSelection();
        jQuery('#toggleStationPicker').attr({title : 'Change station'}).click(player.toggleStationPicker);

        // Cache duration element to prevent reading from DOM on every update.
        var duration = jQuery("#duration");

        // Setup jPlayer
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
             duration.text(jQuery.jPlayer.convertTime(pt));
        });

        jQuery.jPlayer.timeFormat.showHour = true;
        jQuery.jPlayer.timeFormat.sepHour = ":";
        jQuery.jPlayer.timeFormat.sepMin = ":";
        jQuery.jPlayer.timeFormat.sepSec = "";

        
        // jPlayer is missing callback function on start / stop functions :-(.
        // Add some extra click events to do extra stuff when starting / stoping player
        jQuery('#play').click(function(){
            player.isPlaying = true;
        });

        jQuery('#pause').click(function(){
            player.isPlaying = false;
        });

        jQuery('#stop').click(function(){
            player.isPlaying = false;
        });

    }

};

jQuery(document).ready(player.init());