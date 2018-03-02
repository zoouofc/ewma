let playingMovies = {},
    submittedMovies = [];

Object.defineProperty(HTMLMediaElement.prototype, 'playing', {
    get: function(){
        return !!(this.currentTime > 0 && !this.paused && !this.ended && this.readyState > 2);
    }
});


$(document).ready(function() {
    setInterval(function() {
        $(`video[data-movie-id]`).each(function (index, element) {
            if (element.playing) {
                let movie = $(element).attr('data-movie-id');
                if (submittedMovies.indexOf(movie) === -1) {
                    if (movie in playingMovies) {
                        playingMovies[movie]++;
                        console.log(`${movie} has been playing for ${playingMovies[movie] * 10}s`);
                    } else {
                        console.log(`Started playing ${movie}`);
                        playingMovies[movie] = 1;
                    }
                }
            }
        });

        for (let movie in playingMovies) {
            if (!document.querySelector(`video[data-movie-id="${movie}"]`).playing) {
                // movie's not playing.
                delete playingMovies[movie];
                console.log(`${movie} stopped playing`);
            } else if (submittedMovies.indexOf(movie) === -1 && playingMovies[movie] > 3) {
                // we've been watching this movie for more than 30 seconds straight
                // and haven't submitted it yet.
                submittedMovies.push(movie);
                delete playingMovies[movie];
                $.ajax({
                    method: 'POST',
                    url: `/viewcount/${movie}`
                });
            }
        }
    }, 10000);
});
