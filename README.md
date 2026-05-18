# HyperChat

HyperChat is a first Hyperledger Fabric project: a simple permissioned group chat where messages are written to the ledger as immutable transactions.

## Version 1 Goal

Build a minimal group chat with these rules:

- A registered user can create a group.
- The group creator becomes the group admin.
- Only the group admin can add members.
- Only group members can send messages.
- Only group members can read messages.
- Every sent message is stored on the Fabric ledger.

## Architecture

```text
React frontend
    |
Node.js Express API
    |
Fabric Gateway SDK
    |
Hyperledger Fabric network
    |
Chat chaincode
```

## Project Layout

```text
HyperChat/
  HANDOFF.md
  chaincode/
    chat/
      index.js
      package.json
      README.md
  api/
    README.md
  web/
    README.md
  docs/
    architecture.md
```

## Current Status

The first milestone is complete: Fabric can store and read HyperChat group/message data.

Completed:

- Docker Desktop works from WSL Ubuntu.
- Fabric samples, binaries, and Docker images are installed.
- The Fabric test network starts successfully.
- Channel `hyperchat` was created.
- Chaincode `hyperchat` was deployed and committed.
- First group `group1` was created on the ledger.
- First message `msg1` was written to the ledger.
- `GetMessages` returned the stored message successfully.
- Identity cleanup was verified with clean senders like `User1@org1.example.com`.
- Org2 was blocked before membership, then allowed after Org1 admin added it.
- Express API was added and verified against Fabric Gateway for Org1 group/message operations and Org2 pre-membership rejection.
- React frontend scaffold was added under `web/`.

Implemented chaincode functions:

```text
InitLedger()
CreateGroup(groupId, name)
AddMember(groupId, memberId)
SendMessage(groupId, messageId, text)
GetGroup(groupId)
GetMessages(groupId)
```

## Local Prerequisites

Use the default WSL `Ubuntu` distro for Fabric work.

Verified working:

- Docker
- Node.js
- npm
- Git
- jq
- Hyperledger Fabric samples and binaries

Important path:

```text
C:\Summer_Phase\L1\HyperChat
```

Inside Ubuntu:

```bash
/mnt/c/Summer_Phase/L1/HyperChat
```

Do not use paths with spaces for Fabric's `network.sh` scripts.

## Build Roadmap

Done:

1. Set up a local Hyperledger Fabric test network.
2. Write the chat chaincode.
3. Deploy the chaincode to the test network.
4. Test group/message transactions from the command line.

Next:

1. Install frontend dependencies and run the Vite dev server.
2. Verify the UI can create groups, add members, and send/read messages through the API.
3. Polish the demo flow and setup docs.

## Commands

See [docs/fabric-commands.md](docs/fabric-commands.md) for the commands to start the Fabric test network, deploy the HyperChat chaincode, and test the first group/message transactions.

See [docs/progress.md](docs/progress.md) for the learning log and next engineering steps.

See [docs/runbook.md](docs/runbook.md) for the full reset, startup, verification, and shutdown flow.
"# HyperChat" 
