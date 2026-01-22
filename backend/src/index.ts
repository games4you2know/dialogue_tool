import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
dotenv.config();

import authRouter from "./routes/auth.js";
import projectRouter from "./routes/project.js";
import projectMemberRouter from "./routes/projectMember.js";
import characterRouter from "./routes/character.js";
import dialogueRouter from "./routes/dialogue.js";
import smsRouter from "./routes/sms.js";
import assetsRouter from "./routes/assets.js";
import backgroundRouter from "./routes/background.js";
import folderRouter from "./routes/folder.js";
import moodRouter from "./routes/mood.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/auth", authRouter);
app.use("/api/projects", projectRouter);
app.use("/api/project-members", projectMemberRouter);
app.use("/api/characters", characterRouter);
app.use("/api/dialogues", dialogueRouter);
app.use("/api/sms", smsRouter);
app.use("/api/assets", assetsRouter);
app.use("/api/backgrounds", backgroundRouter);
app.use("/api/folders", folderRouter);
app.use("/api/moods", moodRouter);

const port = process.env.PORT || 4000;
app.listen(port, ()=>console.log("Server running on", port));
