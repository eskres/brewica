import mongoose = require('mongoose');
import { MongoMemoryServer } from 'mongodb-memory-server';

let con: mongoose.Connection;
let mongoServer: MongoMemoryServer;

export const connectDB = async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri(), {});
    con = mongoose.connection;
};

export const dropDB = async () => {
    if (mongoServer) {        
        await con.dropDatabase();
        await con.close();
        await mongoServer.stop();
    }
};

export const dropCollections = async () => {
    if (mongoServer) {

        const collections = mongoose.connection.db.collections;
        for (const key in collections) {
            const collection = collections[key];
            await collection.deleteMany();
        }

        // const collections = await con.db.listCollections().toArray();
        // collections.map((collection) => collection.name)
        // .forEach(async (collectionName) => {
        //     console.log(collections);
        //     con.db.dropCollection(collectionName);
        //     console.log(collections);
        // });

    }
};

// let con: mongoose.Connection;
// let mongoServer: MongoMemoryServer;

// beforeAll(async () => {
//     mongoServer = await MongoMemoryServer.create();
//     await mongoose.connect(mongoServer.getUri(), {});
//     con = mongoose.connection;
//     return async () => {
//         if (con) {
//             await con.close();
//         }
//         if (mongoServer) {
//             await mongoServer.stop();           
//         }
//     }
// });