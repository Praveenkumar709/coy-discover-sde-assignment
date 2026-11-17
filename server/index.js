import express from "express";
import cors from "cors";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const profiles = JSON.parse(fs.readFileSync(path.join(__dirname, "profiles.json"), "utf8"));
const DATA_FILE = path.join(__dirname, "data.json");
app.use(cors());
app.use(express.json());

function readData() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, "utf8")); }
  catch { return { swipes: [], matches: [] }; }
}
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}
function publicProfile(p) {
  const { likedYou, ...safe } = p;
  return safe;
}

app.get("/health", (_req, res) => res.json({ ok: true }));
app.get("/feed", (_req, res) => {
  const data = readData();
  const swiped = new Set(data.swipes.map(s => s.profileId));
  const feed = profiles.filter(p => !swiped.has(p.id)).map(publicProfile);
  res.json(feed);
});
app.post("/swipe", (req, res) => {
  const { profileId, action } = req.body || {};
  if (!profileId || !["like", "pass"].includes(action))
    return res.status(400).json({ error: "profileId and action ('like' or 'pass') are required." });
  const profile = profiles.find(p => p.id === profileId);
  if (!profile) return res.status(404).json({ error: "Profile not found." });

  const data = readData();
  if (data.swipes.some(s => s.profileId === profileId))
    return res.status(409).json({ error: "You have already swiped on this profile." });

  data.swipes.push({ profileId, action, createdAt: new Date().toISOString() });
  const isMatch = action === "like" && profile.likedYou === true;
  if (isMatch && !data.matches.includes(profileId)) data.matches.push(profileId);
  writeData(data);
  res.json({ success: true, matched: isMatch, match: isMatch ? publicProfile(profile) : null });
});
app.get("/matches", (_req, res) => {
  const data = readData();
  const matches = data.matches.map(id => profiles.find(p => p.id === id)).filter(Boolean).map(publicProfile);
  res.json(matches);
});
app.listen(PORT, () => console.log(`Coy API running at http://localhost:${PORT}`));
