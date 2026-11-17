# Coy — Discover Tab (SDE Intern Assignment)

A standalone, mobile-first swipe discovery app built with React, Vite, Node.js and Express. It uses a local JSON file for persistence and assumes one logged-in demo user.

## Features
- Home placeholder and Discover tab
- 30 seeded mock profiles with photo, age, bio, city/college and interests
- Right swipe / Like and left swipe / Pass (drag on touch or mouse; buttons also available)
- A profile disappears permanently after a swipe
- Mutual matches only; the API never returns the `likedYou` flag
- Match popup and Matches view
- Persistent swipes and matches in `server/data.json`
- Empty feed state

## Requirements
Node.js 18+ and npm.

## Run locally
Open a terminal in the project root:

```bash
npm install
npm run install:all
npm run dev
```

Open **http://localhost:5173**. The API runs at **http://localhost:5000**.

If the root `npm install` does not install the root dev dependency, run `npm install` once more before `npm run dev`.

## API
- `GET /feed` — profiles not yet swiped on
- `POST /swipe` — body: `{ "profileId": "p01", "action": "like" }` or `pass`
- `GET /matches` — mutual matches only
- `GET /health` — health check

## Demoing matches
Some seeded profiles have `likedYou: true` in `server/profiles.json`. That private field is deliberately removed from all feed and match responses. Like one of those profiles to trigger a match. Do not add a `likedYou` indicator to the UI: Coy's privacy promise is that incoming likes are not revealed unless mutual.

To reset the demo, stop the server and replace the contents of `server/data.json` with:

```json
{ "swipes": [], "matches": [] }
```

## Assignment Part A — feature suggestions (draft)
These are proposals based on the assignment brief, not claims that the live Coy app was personally explored:
1. **Interest-based discovery preferences:** let users choose a few interests and optionally a distance/city preference. This helps users discover relevant people while keeping the experience intentional.
2. **Conversation starter prompts after a mutual match:** show a few lightweight prompts based on shared interests. This reduces the awkwardness of starting a conversation and helps turn a match into a meaningful interaction.

Before submission, personally explore the live Coy app's OTP login, adding a crush, email verification, invite link and extra-slots screen (do not purchase). Refine Part A based on what you observe.

## Notes before submission
- This is a demo assignment implementation with mock data and a single demo user, as permitted by the brief. It is not connected to Coy's production app or codebase.
- Profile photos are remote placeholder avatars from pravatar.cc and require internet access in the browser.
- For a public submission, create your own GitHub repository and push this project. Add screenshots and a short demo video if time permits.
