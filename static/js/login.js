$(document).ready(function () {
    $('input').on('keydown', function (e) {
        if (e.which === 13 && $('#username').val().length && $('#password').val().length) {
            $('#login').submit()
        }
    });
});
