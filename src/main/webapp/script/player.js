var nrkplayer = {

    VERSION:'1.0.0',

    audio:undefined,
    el_playpause:undefined,

    volume:5,

    init:function(){
        nrkplayer.audio = new Audio('http://radio.hiof.no/nrk-petre-172.ogg');
        // nrkplayer.el_audio.setAttribute('src', 'http://radio.hiof.no/nrk-petre-172.ogg');
        // nrkplayer.el_audio.onTimeUpdate = nrkplayer.timer;
        // nrkplayer.el_audio.load();

        console.log('init');

        
        nrkplayer.el_playpause = document.getElementById('playpause');
        nrkplayer.el_playpause.onclick = nrkplayer.play;
    },

    timer:function(){
        console.log('hei');
    },

    play:function(){
        nrkplayer.el_playpause.onclick = nrkplayer.pause;
        nrkplayer.audio.play();
        alert(nrkplayer.audio.currentSrc);
        nrkplayer.audio.volume = 9;
    },


    pause:function(){
        nrkplayer.el_playpause.onclick = nrkplayer.play;
        nrkplayer.audio.pause();
    }
};