import dotenv from "dotenv";
import { main } from "./main.js";

dotenv.config();

main().catch((error: Error) => {
  console.error(`An error occurred in main: ${error.message}`);
});
