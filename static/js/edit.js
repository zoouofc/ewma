$(document).ready(function () {
    let deletedAwards = [];

    $('select[name="themeExisting"]').change((e) => {
        $('[name="themeNew"]').val('');
        if ($(e.target).val() === '-1') {
            $('.themespecify').removeClass('hdn');
        } else {
            $('.themespecify').addClass('hdn');
        }
    });

    $(document).on('click', '.deleteAward', function (e) {
        let award = parseInt($(e.target).attr('award'), 10);
        if (!isNaN(award)) {
            deletedAwards.push(award);
        }
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
                    <input type="text" class="awardName_new" value="" size="50" />
                </td>
                <td>Award Note (On Hover)</td>
                <td>
                    <input type="text" class="awardNote_new" value="" size="50" />
                </td>
            </tr>`)
        );
    });

    $('#submit').click(function (e) {
        // compile the form data into actions
        let actions = {_: []};
        let DELETE = 1;
        let UPDATE = 2;
        let CREATE = 3;
        let valid = true;

        function validateText (key, selector) {
            let val = $(selector || `[name="${key}"]`).val().trim();
            if (!val.length) {
                val = null;
            }
            if (val !== data.movie[key]) {
                actions[key] = [UPDATE, val];
            }
        }

        function validateNum (key, selector) {
            let val = parseInt($(selector || `[name="${key}"]`).val().trim(), 10);
            if (isNaN(val)) {
                val = null;
            }
            if (val !== data.movie[key]) {
                actions[key] = [UPDATE, val];
            }
        }

        validateText('title');
        validateText('dept');
        validateText('src');
        validateText('mime');
        validateNum('rating');
        validateNum('year');

        let theme = $('[name="themeExisting"]').val().trim();
        if (theme === '-1') {
            theme = $('[name="themeNew"]').val().trim();
            if (!theme.length) {
                alert('You must specify a new theme.');
                return;
            }
            if (data.themes.indexOf(theme) === -1) {
                actions._.push([CREATE, 'theme', theme]);
            }
            if (theme !== data.movie.theme) {
                actions.theme = [UPDATE, theme];
            }
        } else {
            if (!theme.length) {
                theme = null;
            }
            if (theme !== data.movie.theme) {
                actions.theme = [UPDATE, theme];
            }
        }

        $('.awardName_new').each(function(i, e) {
            let awardname = $(e).val().trim();
            if (!awardname.length) {
                alert('Alert names cannot be empty');
                valid = false;
            }

            let awardnote = $(e).parent().parent().find('.awardNote_new').val().trim();
            if (!awardnote.length) {
                awardnote = null;
            }
            actions._.push([CREATE, 'award', awardname, awardnote]);
        });

        for (let award of deletedAwards) {
            actions._.push([DELETE, 'award', award]);
        }

        if (valid) {
            // for (let action of actions._) {
            //     if (action[0] === DELETE) {
            //         console.log(`Delete ${action[1]}: ${action[2]}`);
            //     }
            //     if (action[0] === CREATE) {
            //         console.log(`Create ${action[1]}: (${action[2]}) (${action[3]})`);
            //     }
            // }
            // for (let key in actions) {
            //     if (key !== '_' && actions[key][0] === UPDATE) {
            //         console.log(`Update ${key}: (${data.movie[key]}) => (${actions[key][1]})`);
            //     }
            // }
            $('body').append(
                $(`<form id="_form" method="POST" action="${location.pathname.replace(/\/$/, '')}/commit">
                    <input type="hidden" name="payload" />
                </input></form>`)
            );
            $('#_form [name="payload"]').val(JSON.stringify(actions));
            $('#_form').submit();
        }
    });
});
