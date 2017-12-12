$(document).ready(() => {
    $('select[name="movie"]').change((e) => {
        if ($(e.target).val() !== '-1') {
            $('input[type="button"]').prop('disabled', false);
        }
    });

    $('input[type="button"]').click(() => {
        location.href = `/admin/edit/${$('select[name="movie"]').val()}`;
    });
});
