import * as api from './api';

// Handling of queue gizmo widgets.
// Manages state and DOM (modals to edit skills & name).
export default function GizmoManager() {
    // Object storing info on filters & names for each gizmo-widget
    this.gizmos = null;
    // which gizmo has a menu open?
    this.openGizmoId = null;
    // skill groups and associated skills
    this.skillGroups = [];

    this.build = function(id=null) {
        let template = document.getElementById('gizmo-template');
        let gizmo = template.cloneNode(true);

        // update classes to those of a live, wild gizmo
        gizmo.classList.remove('template');
        gizmo.classList.add('gizmo');

        // Create an ID and append to DOM
        if (id == null) {
            id = this.nextGizmoId();
        }
        gizmo.id = id;
        $('.gizmo-wrapper').append(gizmo);

        // Add to gizmos object, but don't overwrite existing ones
        if (!this.gizmos[id]) {
            this.gizmos[id] = {
                name: 'New one!',
                skillFilter: [],
                useSkillGroupFilter: true,
                skillGroupFilter: [],
            }
        }
        // set name for DOM
        $(gizmo).find('.department-name').html(this.gizmos[id].name);

        return id;
    }

    this.remove = function(gizmoID) {
        document.getElementById(gizmoID).remove();
        delete this.gizmos[gizmoID];
        this.save();
    }

    // Which gizmo is currently edited in the skill menu? This function will
    // update that gizmo's attributes.
    this.updateCurrent = function(name, skills, skillGroups, useSkillGroupFilter) {
        this.gizmos[this.openGizmoId].name        = name;
        this.gizmos[this.openGizmoId].skillFilter = skillStringToArray(skills);
        this.gizmos[this.openGizmoId].useSkillGroupFilter = useSkillGroupFilter;
        if (useSkillGroupFilter) {
            this.gizmos[this.openGizmoId].skillGroupFilter = [skillGroups];
        } else {
            this.gizmos[this.openGizmoId].skillGroupFilter = [];
        }
    }

    // Set up DOM and menu interactions for gizmo with the given ID
    this.setupInteractions = function(id) {
        let gizmo = $('#' + id);
        let selectedGizmo = this.gizmos[id];

        // Open skills modal
        gizmo.find('.skills-edit-toggle').click(function (event) {
            // Show the modal...
            $('.modal').css('display', 'block');
            // Track currently open menu...
            this.openGizmoId = id;
            // And set modal values to match this gizmo
            $('.modal').find('.gizmo-name').val(selectedGizmo.name);
            $('.modal').find('.skills').val(selectedGizmo.skillFilter);

            // use Skill Groups UI if needed
            if (selectedGizmo.useSkillGroupFilter) {
                $('.modal').find('#skill-filter-group-radio').prop('checked', true);
                $('.modal').find('.skills').attr('disabled', true);
                $('.modal').find('.skill-groups').removeAttr('disabled');
            } else {
                $('.modal').find('#skill-filter-list-radio').prop('checked', true);
                $('.modal').find('.skill-groups').attr('disabled', true);
                $('.modal').find('.skills').removeAttr('disabled');
            }
            // Skill list/group radio buttons
            $("input[name='skill-filter-type']").change(function (e) {
                if ($(this).val() == 'skill-group') {
                    $('.modal').find('.skills').attr('disabled', true);
                    $('.modal').find('.skill-groups').removeAttr('disabled');
                } else {
                    $('.modal').find('.skill-groups').attr('disabled', true);
                    $('.modal').find('.skills').removeAttr('disabled');
                }
            });

            // build skill group select list
            let selectedSkillGroup = (selectedGizmo.skillGroupFilter || []).length ? selectedGizmo.skillGroupFilter[0] : null
            let skillGroupSelect = $('.modal').find('.skill-groups').empty();
            function makeOption(val, text) {
                skillGroupSelect.append($(
                    `<option ${val === selectedSkillGroup ? 'selected' : '' }></option>`
                ).attr('value', val).text(text));
            };
            makeOption('null_perspiration', 'Select a skill group');
            for (let skillGroup of this.skillGroups) {
                makeOption(skillGroup.name, skillGroup.name);
            }

            // Sync Skills List text with selected skill group
            skillGroupSelect.on('change', function(e) {
                let name = e.target.value;
                let newGroup = this.skillGroups.find((group) => group.name === name);
                $('.modal').find('.skills').val(newGroup.skills)
            }.bind(this));
        }.bind(this));

        // Show/hide queue list
        selectedGizmo.showQueueList = false;
        gizmo.find('.show-skills-list').click(function (event) {
            gizmo.find('.show-skills-list').toggleClass('selected');
            gizmo.find('.queue-list').toggleClass('hidden');
        }.bind(this));
    }

    // Get a new ID string in the form 'gizmo-<integer>'
    this.nextGizmoId = function() {
        if (!this.gizmos) return 'gizmo-0';

        let currentIdNumbers = Object.keys(this.gizmos)
            .map((id) => id.split('-')[1])
            .filter((num) => !isNaN(num));

        let lastId = Math.max(...currentIdNumbers);
        return `gizmo-${lastId + 1}`;
    };

    // set up modal window for editing skills.
    $('.modal').find('.close, .cancel, .save').click(function closeModal() {
        $('.modal').css('display', 'none')
    });
    $('.modal').find('.remove').click(function deleteGizmo() {
        $('.modal').css('display', 'none');
        this.remove(this.openGizmoId);
    }.bind(this));
    $(window).click(function closeModal(event) {
        if ($(event.target).is('.modal'))
            $('.modal').css('display', 'none');
    }.bind(this));

    // Listen for skill filter updates
    $('.modal .save').click(function updateSkillFilter() {
        const isUsingSkillGroups = $('input[name=skill-filter-type]:checked').val() === 'skill-group';
        const name   = $('.modal .gizmo-name').val();
        const skills = $('.modal .skills').val();
        const skillGroups = $('.modal .skill-groups').val();

        $('#' + this.openGizmoId).find('.department-name').html(name);
        this.updateCurrent(name, skills, skillGroups, isUsingSkillGroups);
        this.save();
    }.bind(this));

    // On cancel, revert to last saved/cached state
    $('.modal .cancel').click(function() {
        this.load(false);
    }.bind(this));

    // Listen for add-gizmo button
    $('.add-gizmo').click(function addGizmo() {
        let newId = this.build();
        this.setupInteractions(newId);
        // save current state to local storage
        this.save();
    }.bind(this));

    $('.edit-buttons .reset-gizmos').click(function() {
        $('.message').html(`
            <p>
            Are you sure you want to reset all widgets to defaults?
            <div>
                <button id="reset-gizmos-yes" class="rectangle-button" width="50">Reset</button>
                <button id="reset-gizmos-no" class="rectangle-button" width="50">Cancel</button>
            </div>
            </p>
        `);
        $('#reset-gizmos-yes').click(async function() {
            this.skillGroups = await api.getSkillGroups();
            this.setupDefaultGizmos();
            $('.gizmo').remove();
            this.save();
            this.load(true);
            $('.message').empty();
            setTimeout(() => $('.play-pause').trigger('click'), 1000);
            setTimeout(() => $('.play-pause').trigger('click'), 1500);
        }.bind(this));
        $('#reset-gizmos-no').click(async function() {
            $('.message').empty();
        }.bind(this));
    }.bind(this));


    // Save gizmos to local storage
    this.save = function() {
        const data = JSON.stringify(this.gizmos);
        localStorage.setItem('user_gizmos', data);
    }

    // Set up default gizmos from server's skill groups
    this.setupDefaultGizmos = function() {
        let i = 0;
        this.gizmos = this.skillGroups.reduce((res, skillGroup) => {
            res[`gizmo-${i++}`] = {
                name: skillGroup.name,
                queueList: [],
                showQueueList: false,
                skillFilter: skillGroup.skills,
                useSkillGroupFilter: true,
                skillGroupFilter: [skillGroup.name],
            };
            return res;
        }, {});
    }

    // Load gizmos from local storage on startup
    this.load = async function(rebuildDom) {
        let data = localStorage.getItem('user_gizmos');
        this.skillGroups = await api.getSkillGroups();
        if (!data) {
            this.setupDefaultGizmos();
            console.log('Loading default gizmos:', this.gizmos);
        } else {
            this.gizmos = JSON.parse(data);
            console.log('Loading saved gizmos:', this.gizmos);
        }
        // Build view
        for (const id of Object.keys(this.gizmos)) {
            if (rebuildDom) {
                this.build(id);
            }
            this.setupInteractions(id);
        };
    }
}

// Breaks down "skill1, skill2 , skill3" string
//          to ['skill1','skill2','skill3'] array
function skillStringToArray(skillString) {
    if (skillString == '') return [];
    return skillString.split(',').map((skill) => skill.trim());
}
