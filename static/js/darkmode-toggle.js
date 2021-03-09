function toggleDarkMode(state) {
    if (state) {
        $('body').addClass('dark-theme').removeClass('light-theme');
    } else {
        $('body').removeClass('dark-theme').addClass('light-theme');
    }
}

$(document).ready(function() {
    $('.darkmode-toggle [name="darkmode-toggle"]').click(function() {
        let $this = $(this);

        toggleDarkMode($this.prop('checked'));

        $.ajax({
            url: `/darkmode/${$this.prop('checked') ? 'on' : 'off'}`,
            method: 'POST'
        });
    });
});

toggleDarkMode($('.darkmode-toggle [name="darkmode-toggle"]').prop('checked'));
