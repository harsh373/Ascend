

import dotenv from "dotenv";
dotenv.config();

import app from "./server";
import {connectDB} from "./config/db";

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    
    await connectDB();

    app.listen(PORT, () => {
      console.log(` Local server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(" Failed to start local server to make :", error);
    process.exit(1);
  }
})();
