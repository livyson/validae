const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

let isConnected;

module.exports.connect = async () => {
    if (isConnected) {
        return isConnected;
    }

    const DATABASE_URL =
        process.env.NODE_ENV === "test" ?
        process.env.TEST_DATABASE_URL :
        process.env.DATABASE_URL;

    try {
        const databaseInstace = await mongoose.connect(DATABASE_URL);
        isConnected = databaseInstace;
        return databaseInstace;
    } catch (e) {
        console.log(e);
        throw e;
    }
};

module.exports.disconnect = async (instance) => {
    await instance.disconnect();
    isConnected = false;
};