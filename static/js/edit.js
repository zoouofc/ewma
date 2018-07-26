$(document).ready(function () {
    let deletedAwards = [];
    let deletedSources = [];
    let deletedVideos = [];
    let newSourceID = 0;
    let newVideoID = 0;

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

    $(document).on('click', '.deleteAward', function (e) {
        let award = parseInt($(e.target).attr('award'), 10);
        if (!isNaN(award)) {
            deletedAwards.push(award);
        }
        $(e.target).closest('tr').remove();
    });

    $('#newVideoButton').click(function (e) {
        newVideoID--;
        $(e.target).closest('tr').after(
            $(`<tr data-video-id="${newVideoID}"><td colspan="4" class="tabledivider"><hr /></td></tr>
                <tr data-video-id="${newVideoID}">
                    <td>Video:</td>
                    <td>
                        <input type="text" disabled="disabled" value="${newVideoID}">
                        <input type="button" value="X" data-video-id="${newVideoID}" class="deleteVideo">
                    </td>
                    <td>Video Class:</td>
                    <td>
                        <select name="type" data-video-id="${newVideoID}">
                            <option>primary</option>
                            <option>trailer</option>
                            <option>commentary</option>
                            <option>other</option>
                        </select>
                    </td>
                </tr>
                <tr data-video-id="${newVideoID}">
                    <td>Title:</td>
                    <td><input name="title" data-video-id="${newVideoID}"></td>
                    <td></td>
                    <td>
                        <input type="button" value="Add Source" class="addSource" data-video-id="${newVideoID}" disabled="disabled" title="You need to commit this new video first">
                    </td>
                </tr>
            `)
        );
    });

    $(document).on('click', '.addSource', function(e) {
        let videoID = $(e.target).attr('data-video-id');
        newSourceID--;
        $(e.target).closest('tr').after(
            $(`<tr data-source-id="${newSourceID}" data-video-id="${videoID}">
                    <td colspan="4" class="tabledivider"><hr style="width: 75%"/></td>
                </tr>
                <tr data-source-id="${newSourceID}" data-video-id="${videoID}">
                    <td>Source:</td>
                    <td>
                        <input disabled="disabled" type="text" value="${newSourceID}">
                        <input type="button" value="X" class="deleteSource" data-source-id="${newSourceID}" />
                    </td>
                    <td>Source MIME:</td>
                    <td>
                        <select name="mime" data-source-id="${newSourceID}">
                            <option value="">Select a MIME</option>
                            <option>video/mp4</option>
                            <option>video/webm</option>
                        </select>
                    </td>
                </tr>
                <tr data-source-id="${newSourceID}" data-video-id="${videoID}">
                    <td>Source File:</td>
                    <td>
                        <input type="text" name="file" size="50" data-source-id="${newSourceID}" />
                    </td>
                    <td>Resolution:</td>
                    <td>
                        <select name="resolution" data-source-id="${newSourceID}">
                            <option>Select a Resolution</option>
                            <option>240p</option>
                            <option>360p</option>
                            <option>480p</option>
                            <option>720p</option>
                            <option>1080p</option>
                        </select>
                    </td>
                </tr>
            `)
        );
    });

    $(document).on('click', '.deleteSource', function(e) {
        let id = $(e.target).attr('data-source-id');
        if (parseInt(id) >= 0) {
            deletedSources.push(id);
        }
        $(`tr[data-source-id="${id}"]`).remove();
    });

    $(document).on('click', '.deleteVideo', function(e) {
        let id = $(e.target).attr('data-video-id');
        if (parseInt(id) >= 0) {
            deletedVideos.push(id);
        }
        $(`tr[data-video-id="${id}"][data-source-id]`).each(function(i, e) {
            let id = $(e).attr('data-source-id');
            if (parseInt(id) >= 0) {
                if (deletedSources.indexOf(id) === -1) {
                    deletedSources.push(id);
                }
            }
        });
        $(`tr[data-video-id="${id}"]`).remove();
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

        let videoIds = [];
        $('[data-video-id]').each(function (i, e) {
            let id = $(e).attr('data-video-id');
            if (videoIds.indexOf(id) === -1) {
                videoIds.push(id);
            }
        });

        let videos = {};
        for (let video of videoIds) {
            videos[video] = {
                id: parseInt(video),
                type: $(`[name="type"][data-video-id="${video}"]`).val(),
                title: $(`[name="title"][data-video-id="${video}"]`).val().trim(),
                sources: []
            };
            if (!videos[video].title.length) {
                videos[video].title = null;
            }

            let sourceIds = [];
            $(`[data-video-id="${video}"][data-source-id]`).each(function (i, e) {
                let id = $(e).attr('data-source-id');
                if (sourceIds.indexOf(id) === -1) {
                    sourceIds.push(id);
                }
            });

            for (let source of sourceIds) {
                let file = $(`[name="file"][data-source-id="${source}"]`).val().trim();
                if (!file.length) {
                    alert('Source file is required.');
                    valid = false;
                }

                let mime = $(`[name="mime"][data-source-id="${source}"]`).val();
                let resolution = $(`[name="resolution"][data-source-id="${source}"]`).val();

                if (!mime.length || mime === 'Select a MIME') {
                    mime = null;
                }
                if (!resolution.length || resolution === 'Select a Resolution') {
                    resolution = null;
                }
                videos[video].sources.push({
                    id: parseInt(source),
                    file: file,
                    mime: mime,
                    resolution: resolution
                });
            }
        }

        for (let source of deletedSources) {
            actions._.push([DELETE, 'source', parseInt(source)]);
        }
        for (let video of deletedVideos) {
            actions._.push([DELETE, 'video', parseInt(video)]);
        }

        for (let id in videos) {
            let video = videos[id]
            if (id < 0) {
                // new video
                actions._.push([CREATE, 'video', video.type, video.title]);
            } else {
                if (video.type !== data.videosAndSources[id].type) {
                    actions.video = actions.video || [];
                    actions.video.push([UPDATE, id, 'type', video.type]);
                }
                if (video.title !== data.videosAndSources[id].title) {
                    actions.video = actions.video || [];
                    actions.video.push([UPDATE, id, 'title', video.title]);
                }
                for (let source of video.sources) {
                    if (source.id < 0) {
                        // new source
                        actions._.push([CREATE, 'source', id, source.file, source.mime, source.resolution]);
                    } else {
                        let originalSource;
                        for (let oSource of data.videosAndSources[id].sources) {
                            if (oSource.id === source.id) {
                                originalSource = oSource;
                                break;
                            }
                        }

                        if (source.file !== originalSource.file) {
                            actions.source = actions.source || [];
                            actions.source.push([UPDATE, source.id, 'file', source.file]);
                        }
                        if (source.mime !== originalSource.mime) {
                            actions.source = actions.source || [];
                            actions.source.push([UPDATE, source.id, 'mime', source.mime]);
                        }
                        if (source.resolution !== originalSource.resolution) {
                            actions.source = actions.source || [];
                            actions.source.push(([UPDATE, source.id, 'resolution', source.resolution]));
                        }
                    }
                }
            }
        }

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
