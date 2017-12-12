$(document).ready(function () {
    $('select[name="themeExisting"]').change((e) => {
        $('[name="themeNew"]').val('');
        if ($(e.target).val() === '-1') {
            $('.themespecify').removeClass('hdn');
        } else {
            $('.themespecify').addClass('hdn');
        }
    });

    $(document).on('click', '.deleteAward', function (e) {
        $(e.target).closest('tr').remove();
    });

    $('#newAwardButton').click(function (e) {
        $(e.target).closest('tr').after(
            $(`<tr>
                <td>
                    <input type="button" class="deleteAward" value="X" />
                    Award Name:
                </td>
                <td>
                    <input type="text" name="awardName_new" value="" size="50" />
                </td>
                <td>Award Note (On Hover)</td>
                <td>
                    <input type="text" name="awardNote_new" value="" size="50" />
                </td>
            </tr>`)
        );
    });
});
