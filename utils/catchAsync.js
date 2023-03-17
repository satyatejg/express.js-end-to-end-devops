module.exports = func => {
    return (req, res, next) => {
       func(req, res, next).catch(next)
    }
}

// This is the parent function that wraps around all our async functions. 