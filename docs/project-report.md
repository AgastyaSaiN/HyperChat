# HyperChat: A Hyperledger Fabric Learning Project

## 1. Abstract

HyperChat is a permissioned group chat application built as a learning project using Hyperledger Fabric. The project demonstrates how blockchain concepts such as identity, membership, access control, transaction submission, endorsement, and immutable ledger storage can be applied to a simple messaging use case.

The first version of HyperChat allows a registered Fabric user to create a group, automatically become the group admin, add other registered users as members, send messages, and read message history. All group and message records are stored on the Hyperledger Fabric ledger through JavaScript chaincode. The system also includes a Node.js API layer and a React frontend to interact with the blockchain network in a user-friendly manner.

** insert here the image of the final HyperChat frontend showing messages from Org1 and Org2 **

## 2. Project Objective

The objective of this project is to build a beginner-friendly Hyperledger Fabric application that demonstrates the complete flow from blockchain network setup to frontend interaction.

The main goals are:

- Understand the basic architecture of Hyperledger Fabric.
- Create and deploy custom JavaScript chaincode.
- Store group and message data on the ledger.
- Enforce access control through chaincode.
- Use Fabric identities to distinguish users.
- Build an API layer that communicates with Fabric Gateway.
- Build a frontend interface for creating groups, adding members, and sending messages.
- Document the development process, issues faced, and solutions applied.

## 3. Problem Statement

Most chat applications store messages in centralized databases where administrators or attackers may be able to modify or delete records without users noticing. HyperChat explores a different design: using a permissioned blockchain ledger to store chat events in a tamper-evident way.

In this project, every group creation, membership update, and message submission is performed as a blockchain transaction. Once committed to the ledger, the record becomes part of the history maintained by the Fabric network.

This project is not intended to replace real-time chat systems such as WhatsApp or Slack. Instead, it is a learning project focused on understanding how Hyperledger Fabric can be used for auditability, identity-based access, and immutable record keeping.

## 4. Why Hyperledger Fabric

Hyperledger Fabric was chosen because it is a permissioned blockchain framework designed for enterprise applications. Unlike public blockchains, Fabric uses known identities and controlled participation. This makes it suitable for applications where users, organizations, and access rules must be clearly defined.

Hyperledger Fabric concepts used in this project:

- Organizations
- Peers
- Orderer
- Channel
- Chaincode
- Membership Service Provider
- X.509 identities
- Endorsement
- Ledger state
- Fabric Gateway SDK

** insert here the image of Hyperledger Fabric architecture diagram or a simple project architecture diagram **

## 5. System Architecture

HyperChat follows a layered architecture:

```text
React Frontend
    |
Node.js Express API
    |
Fabric Gateway SDK
    |
Hyperledger Fabric Test Network
    |
JavaScript Chaincode
    |
Ledger State
```

### 5.1 Frontend Layer

The frontend is a React application. It allows the user to:

- Switch between Org1 and Org2 identities.
- Create or load a group.
- Add members to a group.
- Send messages.
- Refresh and view message history.
- View permission errors returned by the API.

### 5.2 API Layer

The backend API is built using Node.js and Express. It communicates with the Fabric network through the Fabric Gateway SDK.

The API exposes endpoints such as:

```text
GET /health
GET /whoami
POST /groups
GET /groups/:groupId
POST /groups/:groupId/members
POST /groups/:groupId/messages
GET /groups/:groupId/messages
```

### 5.3 Blockchain Layer

The blockchain layer uses the official Hyperledger Fabric test network. The chaincode is written in JavaScript and deployed to the `hyperchat` channel.

### 5.4 Ledger Layer

The ledger stores two main document types:

- Group records
- Message records

## 6. Technology Stack

