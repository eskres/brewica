import * as mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let con: mongoose.Connection;
let mongoServer: MongoMemoryServer;

export const connectDB = async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), {});
  con = mongoose.connection;
};

export const dropDB = async () => {
  if (mongoServer && con) {
    await con.dropDatabase();
    await con.close();
    await mongoServer.stop();
    await mongoose.disconnect();
  }
};

export const dropCollections = async () => {
  if (mongoServer && con) {
    const collections = con.collections;
    for (const key in collections) {
      const collection = collections[key];
      if (collection != undefined) {
        collection.deleteMany({});
      }
    }
  }
};
