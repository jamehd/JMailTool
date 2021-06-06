const timeStep = 3000
const timeReadEmail = 5000
const delay = function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
};

const delayStep = () => {
    return delay(timeStep);
};

const delayReadMail = () => {
    return delay(timeReadEmail);
};

module.exports = {
    delay,
    delayStep,
    delayReadMail
}