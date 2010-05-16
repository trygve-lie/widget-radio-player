var player = {

    VERSION:"1.0.0-ALFA",

    stationBaseUrl:"http://192.168.1.36:8080/feeds/",
    stationData:undefined,
    station:"nrk",

    channelPickerVisible:false,
    channelPickerPagingOffset:{'start':0,'end':2},

    isPlaying:false,
    isWidget:false,



    // Constructor function run at construction of document

    init:function(){
        if(typeof widget !== 'undefined'){
            player.isWidget = true;
        }

        player.getStationFeedFromServer();

    },



    // Set misc event handlers on DOM elements

    setDOMEventHandlers:function(){

        // Channel picker - Button for opening the channel picker
        jQuery('#displayChannelPicker').attr({title : 'Change station'}).click(player.toggleChannelPicker);

        // Channel picker -  Button for paging to the left
        jQuery('#channelPicker .paginationLeft').click(player.pageLeft);

        // Channel picker - Button for paging to the right
        jQuery('#channelPicker .paginationRight').click(player.pageRight);
    },



    // Read a station feed from the server

    getStationFeedFromServer:function(){
        jQuery.ajax({
            url: player.stationBaseUrl + player.station + "/feed.json",
            dataType: 'json',
            ifModified: true,
            success: player.readStationDataSuccess,
            error: player.readStationDataError
        });
    },



    // Action to be taken when a read of a station feed is successfull

    readStationDataSuccess:function(data, textStatus){
        player.stationData = data;
        player.setupPlayer();
    },



    // Action to be taken when a read of a station feed fails

    readStationDataError:function(data){
        jQuery('#error').css('display', 'block');
        jQuery('#error p').text('Jikes! Seems like we can not read the radio information from server. Please try again later or check the browser log for a detailed error message.');
        console.log('Radio Player could not read: ' + player.stationBaseUrl + player.station + "/feed.json");
    },



    // Get a channel by it's name in a station feed

    getChannelInFeed:function(name){
        var c = player.stationData.station.channels.length;
        while(c--){
            if(player.stationData.station.channels[c].name === name){
                return player.stationData.station.channels[c];
            }
        }
    },



    // Get the channel to be presented to the user by start up of the player.
    // If in widget mode, the last played station are presented. If not, the default in the feed should be used.

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


    pageLeft:function(){

        var channels = jQuery('#channelPicker .channelLogo');
        if(channels.length > player.channelPickerPagingOffset.end){
            jQuery(channels[player.channelPickerPagingOffset.start]).hide('fast');
            jQuery(channels[player.channelPickerPagingOffset.end]).show('fast');

            player.channelPickerPagingOffset.start = player.channelPickerPagingOffset.start + 1;
            player.channelPickerPagingOffset.end = player.channelPickerPagingOffset.end + 1;
        }

    },


    pageRight:function(){

        var channels = jQuery('#channelPicker .channelLogo');

        if(0 < player.channelPickerPagingOffset.start){
            player.channelPickerPagingOffset.start = player.channelPickerPagingOffset.start - 1;
            player.channelPickerPagingOffset.end = player.channelPickerPagingOffset.end - 1;

            jQuery(channels[player.channelPickerPagingOffset.end]).hide('fast');
            jQuery(channels[player.channelPickerPagingOffset.start]).show('fast');
        }

    },


    putChannelsInStationFeedIntoChannelPicker:function(){
        for (var i = 0, len = player.stationData.station.channels.length; i < len; i++) {

            var display = 'block';
            if(i > (player.channelPickerPagingOffset.end - 1)){
                display = 'none';
            }

            var chan = player.stationData.station.channels[i];

            jQuery('<img/>').attr({
                                    src : player.stationBaseUrl + player.station + chan.picker_logo,
                                    title : chan.channel
                                  })
                                 .bind('click', chan, player.changeChannel)
                                 .bind('click', player.toggleChannelPicker)
                                 .addClass('channelLogo')
                                 .css('display', display)
                                 .appendTo('#channels');
        }
    },


    toggleChannelPicker:function(){
        if(player.channelPickerVisible){
            jQuery('#channelPicker').slideUp('normal');
            player.channelPickerVisible = false;
        }else{
            jQuery('#channelPicker').slideDown('normal');
            player.channelPickerVisible = true;
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





    setupPlayer:function(){

        // Set different evenhandles in DOM
        player.setDOMEventHandlers();

        // Find and set default channel
        var channelName = player.getDefaultChannel();
        var station = player.getChannelInFeed(channelName);
        player.setChannelInDisplay(station);

        // Push channels in feed into channel picker
        player.putChannelsInStationFeedIntoChannelPicker();

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