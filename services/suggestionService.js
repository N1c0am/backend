const { app } = require('../langgraph/graph');
const { getLogById } = require('../services/logService');
const Suggestion  = require('../models/suggestion');

const suggestionReport = async (id, owner, repo, branch = 'main') => {
    const log = await getLogById(id);

    log.id = log.id.toString();
    
    if(!log.error_signature){
        log.error_signature = log.message.split(":")[0];
        console.log("No error signature found", log);
    }
    
    const input = {
        sentry_log: log,
        owner: owner,
        repo: repo,
        branch: branch,
    };

    const result = await app.invoke(input);

    return result.report
    
}

const getReportByLog = async (logId) => {
    const suggestion = await Suggestion.findOne({ logId });

    if (!suggestion) {
        return null;
    }
    return {
            id: suggestion._id,
            report: suggestion.report,
            log: suggestion.logId,
            created_at: suggestion.created_at
    };
}


module.exports = { suggestionReport, getReportByLog }