| Layer | Technology |
| --- | --- |
| Blockchain framework | Hyperledger Fabric |
| Chaincode language | JavaScript |
| Backend | Node.js, Express |
| Fabric SDK | Fabric Gateway SDK |
| Frontend | React, Vite |
| Runtime | Docker Desktop, WSL Ubuntu |
| CLI tools | Fabric peer CLI, Docker CLI, curl |
| Documentation | Markdown |

** insert here the image of the project folder structure in VS Code or file explorer **

## 7. Development Timeline

### 7.1 Ideation

The project began with the idea of building a group chat application as a first Hyperledger project. The goal was to keep the application simple enough for learning, while still using real Hyperledger Fabric concepts.

The first design decision was that the group creator would become the group admin. Only the group admin would be allowed to add members. Only group members would be allowed to send and read messages.

### 7.2 Environment Setup

The environment was prepared on Windows using WSL Ubuntu and Docker Desktop.

Tools verified:

- Docker
- Node.js
- npm
- Git
- jq
- Hyperledger Fabric binaries
- Hyperledger Fabric Docker images

** insert here the image of Docker Desktop running **

** insert here the image of Ubuntu terminal showing docker version, node version, npm version, and git version **

### 7.3 Fabric Setup

The official Hyperledger Fabric samples and binaries were installed using the Fabric installer script.

The Fabric test network was used as the local blockchain network.

Important path:

```bash
/mnt/c/Summer_Phase/L1/HyperChat
```

The project was moved from a path with spaces to a path without spaces because Fabric shell scripts were failing when the directory contained spaces.

### 7.4 Chaincode Development

The first custom chaincode was created in:

```text
chaincode/chat
```

The chaincode implements group and message operations.

### 7.5 Chaincode Deployment

The chaincode was deployed to the Fabric test network on channel:

```text
hyperchat
```

Chaincode name:

```text
hyperchat
```

Verified deployment:

```text
Committed chaincode definition for chaincode 'hyperchat' on channel 'hyperchat'
Version: 1.0, Sequence: 1
Approvals: [Org1MSP: true, Org2MSP: true]
```

** insert here the image of terminal showing successful chaincode deployment **

### 7.6 CLI Testing

The chaincode was first tested using the Fabric peer CLI.

Actions tested:

- Create group
- Send message
- Query messages
- Switch between Org1 and Org2
- Confirm Org2 cannot read before being added
- Add Org2 as a member
- Confirm Org2 can read and send messages

** insert here the image of terminal showing CreateGroup success **

** insert here the image of terminal showing GetMessages output **

** insert here the image of terminal showing Org2 permission rejection before membership **

### 7.7 API Development

After CLI testing was successful, a Node.js Express API was built in:

```text
api/
```

The API uses Fabric Gateway to submit and evaluate transactions.

The API supports both Org1 and Org2 identities using the query parameter:

```text
?org=org1
?org=org2
```

Example:

```bash
curl "http://localhost:3000/whoami?org=org1"
```

### 7.8 API Testing

The API was tested using curl.

Verified API flow:

- Health check succeeded.
- Org1 identity was returned.
- Org2 identity was returned.
- Org1 created a group.
- Org1 sent a message.
- Org1 read message history.
- Org2 was rejected before membership.
- Org1 added Org2.
- Org2 was able to read and send messages.

** insert here the image of terminal showing API health check **

** insert here the image of terminal showing API group creation **

** insert here the image of terminal showing Org2 API permission rejection **

** insert here the image of terminal showing final API message history **

### 7.9 Frontend Development

A React frontend was created in:

```text
web/
```

The frontend connects to the API at:

```text
http://localhost:3000
```

The frontend allows interactive testing of the project without manually typing peer CLI or curl commands.

** insert here the image of the frontend initial screen **

** insert here the image of the frontend after creating a group **

** insert here the image of the frontend showing permission error for Org2 before membership **

** insert here the image of the frontend showing messages from both Org1 and Org2 **

## 8. Chaincode Design

The main chaincode file is:

```text
chaincode/chat/lib/chatContract.js
```

Implemented functions:

