import mongoose from "mongoose";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var __mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.__mongooseCache ?? { conn: null, promise: null };
global.__mongooseCache = cached;

/**
 * Connects to MongoDB using a cached connection across hot-reloads / serverless
 * invocations. Throws a clear error if MONGODB_URI is not configured so pages
 * fail loudly in development instead of hanging.
 */
export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  // Read from process.env at call time (not module load time) so this works
  // correctly both in Next.js (env already loaded before any module runs)
  // and in standalone scripts that load .env.local via dotenv before calling
  // connectDB() — reading it into a top-level const would capture `undefined`
  // in the latter case whenever imports get hoisted above the dotenv call.
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is not set. Add it to your .env.local file (see .env.example)."
    );
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}

export default connectDB;
