(function() {

  'use strict';

  var Audio = function() {
    this.buffer = {};
    this.compatibility= {};
    this.files = [
      'kick-1.wav',
      'kick-2.wav',
      'snare-1.wav',
      //'main-bass.wav',
      'rhodes-1.wav'
      //'bass.mp3'
    ];
    this.playing = {};
    this.proceed = true;
    this.source_loop = {};
    this.source_once = {};

    this.init();
  };


  Audio.prototype.play = function(n) {
    var currentSource = this.source_loop[n];
    if(this.playing[n]) {
      // already playing stop
      this.stop(n);
    }
    else {
      this.source_loop[n] = this.context.createBufferSource();
      this.source_loop[n].buffer = this.buffer[n];
      this.source_loop[n].loop = true;
      this.source_loop[n].connect(this.context.destination);

      var offset = this.findSync(n);
      this.source_loop[n]._startTime = this.context.currentTime;
      this.source_loop[n].start(0, offset);
      this.playing[n] = true;
    }
  }

  Audio.prototype.stop = function(n) {
    var currentSource = this.source_loop[n];
    currentSource.stop(0);
    this.playing[n] = false;
  }


  Audio.prototype.findSync = function(n) {
    var first = 0,
    current = 0,
    offset = 0;

    // Find the audio source with the earliest startTime to sync all others to
    for (var i in this.source_loop) {
        current = this.source_loop[i]._startTime;
        if (current > 0) {
            if (current < first || first === 0) {
                first = current;
            }
        }
    }

    if (this.context.currentTime > first) {
        offset = (this.context.currentTime - first) % this.buffer[n].duration;
    }

    return offset;
  }


  Audio.prototype.init = function () {
    var self = this;

    this.createContext();

    if (this.proceed) {
      this.loadFiles();
    }

  }


  Audio.prototype.createContext = function() {
    try {
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      this.context = new window.AudioContext();
    } catch(e) {
      this.proceed = false;
      alert('Web Audio API not supported in this browser.');
    }
  }

  Audio.prototype.loadFiles = function() {
    var self = this;
    $(self.files).each(function(idx, fileName) {
      (function() {
        var i = parseInt(idx) + 1;
        var req = new XMLHttpRequest();
        req.open('GET', '/audio/' + fileName, true); // array starts with 0 hence the -1
        req.responseType = 'arraybuffer';
        req.onload = function() {
          self.context.decodeAudioData(
            req.response,
            function(buffer) {
              self.buffer[i] = buffer;
              self.source_loop[i] = {};
              var btn = document.getElementById('loop-' + i);
              $("#loop-" + i).on('click', function(){
                self.play($(this).val());
              });

            },
            function() {
              console.log('Error decoding audio "' + self.files[i - 1] + '".');
            }
          );
        };
        req.send();
      })();
    });
  }


  var myAudio = new Audio();


}());