```text
InitLedger()
CreateGroup(groupId, name)
AddMember(groupId, memberId)
SendMessage(groupId, messageId, text)
GetGroup(groupId)
GetMessages(groupId)
```

## 9. Chaincode Access Rules

The important rules are enforced inside chaincode, not only in the frontend or API.

### 9.1 CreateGroup

When a user creates a group:

- The caller becomes the group admin.
- The caller is added as the first member.

### 9.2 AddMember

Only the group admin can add members.

If another member or non-member attempts to add someone, the transaction is rejected.

### 9.3 SendMessage

Only members of the group can send messages.

### 9.4 GetMessages

Only members of the group can read the message history.

This was verified by switching to Org2 before adding Org2 to the group. The query failed as expected.

## 10. Ledger Data Model

### 10.1 Group Record

Example group record:

```json
{
  "docType": "group",
  "groupId": "group2",
  "name": "Clean Identity Test",
  "admin": "User1@org1.example.com",
  "members": ["User1@org1.example.com", "User1@org2.example.com"],
  "createdAt": "2026-05-16T10:54:34.612Z"
}
```

### 10.2 Message Record

Example message record:

```json
{
  "docType": "message",
  "messageId": "msg2",
  "groupId": "group2",
  "sender": "User1@org2.example.com",
  "text": "Hello from Org2",
  "createdAt": "2026-05-16T10:59:19.164Z"
}
```

## 11. Identity Cleanup

Initially, Fabric identities were stored as full X.509 strings.

Example:

```text
x509::/C=US/ST=California/L=San Francisco/OU=client/CN=User1@org1.example.com::/C=US/ST=California/L=San Francisco/O=org1.example.com/CN=ca.org1.example.com
```

This was technically correct, but not user-friendly.

The chaincode was improved to extract the certificate common name, resulting in clean identities:

```text
User1@org1.example.com
User1@org2.example.com
```

This was verified by creating a new group and checking that the admin, members, and sender fields used the clean identity format.

** insert here the image of terminal showing clean identity output **

## 12. API Design

The API acts as a bridge between the frontend and the Fabric network.

### 12.1 API Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/health` | Check whether API is running |
| GET | `/whoami` | Show current Fabric identity |
| POST | `/groups` | Create a group |
| GET | `/groups/:groupId` | Read group details |
| POST | `/groups/:groupId/members` | Add member |
| POST | `/groups/:groupId/messages` | Send message |
| GET | `/groups/:groupId/messages` | Read messages |

### 12.2 Organization Selection

The API uses a query parameter to select the Fabric identity:

```text
?org=org1
?org=org2
```

This allows testing access control through the API.

## 13. Frontend Design

The frontend is designed as a simple operational interface rather than a marketing page.

Main UI areas:

- Identity selector
- Group controls
- Member controls
- Group summary
- Message history
- Message composer
- Status and error display

The frontend was intentionally kept focused on the main workflow: creating a group, adding members, and sending messages.

## 14. Full Demo Flow for Screenshots

This demo flow should be used for final screenshots without deleting old progress.

Use a fresh group:

```text
group-demo-1
```

Use messages:

```text
msg-demo-1
msg-demo-2
```

### 14.1 Start Fabric

```bash
cd /mnt/c/Summer_Phase/L1/HyperChat/fabric-samples/test-network
./network.sh up createChannel -c hyperchat -r 20 -d 5
```

** insert here the image of terminal showing successful Fabric channel creation **

### 14.2 Deploy Chaincode

```bash
./network.sh deployCC \
  -c hyperchat \
  -ccn hyperchat \
  -ccp ../../chaincode/chat \
  -ccl javascript \
  -r 20 \
  -d 5
```

** insert here the image of terminal showing chaincode committed successfully **

### 14.3 Start API

```bash
cd /mnt/c/Summer_Phase/L1/HyperChat/api
npm start
```

** insert here the image of terminal showing API listening on port 3000 **

### 14.4 Start Frontend

