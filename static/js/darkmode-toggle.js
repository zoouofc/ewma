$(document).ready(function() {
    $('.darkmode-toggle [name="darkmode-toggle"]').click(function() {
        let $this = $(this);

        $.ajax({
            url: `/darkmode/${$this.prop('checked') ? 'on' : 'off'}`,
            method: 'POST'
        });
    });
});
