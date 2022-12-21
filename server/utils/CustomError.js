class CustomError extends Error {
    constructor(message, code) {
        console.log(message);
        super(message)
        this.code = code;
    }


}

module.exports = CustomError;