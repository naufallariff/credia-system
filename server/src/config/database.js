const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // 1. Mencoba menghubungi MongoDB
        const conn = await mongoose.connect(process.env.MONGO_URI);

        // 2. Jika berhasil, tampilkan host-nya (tanda sukses)
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        // 3. Jika gagal (misal salah password/docker mati), matikan server
        console.error(`❌ Error: ${error.message}`);
        process.exit(1); // Exit code 1 artinya "Keluar dengan Error"
    }
};

module.exports = connectDB;