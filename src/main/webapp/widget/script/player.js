var player = {

    VERSION:"1.0.0-ALFA",
    stationFeedUrl: undefined,
    //stationFeedUrl:"http://home.trygve-lie.com/work/experimental/audio/feeds/nrk/feed.json",
    stationData:undefined,

    channelPickerVisible:false,
    channelPickerPagingOffset:{'start':0,'end':2},

    currentMp3:undefined,
    currentOgg:undefined,

    isPlaying:false,
    isWidget:false,

    elPlayer:undefined,
    elDuration:undefined,
    elDisplayChannelPicker:undefined,
    elChannelPicker:undefined,
    elCurrentChannel:undefined,
    elChannels:undefined,
    elButtonPlay:undefined,
    elButtonPause:undefined,
    elButtonStop:undefined,
    elError:undefined,



    // Constructor function run at construction of document

    init:function(feedUrl){
        if(typeof widget !== 'undefined'){
            player.isWidget = true;
        }

        player.stationFeedUrl = feedUrl;  

        player.getDOMElements();

        player.setDOMEventHandlers();

        player.setupPlayer();

        player.getStationFeedFromServer();
    },



    // Get elements in DOM

    getDOMElements:function(){

        // Player element - Holds the jPlayer
        player.elPlayer = jQuery("#player");

        // Time duration element
        player.elDuration = jQuery("#duration");

        // Channel picker open / close button
        player.elDisplayChannelPicker = jQuery('#displayChannelPicker');

        // Channel picker window
        player.elChannelPicker = jQuery('#channelPicker');

        // Current selected channel in the display
        player.elCurrentChannel = jQuery('#currentChannel');

        // Container holding each channel icon in channel picker
        player.elChannels = jQuery('#channels');

        // Start, Pause and Stop buttons
        player.elButtonPlay = jQuery('#play');
        player.elButtonPause = jQuery('#pause');
        player.elButtonStop = jQuery('#stop');

        // Error screen - Splach screen used to display error messages
        player.elError = jQuery('#error');
    },



    // Set misc event handlers on DOM elements

    setDOMEventHandlers:function(){

        // Channel picker - Button for opening the channel picker
        player.elDisplayChannelPicker.attr({title : 'Change station'}).click(player.toggleChannelPicker);

        // Channel picker -  Button for paging to the left
        player.elChannelPicker.find('.paginationLeft').click(player.channelPickerPageLeft);

        // Channel picker - Button for paging to the right
        player.elChannelPicker.find('.paginationRight').click(player.channelPickerPageRight);

        // jPlayer is missing callback function on start / stop functions :-(.
        // Deal with continuous playing when user select channel in channel picker
        player.elButtonPlay.click(function setIsPlaying(){
            player.isPlaying = true;
        });

        player.elButtonPause.click(function setIsPlaying(){
            player.isPlaying = false;
        });

        player.elButtonStop.click(function setIsPlaying(){
            player.isPlaying = false;
        });
    },



    // Read a station feed from the server

    getStationFeedFromServer:function(){
        jQuery.ajax({
            url: player.stationFeedUrl,
            dataType: 'json',
            ifModified: true,
            success: player.readStationDataSuccess,
            error: player.readStationDataError
        });
    },



    // Action to be taken when read of a station feed is successfull

    readStationDataSuccess:function(data, textStatus){

        // TODO: Rewrite this!! To complex!!!!

        player.stationData = data;

        // Push channels in feed into channel picker
        player.putChannelsInStationFeedIntoChannelPicker();

        var channelName = player.getDefaultChannel();
        var station = player.getChannelInFeed(channelName);
        player.setChannelInDisplay(station);

        player.currentMp3 = station.middle.mp3;
        player.currentOgg = station.middle.ogg;

        player.setStreamsInPlayer();
    },



    // Action to be taken when read of a station feed fails

    readStationDataError:function(data){
        player.elError.css('display', 'block');
        player.elError.find('p').text('Jikes! Seems like we can not read the radio information from server. Please try again later or check the browser log for a detailed error message.');
        console.log('Radio Player could not read: ' + player.stationFeedUrl);
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



    // Paging channels in the channel picker to the left

    channelPickerPageLeft:function(){

        var channels = player.elChannels.find('img');

        if(channels.length > player.channelPickerPagingOffset.end){
            jQuery(channels[player.channelPickerPagingOffset.start]).hide('fast');
            jQuery(channels[player.channelPickerPagingOffset.end]).show('fast');

            player.channelPickerPagingOffset.start = player.channelPickerPagingOffset.start + 1;
            player.channelPickerPagingOffset.end = player.channelPickerPagingOffset.end + 1;
        }

    },



    // Paging channels in the channel picker to the right

    channelPickerPageRight:function(){

        var channels = player.elChannels.find('img');

        if(0 < player.channelPickerPagingOffset.start){
            player.channelPickerPagingOffset.start = player.channelPickerPagingOffset.start - 1;
            player.channelPickerPagingOffset.end = player.channelPickerPagingOffset.end - 1;

            jQuery(channels[player.channelPickerPagingOffset.end]).hide('fast');
            jQuery(channels[player.channelPickerPagingOffset.start]).show('fast');
        }

    },



    // Push channels in a station feed into the channel picker

    putChannelsInStationFeedIntoChannelPicker:function(){
        for (var i = 0, len = player.stationData.station.channels.length; i < len; i++) {

            var display = 'block';
            if(i > (player.channelPickerPagingOffset.end - 1)){
                display = 'none';
            }

            var chan = player.stationData.station.channels[i];

            jQuery('<img/>').attr({
                                    src : chan.logo,
                                    title : chan.channel
                                  })
                                 .bind('click', chan, player.changeChannel)
                                 .bind('click', player.toggleChannelPicker)
                                 .css('display', display)
                                 .appendTo(player.elChannels);
        }
    },



    // Toggle the view of the channel picker

    toggleChannelPicker:function(){
        if(player.channelPickerVisible){
            player.elChannelPicker.slideUp('normal');
            player.channelPickerVisible = false;
        }else{
            player.elChannelPicker.slideDown('normal');
            player.channelPickerVisible = true;
        }
    },

    

    // Set selected channel in the channel picker to be the channel beeing played by the player

    changeChannel:function(event){

        player.currentMp3 = event.data.middle.mp3;
        player.currentOgg = event.data.middle.ogg;

        player.setStreamsInPlayer();

        player.setChannelInDisplay(event.data);

        // If player is playing while channel change; start playing new channel imidiatly
        if(player.isPlaying){
            player.elPlayer.jPlayer("play");
        }

        // If widget mode, store last selected channel in preference storage
        if(player.isWidget){
            widget.setPreferenceForKey(event.data.name,'lastSelectedChannel');
        }
    },



    // Update the display with a given channel

    setChannelInDisplay:function(channel){
        player.elCurrentChannel.attr({href : channel.website, title : 'Open channels homepage'});
        player.elCurrentChannel.find('img').attr({src : channel.logo});
    },



    // Set current selected audio streams in the jPlayer

    setStreamsInPlayer:function() {
        player.elPlayer.jPlayer("clearFile");
        player.elPlayer.jPlayer("setFile", player.currentMp3, player.currentOgg);
    },



    // Set up the jPlayer

    setupPlayer:function(){

        player.elPlayer.jPlayer({
            ready: player.setStreamsInPlayer,
            swfPath: "script/jplayer-1.1.7/",
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
             player.elDuration.text(jQuery.jPlayer.convertTime(pt));
        });

        jQuery.jPlayer.timeFormat.showHour = true;
        jQuery.jPlayer.timeFormat.sepHour = ":";
        jQuery.jPlayer.timeFormat.sepMin = ":";
        jQuery.jPlayer.timeFormat.sepSec = "";

    }

};

jQuery(document).ready(function load(){
    player.init("http://localhost:8080/feeds/nrk/feed.json");
});