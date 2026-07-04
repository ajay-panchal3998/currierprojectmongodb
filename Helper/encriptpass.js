const bcrypt = require('bcrypt');

const encryptPassword = async (password) => {
    try {
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(password, salt)
        return hash;
    } catch (err) {
        throw new Error(err);
    }
}

const decryptPassword = async (password, confirmPassword) => {
    try {
        return await bcrypt.compare(password, confirmPassword)
    } catch (err) {
        return false;
    }
}

const genUserId = async () => {
    const prefix = "USR";

    // random number + timestamp for uniqueness
    const random = Math.floor(100000 + Math.random() * 900000);
    const time = Date.now().toString().slice(-5);

    return `${prefix}${time}${random}`;
};

module.exports = {
    encryptPassword,
    decryptPassword,
    genUserId
}