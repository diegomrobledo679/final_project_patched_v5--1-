import dotenv from "dotenv";
import { main } from "./main.js";
dotenv.config();
main().catch((error) => {
    console.error(`An error occurred in main: ${error.message}`);
});
