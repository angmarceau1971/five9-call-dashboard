
// Handling of queue gizmo widgets
export default function GizmoManager() {
    // Object storing info on filters & names for each gizmo-widget
    this.gizmos = null;
    // which gizmo has a menu open?
    this.openGizmoId = null;

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
                skillFilter: []
            }
        }
        // set name for DOM
        $(gizmo).find('.department-name').html(this.gizmos[id].name);

        this.setupInteractions(id);
        return id;
    }

    this.remove = function(gizmoID) {
        document.getElementById(gizmoID).remove();
        delete this.gizmos[gizmoID];
        this.save();
    }

    // Which gizmo is currently edited in the skill menu? This function will
    // update that gizmo's attributes.
    this.updateCurrent = function(name, skills) {
        this.gizmos[this.openGizmoId].name        = name;
        this.gizmos[this.openGizmoId].skillFilter = skillStringToArray(skills);
    }

    // Set up menu interactions for a gizmo with the given ID
    this.setupInteractions = function(id) {
        let gizmo = $('#' + id);

        // Skills menu
        gizmo.find('.skills-edit-toggle').click(function (event) {
            // Show the modal...
            $('.modal').css('display', 'block');
            // Track currently open menu...
            this.openGizmoId = id;
            // And set modal values to match this gizmo
            $('.modal').find('.gizmo-name').val(this.gizmos[id].name);
            $('.modal').find('.skills').val(this.gizmos[id].skillFilter);
        }.bind(this));

        // Show/hide queue list
        this.gizmos[id].showQueueList = false;
        gizmo.find('.show-skills-list').click(function (event) {
            gizmo.find('.show-skills-list').toggleClass('selected');
            gizmo.find('.queue-list').toggleClass('hidden');
        }.bind(this));
    }

    // Get a new ID string in the form 'gizmo-<integer>'
    this.nextGizmoId = function() {
        if (!this.gizmos) return 'gizmo-0';
        let lastId = Math.max(
            ...Object.keys(this.gizmos).map((id) =>
                id.split('-')[1]
            )
        );
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
        const name   = $('.modal .gizmo-name').val();
        const skills = $('.modal .skills').val();
        $('#' + this.openGizmoId).find('.department-name').html(name);
        this.updateCurrent(name, skills);
        this.save();
    }.bind(this));
    // Listen for add-gizmo button
    $('.add-gizmo').click(function addGizmo() {
        let newID = this.build();
        // save current state to local storage
        this.save();
    }.bind(this));


    // Save gizmos to local storage
    this.save = function() {
        const data = JSON.stringify(this.gizmos);
        localStorage.setItem('user_gizmos', data);
    }

    // Load gizmos from local storage on startup
    this.load = function() {
        let data = localStorage.getItem('user_gizmos');
        if (!data) {
            this.gizmos = {};
        } else {
            this.gizmos = JSON.parse(data);
            console.log('Loading gizmos:', this.gizmos);
            // Build view
            for (const id of Object.keys(this.gizmos)) {
                this.build(id);
            };
        }
    }

    this.load();
}

// Breaks down "skill1, skill2 , skill3" string
//          to ['skill1','skill2','skill3'] array
function skillStringToArray(skillString) {
    if (skillString == '') return [];
    return skillString.split(',').map((skill) => skill.trim());
}
