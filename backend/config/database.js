import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "./config.env" });

export async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: process.env.DB_NAME || "Herbal_Garden", // fallback if not in URI
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log("Database Name:", conn.connection.db.databaseName);

    // Debug: list collections only in development mode
    if (process.env.NODE_ENV === "development") {
      const collections = await conn.connection.db.listCollections().toArray();
      console.log(
        "Available collections:",
        collections.map((c) => c.name)
      );
    }
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
}
