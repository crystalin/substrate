const succeedExit = function () {
    process.exit(0)
}

const errorExit = function (err) {
    console.log(err)
    process.exit(1)
}

module.exports = {succeedExit, errorExit}