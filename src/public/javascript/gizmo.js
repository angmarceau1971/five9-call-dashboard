
// Handling of queue gizmo widgets
export default function GizmoManager() {
    // Object storing info on filters & names for each gizmo-widget
    this.gizmos = null;
    // ID tracking
    this.lastGizmoId = 0;
    // which gizmo has a menu open?
    this.openGizmoMenu = null;

    this.build = function(id=null) {
        let template = document.getElementById('gizmo-template');
        let gizmo = template.cloneNode(true);

        // update classes to those of a live, wild gizmo
        gizmo.classList.remove('template');
        gizmo.classList.add('gizmo');

        // Create an ID and append to DOM
        if (id == null) {
            id = 'gizmo-' + (this.lastGizmoId+1);
            this.lastGizmoId++;
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
        this.gizmos[openGizmoMenu].name        = name;
        this.gizmos[openGizmoMenu].skillFilter = this.skillStringToArray(skills);
    }

    // Set up menu interactions for a gizmo with the given ID
    this.setupInteractions = function(id) {
        let gizmo = $('#' + id);

        // Skills menu
        gizmo.find('.skills-edit-toggle').click(function (event) {
            // Show the modal...
            $('.modal').css('display', 'block');
            // Track currently open menu...
            this.openGizmoMenu = id;
            // And set modal values to match this gizmo
            $('.modal').find('.gizmo-name').val(this.gizmos[id].name);
            $('.modal').find('.skills').val(this.gizmos[id].skillFilter);
        });

        // Show/hide queue list
        this.gizmos[id].showQueueList = false;
        gizmo.find('.show-skills-list').click(function (event) {
            gizmo.find('.show-skills-list').toggleClass('selected');
            gizmo.find('.queue-list').toggleClass('hidden');
        });
    }

    // set up modal window for editing skills.
    $('.modal').find('.close, .cancel, .save').click(() =>
        $('.modal').css('display', 'none')
    );
    $('.modal').find('.remove').click(() => {
        $('.modal').css('display', 'none');
        remove(this.openGizmoMenu);
    });
    $(window).click((event) => {
        if ($(event.target).is('.modal'))
            $('.modal').css('display', 'none');
    });
    // Listen for skill filter updates
    $('.modal .save').click(() => {
        const name   = $('.modal .gizmo-name').val();
        const skills = $('.modal .skills').val();
        $('#' + this.openGizmoMenu).find('.department-name').html(name);
        this.updateCurrent(name, skills);
        this.save();
    });
    // Listen for add-gizmo button
    $('.add-gizmo').click(() => {
        let newID = this.build();
        // save current state to local storage
        this.save();
    });


    // Save gizmos to local storage
    this.save = function() {
        const data = JSON.stringify(gizmos);
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
                this.lastGizmoId++;
            };
        }
    }


    this.load();
}
