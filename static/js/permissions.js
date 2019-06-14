$(document).ready(function() {
    $('.delete-button').click(function() {
        if (confirm('are you sure you wanna delete that, son?')) {
            $.ajax({
                url: '/admin/permissions/delete',
                method: 'POST',
                data: JSON.stringify({
                    permission: $(this).attr('data-permission')
                }),
                contentType: 'application/json',
                error: function() {
                    alert('error');
                },
                success: function() {
                    window.location.reload();
                }
            });
        }
    });
});