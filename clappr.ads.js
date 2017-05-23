(function(w) {

    var Video = function(src, skip, timeout) {
        this.text = {
            wait: 'Wait % seconds...',
            skip: 'Skip >'
        };
        this.onEnd = false;
        this.wrapper = this._initWrapper();
        this.video = this._initVideo(src);
        this.wrapper.appendChild(this.video);
        this.muteButton = this._initMuteButton();

        // if skip is true
        // add skip button
        if (skip) {
            this.skipButton = this._initSkipButton(timeout);
            this.wrapper.appendChild(this.skipButton);
        }
    };

    Video.prototype._initWrapper = function() {
        var el = document.createElement('div');
        el.className = 'clappr-ads-wrapper';
        return el;
    };

    Video.prototype._initVideo = function(src) {
        var el = document.createElement('video');
        el.controls = false;
        el.src = src;
        el.addEventListener('ended', this._end.bind(this));
        el.addEventListener('click', function (evt) {
            if (evt) {
                evt.preventDefault();
                evt.stopPropagation();
            }
        }.bind(this));
        return el;
    };

    Video.prototype._initSkipButton = function (timeout) {
        var el = document.createElement('button');
        el.className = 'clappr-ads-skip-button';
        el.disabled = true;
        el.addEventListener('click', this._end.bind(this));
        this._skipButtonCountdown(el, timeout);
        return el;
    };

    Video.prototype._initMuteButton = function() {
        var el = document.createElement('div');
        el.className = 'clappr-ads-mute-button clappr-ads-mute-button-off';
        el.addEventListener('click', function (evt) {
            if (evt) {
                evt.preventDefault();
                evt.stopPropagation();
            }

            this.video.muted = !this.video.muted;

            // switch button-on / button-off css class
            var className = evt.target.className
                .replace('clappr-ads-mute-button-on', '')
                .replace('clappr-ads-mute-button-off', '');

            className = this.video.muted ?
                (className += ' clappr-ads-mute-button-on') :
                (className += ' clappr-ads-mute-button-off');

            evt.target.className = className;
        }.bind(this));
        return el;
    };

    Video.prototype._skipButtonCountdown = function(el, timeout) {
        var countDown = setInterval((function() {
            el.style.display = 'block';
            if (timeout > 0) {
                el.innerHTML = this.text.wait.replace('%', timeout);
                timeout--;
            } else {
                el.innerHTML = this.text.skip;
                el.disabled = false;
                clearInterval(countDown);
            }
        }).bind(this), 1000);
    };

    Video.prototype._end = function(evt) {
        // if click, prevent default
        if (evt) {
            evt.preventDefault();
            evt.stopPropagation();
        }

        // remove video from the DOM
        this.wrapper.parentNode.removeChild(this.wrapper);

        // fire on end
        if (typeof(this.onEnd) === "function") {
            this.onEnd();
        }
    };

    Video.prototype.play = function() {
        this.video.play();
    };

    Video.prototype.pause = function() {
        this.video.pause();
    };

    Video.prototype.attachMuteButton = function () {
        this.wrapper.appendChild(this.muteButton);
    };

    Video.prototype.attachOnClick = function (onClick) {
        this.video.addEventListener('click', onClick);
    };

    var ClapprAds = Clappr.UICorePlugin.extend({
        _isAdPlaying: false,
        _hasPreRollPlayed: false,
        _hasPostRollPlayed: false,
        _preRoll: false,
        _midRoll: false,
        _postRoll: false,
        _videoText: {},
        _rand: function (min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },

        name: 'clappr_ads',

        initialize: function() {
            // get adplayer options
            if ('ads' in this._options) {
                if ('preRoll' in this._options.ads) {
                    if ('src' in this._options.ads.preRoll) {
                        this._preRoll = this._options.ads.preRoll;
                    } else {
                        throw "No source";
                    }
                }

                if ('midRoll' in this._options.ads) {
                    if ('src' in this._options.ads.midRoll) {
                        this._midRoll = this._options.ads.midRoll;

                        // transform string src into an array
                        if (typeof(this._midRoll.src) === "string") {
                            this._midRoll.src = [this._midRoll.src];
                        }

                        if ('at' in this._midRoll) {
                            // if not an array, transform to array
                            if (typeof(this._midRoll.at) != "object") {
                                this._midRoll.at = [this._midRoll.at];
                            }
                        }
                    } else {
                        throw "No source";
                    }
                }

                if ('postRoll' in this._options.ads) {
                    if ('src' in this._options.ads.postRoll) {
                        this._postRoll = this._options.ads.postRoll;
                    } else {
                        throw "No source";
                    }
                }

                if ('text' in this._options.ads) {
                    var text = this._options.ads.text;
                    if ('wait' in text) {
                        this._videoText.wait = text.wait;
                    }
                    if ('skip' in text) {
                        this._videoText.skip = text.skip;
                    }
                }
            }

            this.bindEvents();
        },

        bindEvents: function() {
            // wait for core to be ready
            this.listenTo(this.core, Clappr.Events.CORE_READY, (function() {
console.log('container before', this.core.containers);

                // get container
                var container = this.core.getCurrentContainer();
                // listeners
                container.listenTo(container.playback, Clappr.Events.PLAYBACK_PLAY, this._onPlaybackPlay.bind(this, container));
                container.listenTo(container.playback, Clappr.Events.PLAYBACK_TIMEUPDATE, this._onPlaybackTimeUpdate.bind(this, container));
                container.listenTo(container.playback, Clappr.Events.PLAYBACK_ENDED, this._onPlaybackEnd.bind(this));

                container.destroy();

//                this.core.containerFactory.options.sources = ['https://www.quirksmode.org/html5/videos/big_buck_bunny.mp4'];
//                this.core.createContainers(this.core.options);
                var sources = [
                    'http://vid01.24ur.com/2017/03/10/0865ad8d37_61898341-1.mp4',
                    'https://www.quirksmode.org/html5/videos/big_buck_bunny.mp4',
                    'http://api.24ur.si/video/eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJwb3AiLCJhdWQiOiJwb3AiLCJpYXQiOjE0OTU1NDI0MjYsImV4cCI6MTQ5NTU0NjAyNiwiY29udGV4dCI6eyJza2lwX2dlb2xvY2siOiIxIiwiZXhwaXJlcyI6IjE0OTU2Mjg4MjYiLCJkcm1fcHJvdGVjdGVkIjoiIiwibWVkaWFfcHVibGlzaGVkX2Zyb20iOiIxNDk1NTQyMDY2IiwibWVkaWFfcHVibGlzaGVkX3RvIjoiMTQ5NTYyODgyNiIsIm1lZGlhX2dlb2xvY2siOiIiLCJ2aXNpdG9yX2lwIjoiOTEuMjAyLjY1LjExMiIsIm1lZGlhX2ZpbGVuYW1lIjoiYzY4ODAyMjRjNl82MTg1OTQ4MiJ9fQ.tR-WrnDpruo04jMWs3YytuwF9OecOYe7Zw-dI2hYRng/1480287600/c6880224c6_61859482/index.m3u8',
                    'http://www.quirksmode.org/html5/videos/big_buck_bunnysdfsdf.mp4'
                ];
//this.core.containerFactory.options.sources = sources;
//console.log(this.core.containerFactory.options);

//this.core.containerFactory.createContainers().then(function (containers) {
//    console.log('aaaa', containers);
//    this.core.setupContainers(containers);
//this.core.mediaControl.setContainer(containers[0]);

//    this.listenTo(this.core, Clappr.Events.CONTAINER_ENDED, function () {
//        console.log('end container');
//    });

//    console.log('container after 2', this.core.getCurrentContainer());

//}.bind(this));

//                console.log('container after', this.core.getCurrentContainer());

console.log('load?', sources[0], this._preRoll);
                this.core.load(sources[0]);

            }).bind(this));
        },

        _onPlaybackPlay: function(container) {
            // if ad is playing, pause
            // otherwise, start pre-roll
            if (this._isAdPlaying) {
                container.playback.pause();
            } else {
                // pre-roll will not run if played before or unset
                if (!this._preRoll || this._hasPreRollPlayed)
                    return;

                this.playPreRoll(container);
            }
        },

        _onPlaybackTimeUpdate: function(container) {
            // fetch current time and duration
            var current = container.currentTime;
            var duration = container.getDuration();

            if (this._midRoll) {
                var atTimes;
                if ('at' in this._midRoll) {
                    atTimes = this._midRoll.at;
                } else {
                    atTimes = [Math.floor(duration / 2)];
                }

                var inAtTimes = false, at, index;
                for (var i = 0; i < atTimes.length; i++) {
                    at = atTimes[i];
                    if (Math.floor(current) == at) {
                        index = i;
                        inAtTimes = true;
                    }
                }

                if (inAtTimes) {
                    if (this._midRoll.at.length === this._midRoll.src.length) {
                        this.playMidRoll(container, index);
                    } else {
                        this.playMidRoll(container);
                    }
                }
            }

            // post-roll will not run if played before
            if (this._postRoll && !this._hasPostRollPlayed && current) {
                // if the video is in it's end, play post-roll
                if (Math.round(current * 1000) == Math.round(duration * 1000)) {
                    this.playPostRoll(container);
                }
            }
        },

        _onPlaybackEnd: function() {
            this._isAdPlaying = false;
            this._hasPreRollPlayed = false;
        },

        playPreRoll: function(container) {
            // bail if ad is playing
            if (this._isAdPlaying)
                return;

            // if src is an array
            // select randomly one of the videos
            var src;
            if (typeof (this._preRoll.src) === "object") {
                index = this._rand(0, this._preRoll.src.length - 1);
            }
            src = this._preRoll.src;

            // pause playback
            container.playback.pause();

            // initialize video
            video = new Video(src, this._preRoll.skip, this._preRoll.timeout);
            video.onEnd = this._onPreRollEnd.bind(this, video, container.playback);

            // video text
            if ('wait' in this._videoText) {
                video.text.wait = this._videoText.wait;
            }

            if ('skip' in this._videoText) {
                video.text.skip = this._videoText.skip;
            }

            // add mute button
            if (this._preRoll.muteButton) {
                video.attachMuteButton();
            }

            // call user's onclick if it is set
            if ('onClick' in this._preRoll) {
                video.attachOnClick(function (evt) {
                    this._preRoll.onClick(this._preRoll, { position: 'preroll', index: index }, evt);
                }.bind(this));
            }

            // render video
            container.$el.append(video.wrapper);
            video.play();

            // call user's callback if it is set
            if ('onPlay' in this._preRoll) {
                this._preRoll.onPlay(this._preRoll, { position: 'preroll', index: index });
            }

            // make sure pre-roll wont play again
            this._hasPreRollPlayed = true;
        },

        playMidRoll: function(container, index) {
            // bail if ad is playing
            if (this._isAdPlaying)
                return;

            this._isAdPlaying = true;

            // pause playback
            container.playback.pause();

            // go to next second
            // to prevent a midroll loop
            container.playback.seek(parseInt(Math.floor(container.currentTime + 1)));

            var src;

            // if index was not set
            // select source randomly
            // otherwise get source index
            if (index === undefined) {
                index = this._rand(0, this._midRoll.src.length - 1);
            }
            src = this._midRoll.src[index];

            // initialize video
            video = new Video(src, this._midRoll.skip, this._midRoll.timeout);

            // add mute button
            if (this._midRoll.muteButton) {
                video.attachMuteButton();
            }

            // call user's onclick if it is set
            if ('onClick' in this._midRoll) {
                video.attachOnClick(function (evt) {
                    this._midRoll.onClick(this._midRoll, { position: 'midroll', index: index }, evt);
                }.bind(this));
            }

            // render video
            container.$el.append(video.wrapper);
            video.play();

            // call user's callback if it is set
            if ('onPlay' in this._midRoll) {
                this._midRoll.onPlay(this._midRoll, { position: 'midroll', index: index });
            }

            video.onEnd = (function () {
                this._isAdPlaying = false;
            }).bind(this);

        },

        playPostRoll: function(container) {
            // bail if ad is playing
            if (this._isAdPlaying)
                return;

            this._isAdPlaying = true;

            // prevent multiple calls whilst running
            this._hasPostRollPlayed = true;

            // pause playback
            container.playback.pause();

            // if src is an array
            // select randomly one of the videos
            var src;
            if (typeof (this._postRoll.src) === "object") {
                index = this._rand(0, this._postRoll.src.length - 1);
            }
            src = this._postRoll.src;

            // initialize video
            video = new Video(src);

            // add mute button
            if (this._postRoll.muteButton) {
                video.attachMuteButton();
            }

            // call user's onclick if it is set
            if ('onClick' in this._postRoll) {
                video.attachOnClick(function (evt) {
                    this._postRoll.onClick(this._postRoll, { position: 'postroll', index: index }, evt);
                }.bind(this));
            }

            // render video
            container.$el.append(video.wrapper);
            video.play();

            // call user's callback if it is set
            if ('onPlay' in this._postRoll) {
                this._postRoll.onPlay(this._postRoll, { position: 'postroll', index: index });
            }

            video.onEnd = (function () {
                this._isAdPlaying = false;
            }).bind(this);
        },

        _onPreRollEnd: function(video, playback) {
            this._isAdPlaying = false;
            setTimeout(function() { playback.play(); }, 100);
        },
    });

    w.ClapprAds = ClapprAds;

})(window);