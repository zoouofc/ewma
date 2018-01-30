$(document).ready(function () {
    let deletedAwards = [];

    function packPayload (payload) {
        for (let prop in payload) {
            if (typeof payload[prop][0] === "object") { // array
                for (let e of payload[prop]) {
                    for (let i = 0; i < e.length; i++) {
                        if (typeof e[i] === 'string') {
                            e[i] = encodeURIComponent(e[i]);
                        }
                    }
                }
            } else {
                for (let i = 0; i < payload[prop].length; i++) {
                    if (typeof payload[prop][i] === 'string') {
                        payload[prop][i] = encodeURIComponent(payload[prop][i]);
                    }
                }
            }
        }

        return JSON.stringify(payload);
    }

    $('select[name="themeExisting"]').change((e) => {
        $('[name="themeNew"]').val('');
        if ($(e.target).val() === '-1') {
            $('.themespecify').removeClass('hdn');
        } else {
            $('.themespecify').addClass('hdn');
        }
    });

    $('input[name="trailer"]').change(() => {
        $('select[name="trailerParent"]').val(-1);
        if ($('input[name="trailer"]:checked').length) {
            $('.trailerspecify').removeClass('hdn');
        } else {
            $('.trailerspecify').addClass('hdn');
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

        if ($('[name="trailer"]:checked').length) {
            let parent = parseInt($('[name="trailerParent"]').val(), 10);
            if (parent === -1 || !parent) {
                alert('You must specify a trailer parent');
                return;
            }
            if (!data.movie.trailer) {
                actions._.push([CREATE, 'trailer', parent]);
            } else if (data.movie.trailer !== parent) {
                actions._.push([DELETE, 'trailer']);
                actions._.push([CREATE, 'trailer', parent]);
            }
        } else {
            if (data.movie.trailer) {
                actions._.push([DELETE, 'trailer']);
            }
        }

        $('.awardName_new').each(function(i, e) {
            let awardname = $(e).val().trim();
            if (!awardname.length) {
                alert('Award names cannot be empty');
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

        $('.awardExist input[type="text"].awardName').each(function(i, e) {
            let awardname = $(e).val().trim();
            let awardnote = $(e).parent().parent().find('.awardNote').val().trim();
            let award = parseInt($(e).attr('award'), 10);

            if (!awardname.length) {
                alert('Award names cannot be empty');
                valid = false;
            };

            if (!awardnote.length) {
                awardnote = null;
            };

            let originalAward = null;
            for (let a of data.awards) {
                if (a.id === award) {
                    originalAward = a;
                    break;
                }
            }
            if (!originalAward) {
                throw new Error('cannot find award');
            }

            if (awardname !== originalAward.name) {
                actions.award = actions.award || [];
                actions.award.push([UPDATE, award, 'name', awardname]);
            }

            if (awardnote !== originalAward.note) {
                actions.award = actions.award || [];
                actions.award.push([UPDATE, award, 'note', awardnote]);
            }
        });

        actions = packPayload(actions);
        if (valid && actions.length && actions !== '{"_":[]}' && actions !== '{}') {
            $('body').append(
                $(`<form id="_form" method="GET" action="${location.pathname.replace(/\/$/, '')}/commit">
                    <input type="hidden" name="payload" />
                </input></form>`)
            );

            $('#_form [name="payload"]').val(actions);
            $('#_form').submit();
        }
    });
});
