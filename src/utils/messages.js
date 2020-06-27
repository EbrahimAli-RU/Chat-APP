exports.generateMessage = (username, text) => {
    return {
        username,
        text,
        createdAt : new Date().getTime()
    }
}

exports.generateLocationMessage = (username, location) => {
    return {
        username,
        location,
        createdAt : new Date().getTime()
    }
}

