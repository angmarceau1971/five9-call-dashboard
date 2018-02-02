const five9 = require('../helpers/five9-interface');

/**
 * Update User Profile with selected skills.
 * @param  {Array} addSkills        skills to add
 * @param  {Array} removeSkills     skills to remove
 * @param  {String} userProfileName profile being modified
 * @return {Promise}                Resolves to Five9 response
 */
async function modifyUserProfile(addSkills, removeSkills, userProfileName) {
    // Set up request parameters
    let parameters = five9.getParameters('modifyUserProfileSkills');
    let skillList = formatToJson(addSkills, userProfileName, 'addSkills')
            .concat(formatToJson(removeSkills, userProfileName, 'removeSkills'));

    parameters.settings = skillList;

    // Make request
    let response = await five9.request(parameters, 'configuration');
    return response;
}
module.exports.modifyUserProfile = modifyUserProfile;


/**
 * Takes an array of skills and returns formatted JSON to XML-ify for Five9
 * @param  {Array}  skills list of skills to add or remove
 * @param  {String} userProfile being modified
 * @param  {String} action should be either `addSkills` or `removeSkills`
 * @return {Object}        JSON to process into XML Five9 request
 */
function formatToJson(skills, userProfile, action) {
    return skills.reduce((newList, skill) => {
        if (skill == '') return newList;
        return newList.concat([{ userProfileName: userProfile}, {[action]: skill }])
    }, []);
}
