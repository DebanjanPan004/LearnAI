import dotenv from "dotenv";
import { createApp } from "./app.js";
import { connectDatabase } from "./config/database.js";

dotenv.config();

const port = Number(process.env.PORT ?? 5000);

await connectDatabase();

createApp().listen(port, () => {
  console.log(`LearnAI API running on port ${port}`);
});

