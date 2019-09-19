import * as api from './api';

const SKILL_GROUP_NULL_VAL = 'no_skill_group_selected'; // null perspiration
// Chat is hardcoded to accept different data feed. TODO: make this less reliant
// on front-end.
const CHAT_SKILL_GROUP = {
    agentGroups: ['Chat'],
    name: 'Chat',
    skills: ['Chat'],
};

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
        this.save(this.gizmos);
    }

    // Updates the gizmo that is currently being edited
    this.updateCurrent = function(name, skills, skillGroup, useSkillGroupFilter) {
        this.gizmos[this.openGizmoId].name        = name;
        this.gizmos[this.openGizmoId].useSkillGroupFilter = useSkillGroupFilter;
        if (useSkillGroupFilter) {
            this.gizmos[this.openGizmoId].skillGroupFilter = [skillGroup];
            let group = this.skillGroups.find((group) => group.name === skillGroup);
            this.gizmos[this.openGizmoId].skillFilter = group.skills;
        } else {
            this.gizmos[this.openGizmoId].skillFilter = skillStringToArray(skills);
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
            $('.modal-message').text('');
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

            // build (or rebuild) skill group select list
            let selectedSkillGroup = (selectedGizmo.skillGroupFilter || []).length ? selectedGizmo.skillGroupFilter[0] : null
            let skillGroupSelect = $('.modal').find('.skill-groups').empty();
            function makeOption(val, text) {
                skillGroupSelect.append($(
                    `<option ${val === selectedSkillGroup ? 'selected' : '' }></option>`
                ).attr('value', val).text(text));
            };
            makeOption(SKILL_GROUP_NULL_VAL, 'Select a skill group');
            for (let skillGroup of this.skillGroups) {
                makeOption(skillGroup.name, skillGroup.name);
            }

            // Sync Skills List text with selected skill group
            skillGroupSelect.on('change', function(e) {
                let name = e.target.value;
                let newGroup = this.skillGroups.find(
                    (group) => group.name === name,
                );
                if (newGroup) {
                    $('.modal').find('.skills').val(newGroup.skills);
                }
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
    $('.modal').find('.close, .cancel').click(function closeModal() {
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

        // prevent saving if "Select a skill group" is selected
        if (isUsingSkillGroups && skillGroups === SKILL_GROUP_NULL_VAL) {
            $('.modal-message').text('Please select a Skill Group or list of skills.');
            return;
        }
        $('.modal').css('display', 'none');

        $('#' + this.openGizmoId).find('.department-name').html(name);
        this.updateCurrent(name, skills, skillGroups, isUsingSkillGroups);
        this.save(this.gizmos);
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
        this.save(this.gizmos);
    }.bind(this));

    $('.edit-buttons .reset-gizmos').click(function() {
        $('.message').html(`
            <p>
            Are you sure you want to reset all widgets to defaults?
            <div>
                <button id="reset-gizmos-yes" class="rectangle-button">Reset</button>
                <button id="reset-gizmos-no" class="rectangle-button">Cancel</button>
            </div>
            </p>
        `);
        $('#reset-gizmos-yes').click(async function() {
            await this.loadSkillGroups();
            this.setupDefaultGizmos();
            $('.gizmo').remove();
            this.save(this.gizmos);
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
    this.save = function(gizmos) {
        const data = JSON.stringify(gizmos);
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

    // Update `gizmos` so that the skills for any gizmos with set Skill Groups
    // are correct. Assumes `this.skillGroups` is up-to-date.
    this.syncSkillGroups = function(gizmos) {
        let isChanged = false;
        for (let gizmo of Object.values(gizmos)) {
            if (gizmo.useSkillGroupFilter && (gizmo.skillGroupFilter || []).length > 0) {
                let name = gizmo.skillGroupFilter[0];
                let skillGroup = this.skillGroups.find((group) => group.name === name);
                if (!skillGroup) {
                    console.error(`No skill group named "${name}" found while syncing skills.`);
                    continue;
                }
                gizmo.skillFilter = skillGroup.skills;
                isChanged = true;
            }
        }
        if (isChanged) {
            console.info(`Gizmo skill filters have been synced. Saving any changes.`)
            this.save(gizmos);
        }
        return gizmos;
    }

    this.loadSkillGroups = async function() {
        this.skillGroups = await api.getSkillGroups();
        this.skillGroups.push(CHAT_SKILL_GROUP);
    }

    // Load gizmos from local storage on startup
    this.load = async function(rebuildDom) {
        let data = localStorage.getItem('user_gizmos');
        await this.loadSkillGroups();
        console.info('Skill Groups:', this.skillGroups);
        if (!data || !JSON.parse(data)) {
            this.setupDefaultGizmos();
            console.info('Loading default gizmos:', this.gizmos);
        } else {
            this.gizmos = this.syncSkillGroups(JSON.parse(data));
            console.info('Loading saved gizmos:', this.gizmos);
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
