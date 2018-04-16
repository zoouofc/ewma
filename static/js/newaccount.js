$(document).ready(function() {
    $('#createForm input[type="password"]').change((e) => {
        let form = $('#createForm');
        let pass1 = form.find('#password'), pass2 = form.find('#passwordConfirm');

        if (pass1.val() !== pass2.val()) {
            pass1[0].setCustomValidity('Passwords must be matching');
        } else {
            pass1[0].setCustomValidity('');
        }
    });
});
