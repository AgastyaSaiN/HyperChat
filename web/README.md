# Web

React frontend for HyperChat.

## Features

- Switch between Org1 and Org2 identities.
- Create or load a group.
- Add a member.
- Send ledger-backed messages.
- Read group message history.
- Surface Fabric permission errors from the API.

## Run

The API must already be running on `http://localhost:3000`.

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal, usually:

```text
http://localhost:5173
```

To point at a different API URL:

```bash
VITE_API_BASE=http://localhost:3000 npm run dev
```
