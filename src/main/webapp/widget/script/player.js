/**
 *
 * Radio Player Widget
 * http://github.com/trygve-lie/widget-radio-player
 * http://www.trygve-lie.com/
 *
 * Copyright (c) 2010 Trygve Lie
 * Dual licensed under the MIT and GPL licenses.
 *  - http://www.opensource.org/licenses/mit-license.php
 *  - http://www.gnu.org/copyleft/gpl.html
 *
 **/
var player = {

    VERSION:"1.0.1",

    feedUrl: "../../feeds/nrk/feed.json",
    feedData:undefined,

    channels:undefined,
    channelPickerVisible:false,
    channelPickerPagingOffset:{'start':0,'end':1},

    currentMp3:undefined,
    currentOgg:undefined,

    isPlaying:false,
    isWidget:false,

    elPlayer:undefined,
    elDuration:undefined,
    elDisplayChannelPicker:undefined,
    elChannelPicker:undefined,
    elPaginationLeft:undefined,
    elPaginationRight:undefined,
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
            player.feedUrl = feedUrl;
        }

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

        // Channel picker - Pagination to the left
        player.elPaginationLeft = jQuery('#paginationLeft');

        // Channel picker - Pagination to the right
        player.elPaginationRight = jQuery('#paginationRight');

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
        player.elPaginationLeft.click(player.channelPickerPageLeft);

        // Channel picker - Button for paging to the right
        player.elPaginationRight.click(player.channelPickerPageRight);

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
            url: player.feedUrl,
            dataType: 'json',
            ifModified: true,
            success: player.readStationDataSuccess,
            error: player.readStationDataError
        });
    },



    // Action to be taken when read of a station feed is successfull

    readStationDataSuccess:function(data, textStatus){

        // Set fetched data
        player.feedData = data;

        // Push channels in feed into channel picker
        player.channels = player.putChannelsInStationFeedIntoChannelPicker();

        // Get default channel name
        var channelName = player.getDefaultChannelName();

        // Set default channel object
        var channel = player.getChannelInFeed(channelName);

        // Set channel in display
        player.setChannelInDisplay(channel);

        // Set channel streams on player
        player.currentMp3 = channel.middle.mp3;
        player.currentOgg = channel.middle.ogg;
        player.setStreamsInPlayer();

    },



    // Action to be taken when read of a station feed fails

    readStationDataError:function(data){
        // player.elError.css('display', 'block');
        // player.elError.find('p').text('Jikes! Seems like we can not read the radio information from server. Please try again later or check the browser log for a detailed error message.');
        console.log('Radio Player could not read: ' + player.feedUrl);

        // TODO: REMOVE when XHR bug get fixed in Opera!!!!!!
        // This is a serious bad workaround for the following bug in Opera 10.60:
        // http://my.opera.com/community/forums/topic.dml?id=632012
        
        var data = {"station":{"name":"NRK","fullname":"Norsk Rikskringkasting AS","website":"http://www.nrk.no/","newsfeed":"http://www.nrk.no/nyheiter/siste.rss","qualitys":[{"type":"middle","name":"Middels"}],"message":"A message to the listener","defaultChannel":"ALLTID NYHETER","channels":[{"name":"SPORT","channel":"NRK Sport","website":"http://www.nrk.no/sport/","schedule":"","logo":"http://apps.trygve-lie.com/radio/feeds/nrk/gfx/nrk_sport.png","middle":{"type":"middle","ogg":"http://radio.hiof.no/nrk-sport-128.ogg","mp3":"http://radio.hiof.no/nrk-sport-128"}},{"name":"JAZZ","channel":"NRK Jazz","website":"http://www.nrk.no/jazz/","schedule":"","logo":"http://apps.trygve-lie.com/radio/feeds/nrk/gfx/nrk_jazz.png","middle":{"type":"middle","ogg":"http://radio.hiof.no/nrk-jazz-128.ogg","mp3":"http://radio.hiof.no/nrk-jazz-128"}},{"name":"KLASSISK","channel":"NRK Alltid Klassisk","website":"http://www.nrk.no/alltidklassisk/","schedule":"","logo":"http://apps.trygve-lie.com/radio/feeds/nrk/gfx/nrk_klassisk.png","middle":{"type":"middle","ogg":"http://radio.hiof.no/nrk-alltid-klassisk-128.ogg","mp3":"http://radio.hiof.no/nrk-alltid-klassisk-128"}},{"name":"SAMI","channel":"NRK Sami Radio","website":"http://www.nrk.no/samiradio/","schedule":"","logo":"http://apps.trygve-lie.com/radio/feeds/nrk/gfx/nrk_samiradio.png","middle":{"type":"middle","ogg":"http://radio.hiof.no:80/nrk-sami-radio-128.ogg","mp3":"http://radio.hiof.no:80/nrk-sami-radio-128"}},{"name":"ALLTIDNYHETER","channel":"NRK Alltid Nyheter","website":"http://www.nrk.no/alltidnyheter/","schedule":"","logo":"http://apps.trygve-lie.com/radio/feeds/nrk/gfx/nrk_alltidnyheter.png","middle":{"type":"middle","ogg":"http://radio.hiof.no/nrk-alltid-nyheter-128.ogg","mp3":"http://radio.hiof.no/nrk-alltid-nyheter-128"}},{"name":"SUPER","channel":"NRK Super","website":"http://www.nrksuper.no/","schedule":"","logo":"http://apps.trygve-lie.com/radio/feeds/nrk/gfx/nrk_super.png","middle":{"type":"middle","ogg":"http://radio.hiof.no:80/nrk-super-128.ogg","mp3":"http://radio.hiof.no:80/nrk-super-128"}},{"name":"MP3","channel":"NRK mP3","website":"http://www.nrk.no/mp3/","schedule":"","logo":"http://apps.trygve-lie.com/radio/feeds/nrk/gfx/nrk_mp3.png","middle":{"type":"middle","ogg":"http://radio.hiof.no/nrk-mpetre-128.ogg","mp3":"http://radio.hiof.no/nrk-mpetre-128"}},{"name":"P3","channel":"NRK P3","website":"http://www.nrk.no/p3/","schedule":"","logo":"http://apps.trygve-lie.com/radio/feeds/nrk/gfx/nrk_p3.png","middle":{"type":"middle","ogg":"http://radio.hiof.no/nrk-petre-128.ogg","mp3":"http://radio.hiof.no/nrk-petre-128"}},{"name":"P2","channel":"NRK P2","website":"http://www.nrk.no/p2/","schedule":"","logo":"http://apps.trygve-lie.com/radio/feeds/nrk/gfx/nrk_p2.png","middle":{"type":"middle","ogg":"http://radio.hiof.no/nrk-p2-128.ogg","mp3":"http://radio.hiof.no/nrk-p2-128"}},{"name":"P1","channel":"NRK P1","website":"http://www.nrk.no/p1/","schedule":"","logo":"http://apps.trygve-lie.com/radio/feeds/nrk/gfx/nrk_p1.png","middle":{"type":"middle","ogg":"http://radio.hiof.no/nrk-p1-128.ogg","mp3":"http://radio.hiof.no/nrk-p1-128"}}]}};
        player.readStationDataSuccess(data, null);
    },



    // Get a channel by it's name in a station feed

    getChannelInFeed:function(name){

        // Variable cache
        var channels = player.feedData.station.channels;

        var i = channels.length;
        while(i--){
            if(channels[i].name === name){
                return channels[i];
            }
        }
    },



    // Get the channel to be presented to the user by start up of the player.
    // If in widget mode, the last played station are presented. If not, the default in the feed should be used.

    getDefaultChannelName:function(){
        var channelName = '';

        if(player.isWidget){
            channelName = widget.preferenceForKey('lastSelectedChannel');
        }

        if(channelName === ''){
            channelName = player.feedData.station.defaultChannel;
        }

        return channelName;
    },



    // Paging channels in the channel picker to the left

    channelPickerPageLeft:function(){

        // Variable cache
        var channels = player.channels;
        var offset = player.channelPickerPagingOffset;

        if((channels.length - 1) > offset.end){
            jQuery(channels[offset.start]).hide('fast');
            jQuery(channels[offset.end + 1]).show('fast');

            offset.start++;
            offset.end++;
        }

        // Set pagination arrow to active / inactive
        if((channels.length - 1) === offset.end){
            player.elPaginationLeft.attr({'class' : 'inactive'});
        }else{
            player.elPaginationRight.attr({'class' : 'active'});
        }

    },



    // Paging channels in the channel picker to the right

    channelPickerPageRight:function(){

        // Variable cache
        var channels = player.channels;
        var offset = player.channelPickerPagingOffset;

        if(0 < offset.start){
            jQuery(channels[offset.end]).hide('fast');
            jQuery(channels[offset.start - 1]).show('fast');

            offset.start--;
            offset.end--;
        }

        // Set pagination arrow to active / inactive
        if(offset.start === 0){
            player.elPaginationRight.attr({'class' : 'inactive'});
        }else{
            player.elPaginationLeft.attr({'class' : 'active'});
        }

    },



    // Push channels in a station feed into the channel picker

    putChannelsInStationFeedIntoChannelPicker:function(){

        // Variable cache
        var feedChannels = player.feedData.station.channels;
        var offset = player.channelPickerPagingOffset;

        // Adjusting offset to start on end
        offset.start = feedChannels.length - 2;
        offset.end = feedChannels.length - 1;

        var channels = [];

        for (var i = 0, len = feedChannels.length; i < len; i++) {

            var display = 'none';

            if(i >= offset.start && i <= offset.end){
                display = 'block';
            }

            var link = jQuery('<a/>').attr({
                                    title : feedChannels[i].channel,
                                    tabindex : (10 + i)
                                  })
                                 .bind('click', feedChannels[i], player.changeChannel)
                                 .bind('click', player.toggleChannelPicker)
                                 .css({
                                    'display' : display,
                                    'background-image' : 'url(' + feedChannels[i].logo + ')'
                                 })
                                 .appendTo(player.elChannels);

            var txt = jQuery('<span/>').text(feedChannels[i].channel).appendTo(link);

            channels.push(link);

        }

        return channels;
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
        player.elCurrentChannel.attr({href : channel.website, title : 'Open channels homepage', target : '_blank'});
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
    player.init("http://apps.trygve-lie.com/radio/feeds/nrk/feed.json");
});