```bash
cd /mnt/c/Summer_Phase/L1/HyperChat/web
npm run dev
```

** insert here the image of terminal showing Vite frontend URL **

### 14.5 Frontend Demo Steps

1. Select Org1.
2. Create group `group-demo-1`.
3. Send `msg-demo-1` from Org1.
4. Switch to Org2.
5. Refresh messages and capture the permission error.
6. Switch back to Org1.
7. Add `User1@org2.example.com` as a member.
8. Switch to Org2.
9. Refresh messages and confirm access works.
10. Send `msg-demo-2` from Org2.
11. Switch to Org1 and refresh final message history.

** insert here the image of frontend while creating group-demo-1 **

** insert here the image of frontend after Org1 sends msg-demo-1 **

** insert here the image of frontend showing Org2 blocked before membership **

** insert here the image of frontend after adding User1@org2.example.com **

** insert here the image of frontend showing final messages from Org1 and Org2 **

## 15. Problems Faced and Solutions

### 15.1 PowerShell npm Policy Issue

PowerShell blocked `npm.ps1` because script execution was disabled.

Solution:

- Use `npm.cmd` in PowerShell, or
- Use npm inside Ubuntu.

### 15.2 Docker WSL Integration

Docker was installed but initially not accessible from the WSL distro.

Solution:

- Enable WSL integration in Docker Desktop.
- Use the correct Ubuntu distro.

### 15.3 Path With Spaces

Fabric scripts failed when the project was inside:

```text
C:\Summer Phase\L1\HyperChat
```

Solution:

The folder was renamed to:

```text
C:\Summer_Phase\L1\HyperChat
```

### 15.4 Missing jq

Fabric scripts required `jq`.

Solution:

```bash
sudo apt update
sudo apt install -y jq
```

### 15.5 Missing Fabric Node Environment Image

JavaScript chaincode deployment required:

```text
hyperledger/fabric-nodeenv:2.5
```

Solution:

```bash
docker pull hyperledger/fabric-nodeenv:2.5
```

### 15.6 Existing Ledger State

Sometimes the Fabric channel already existed in Docker volumes.

Error:

```text
ledger [hyperchat] already exists with state [ACTIVE]
```

Solution:

Clean Fabric network volumes before restarting the network.

### 15.7 Anchor Peer Timeout

The anchor peer update sometimes failed when Docker Desktop was still warming up.

Solution:

Start the network with longer retry and delay values:

```bash
./network.sh up createChannel -c hyperchat -r 20 -d 5
```

## 16. Current Status

Completed so far:

- Project idea and architecture finalized.
- Local Fabric environment set up.
- Chaincode implemented.
- Chaincode deployed successfully.
- CLI testing completed.
- Identity formatting fixed.
- Membership permissions verified.
- API implemented.
- API tested successfully.
- React frontend scaffolded.
- Runbook and project documentation created.

Current focus:

- Verify the frontend end-to-end using a clean demo group.
- Capture screenshots for documentation.
- Commit and push the latest API, frontend, and documentation work.

## 17. Future Scope

Possible future improvements:

- Add real user enrollment using Fabric CA.
- Add group invitations instead of direct admin addition.
- Encrypt messages before storing them.
- Store large message bodies off-chain and store hashes on-chain.
- Add message edit/delete events as new transactions.
- Add private data collections.
- Add persistent frontend state.
- Add automated tests for chaincode.
- Add deployment instructions for a multi-machine Fabric network.

## 18. Conclusion

HyperChat successfully demonstrates how Hyperledger Fabric can be used to build a permissioned, identity-aware, tamper-evident group chat system. The project covers the full learning path from Fabric setup and chaincode development to API integration and frontend interaction.

The most important learning outcome is that access control and message integrity are enforced at the blockchain layer through chaincode, not only through the frontend or backend. This makes the application a useful first step toward understanding enterprise blockchain development with Hyperledger Fabric.

