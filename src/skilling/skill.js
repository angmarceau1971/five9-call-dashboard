const five9 = require('../helpers/five9-interface');


/**
 * Update User Profile with selected skills.
 * @param  {String} addSkills       skills to add, comma-seperated
 * @param  {String} removeSkills    skills to remove, comma-seperated
 * @param  {String} userProfileName profile being modified
 * @return {Promise}                Resolves to Five9 response
 */
async function modifyUserProfile(addSkills, removeSkills, userProfileName) {
    // Set up request parameters
    let parameters = five9.getParameters('modifyUserProfileSkills');
    if (addSkills) {
        parameters = five9.addSetting(parameters,
            { 'addSkills': addSkills });
    }
    if (removeSkills) {
        parameters = five9.addSetting(parameters,
            { 'removeSkills': removeSkills });
    }
    parameters = five9.addSetting(parameters,
        {'userProfileName': userProfileName});

    // Make request
    return five9.request(parameters, 'configuration');
}

module.exports.modifyUserProfile = modifyUserProfile;
