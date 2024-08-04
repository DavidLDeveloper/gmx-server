const Header = require("./components/Header")
const Time = require("./components/Time")

function testComponent({title}) {
    return `### test Component: ${title}`
}

module.exports = [Header, testComponent, Time]