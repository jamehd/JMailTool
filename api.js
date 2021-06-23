const fetch = require('node-fetch');

function receivedJob(currJobId) {
    console.log("receivedJob: ", currJobId);
    let apiUrl = 'http://localhost:3000/job/received';
    fetch(apiUrl, {
        method: 'POST',
        headers: { "Content-type": "application/json;charset=UTF-8" },
        body: JSON.stringify({
            JobId: currJobId
        })
    })
        .then(response => {
            return response.json();
        })
        .then(data => {
            console.log(data);
        })
        .catch(err => {
        });
}
function finishedJobSuccess(currJobId) {
    console.log("finishedJobSuccess");
    let apiUrl = 'http://localhost:3000/job/finished';
    fetch(apiUrl, {
        method: 'POST',
        headers: { "Content-type": "application/json;charset=UTF-8" },
        body: JSON.stringify({
            "JobId": currJobId,
            "Status": "Success"
        })
    })
        .then(response => {
            return response.json();
        })
        .then(data => {
            console.log(data);
        })
        .catch(err => {
        });
}
function finishedJobFailed(currJobId) {
    console.log("loadCurrentJob");
    let apiUrl = 'http://localhost:3000/job/finished';
    fetch(apiUrl, {
        method: 'POST',
        headers: { "Content-type": "application/json;charset=UTF-8" },
        body: JSON.stringify({
            "JobId": currJobId,
            "Status": "Failed"
        })
    })
        .then(response => {
            return response.json();
        })
        .then(data => {
            console.log(data);
        })
        .catch(err => {
        });
}

module.exports = {
    receivedJob,
    finishedJobSuccess,
    finishedJobFailed
}