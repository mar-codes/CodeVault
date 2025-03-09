import mongoose from 'mongoose';

const MONGOURL = process.env.MONGOURL;

if (!MONGOURL) {
  throw new Error('Please define the MONGOURL environment variable');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGOURL)
      .then(mongoose => {
        console.log('Connected to MongoDB');
        return mongoose;
      });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;