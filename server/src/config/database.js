const mongoose = require('mongoose');
require('colors');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`\nMongoDB Connection Established Successfully`.cyan.bold);
        console.log(`------------------------------------------------`.gray);
        console.log(`Connection Status : `.white + `Connected`.green.bold);
        console.log(`Database Host     : `.white + `${conn.connection.host}`.yellow);
        console.log(`Database Port     : `.white + `${conn.connection.port}`.yellow);
        console.log(`Database Name     : `.white + `${conn.connection.name}`.yellow);
        console.log(`------------------------------------------------\n`.gray);
    } catch (error) {
        console.error(`Error: ${error.message}`.red.bold);
        process.exit(1);
    }
};

module.exports = connectDB;