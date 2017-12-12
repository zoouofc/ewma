$(document).ready(function () {
    $('#username').focus();
    $('input').on('keydown', function (e) {
        if (e.which === 13 && $('#username').val().length && $('#password').val().length) {
            $('#login').submit();
        }
    });
});
