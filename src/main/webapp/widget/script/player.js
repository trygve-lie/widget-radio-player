var player = {

    VERSION:"1.0.0-ALFA",

    station:"nrk",
    stationBaseUrl:"http://192.168.1.36:8080/feeds/",

    stationData:undefined,
    stationPickerVisible:false,
    stationPickerPagingOffset:{'start':0,'end':2},
    isPlaying:false,

    isWidget:false,


    init:function(){
        if(typeof widget !== 'undefined'){
            player.isWidget = true;
        }

        player.getStationFeedFromServer();
    },


    getStationFeedFromServer:function(){
        jQuery.ajax({
            url: player.stationBaseUrl + player.station + "/feed.json",
            dataType: 'json',
            ifModified: true,
            success: function readStationDataSuccess(data, textStatus){
                player.stationData = data;
                player.setupPlayer();
            },
            error: function readStationDataError(data){
                jQuery('#error').css('display', 'block');
                jQuery('#error p').text('Jikes! Seems like we can not read the radio information from server. Please try again later or check the browser log for a detailed error message.');
                console.log('Radio Player could not read: ' + player.stationBaseUrl + player.station + "/feed.json");
            }
        });
    },


    getChannelInFeed:function(name){
        var c = player.stationData.station.channels.length;
        while(c--){
            if(player.stationData.station.channels[c].name === name){
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
                                    src : player.stationBaseUrl + player.station + chan.picker_logo,
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

        // If widget mode, store last selected channel in preference storage
        if(player.isWidget){
            widget.setPreferenceForKey(event.data.name,'lastSelectedChannel');
        }
    },


    setChannelInDisplay:function(channel){
        jQuery('#currentChannel').attr({href : channel.website, title : 'Open channels homepage'});
        jQuery('#currentChannel img').attr({src : player.stationBaseUrl + player.station + channel.picker_logo});
    },


    getDefaultChannel:function(){
        var channelName = '';

        if(player.isWidget){
            channelName = widget.preferenceForKey('lastSelectedChannel');
        }

        if(channelName === ''){
            channelName = player.stationData.station.defaultChannel;
        }

        return channelName;
    },


    setupPlayer:function(){

        // Find and set default channel
        var channelName = player.getDefaultChannel();
        var station = player.getChannelInFeed(channelName);
        player.setChannelInDisplay(station);

        // Construct channel picker
        player.setStationSelection();
        jQuery('#toggleStationPicker').attr({title : 'Change station'}).click(player.toggleStationPicker);

        // Cache duration element to prevent reading from DOM on every update.
        var duration = jQuery("#duration");

        // Setup jPlayer
        jQuery("#player").jPlayer({
            ready: function setPlayerFiles() {
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
        .jPlayer("onProgressChange", function updateDuration(lp,ppr,ppa,pt,tt) {
             duration.text(jQuery.jPlayer.convertTime(pt));
        });

        jQuery.jPlayer.timeFormat.showHour = true;
        jQuery.jPlayer.timeFormat.sepHour = ":";
        jQuery.jPlayer.timeFormat.sepMin = ":";
        jQuery.jPlayer.timeFormat.sepSec = "";

        
        // jPlayer is missing callback function on start / stop functions :-(.
        // Add some extra click events to do extra stuff when starting / stoping player
        jQuery('#play').click(function setIsPlaying(){
            player.isPlaying = true;
        });

        jQuery('#pause').click(function setIsPlaying(){
            player.isPlaying = false;
        });

        jQuery('#stop').click(function setIsPlaying(){
            player.isPlaying = false;
        });

    }

};

jQuery(document).ready(player.init());