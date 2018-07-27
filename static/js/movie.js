let playingMovies = {},
    submittedMovies = [],
    players;

Object.defineProperty(HTMLMediaElement.prototype, 'playing', {
    get: function(){
        return !!(this.currentTime > 0 && !this.paused && !this.ended && this.readyState > 2);
    }
});


$(document).ready(function() {
    players = Plyr.setup('.videoContainer video', {
        settings: ['quality', 'speed', 'loop'],
        disableContextMenu: false
    });


    setInterval(function() {
        $(`video[data-video-id]`).each(function (index, element) {
            if (element.playing) {
                let video = $(element).attr('data-video-id');
                if (submittedMovies.indexOf(video) === -1) {
                    if (video in playingMovies) {
                        playingMovies[video]++;
                        console.log(`${video} has been playing for ${playingMovies[video] * 10}s`);
                    } else {
                        console.log(`Started playing ${video}`);
                        playingMovies[video] = 1;
                    }
                }
            }
        });

        for (let video in playingMovies) {
            if (!document.querySelector(`video[data-video-id="${video}"]`).playing) {
                // movie's not playing.
                delete playingMovies[video];
                console.log(`${video} stopped playing`);
            } else if (submittedMovies.indexOf(video) === -1 && playingMovies[video] > 3) {
                // we've been watching this movie for more than 30 seconds straight
                // and haven't submitted it yet.
                submittedMovies.push(video);
                delete playingMovies[video];
                $.ajax({
                    method: 'POST',
                    url: `/viewcount/${video}`
                });
            }
        }
    }, 10000);
});
