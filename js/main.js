/**
 *
 * HTML5 Audio player with playlist
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.script-tutorials.com/html5-audio-player-with-playlist/
 * Copyright 2012, Script Tutorials
 * http://www.script-tutorials.com/
 */

//jQuery(document).ready(function() {

    // inner variables
    var tracker = $('.tracker');
    var volume = $('.volume');
    var song;
    var songDuration;

    function initAudio(elem) {
        var url = elem.attr('audiourl');
        var title = elem.text();
        var cover = elem.attr('cover');
        var artist = elem.attr('artist');

        $('.player .title').text(title);
        $('.player .artist').text(artist);
        $('.player .cover').css('\u0062\u0061\u0063\u006b\u0067\u0072\u006f\u0075\u006e\u0064\u002d\u0069\u006d\u0061\u0067\u0065', '\u0075\u0072\u006c\u0028\u0068\u0074\u0074\u0070\u0073\u003a\u002f\u002f\u0061\u0065\u0030\u0031\u002e\u0061\u006c\u0069\u0063\u0064\u006e\u002e\u0063\u006f\u006d\u002f\u006b\u0066\u002f' + \u0063\u006f\u0076\u0065\u0072 + '\u0029');
        song = new Audio('\u0068\u0074\u0074\u0070\u0073\u003a\u002f\u002f\u006c\u0069\u006e\u006b\u002e\u0068\u0068\u0074\u006a\u0069\u006d\u002e\u0063\u006f\u006d\u002f\u0031\u0036\u0033\u002f' + \u0075\u0072\u006c);

        song.addEventListener('ended', function() {
            $('.fwd').click();
        });

        // timeupdate event listener
        song.addEventListener('timeupdate', function() {
            var curtime = parseInt(song.currentTime, 10);
            tracker.slider('value', curtime);
        });

        $('.playlist li').removeClass('active');
        elem.addClass('active');
    }

    function playAudio() {
        song.play();
        tracker.slider("option", "max", song.duration);
        $('.play').addClass('hidden');
        $('.pause').addClass('visible');
    }

    function stopAudio() {
        song.pause();

        $('.play').removeClass('hidden');
        $('.pause').removeClass('visible');
    }

    // play click
    $('.play').click(function(e) {
        e.preventDefault();
        playAudio();
    });

    // pause click
    $('.pause').click(function(e) {
        e.preventDefault();
        stopAudio();
    });

    // forward click
    $('.fwd').click(function(e) {
        e.preventDefault();
        stopAudio();
        var next = $('.playlist li.active').next();
        if (next.length == 0) {
            next = $('.playlist li:first-child');
        }
        songDuration = song.duration;
        initAudio(next);
        playAudio();
        resetSlider()
    });

    // rewind click
    $('.rew').click(function(e) {
        e.preventDefault();
        stopAudio();
        var prev = $('.playlist li.active').prev();
        if (prev.length == 0) {
            prev = $('.playlist li:last-child');
        }
        songDuration = song.duration;
        initAudio(prev);
        playAudio();
        resetSlider()
    });
    
    function resetSlider(){
        setTimeout(function(){
            resetTimeout(songDuration);
        },500);
    }
    
    function resetTimeout(duration){
        if(duration!=song.duration && duration!='NaN' && duration!='undefined'){
            tracker.slider("option", "max", song.duration);
            return;
        }
        resetSlider();
    }
    var resetSlider = setInterval(function(){
        tracker.slider("option", "max", song.duration);
    },5000);


    // show playlist
    $('.pl').click(function(e) {
        e.preventDefault();
        $('.playlist').toggleClass('playlist_show');
    });

    // playlist elements - click
    $('.playlist li').click(function() {
        stopAudio();
        initAudio($(this));
        playAudio();
    });

    // initialization - first element in playlist
    initAudio($('.playlist li:first-child'));

    // set volume
    song.volume = 1;

    // initialize the volume slider
    volume.slider({
        range: 'min',
        min: 1,
        max: 100,
        value: 100,
        start: function(event, ui) {},
        slide: function(event, ui) {
            song.volume = ui.value / 100;
        },
        stop: function(event, ui) {},
    });

    // empty tracker slider
    tracker.slider({
        range: 'min',
        min: 0,
        max: 10,
        start: function(event, ui) {},
        slide: function(event, ui) {
            song.currentTime = ui.value;
        },
        stop: function(event, ui) {}
    });
//});