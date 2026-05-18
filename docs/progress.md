# Progress

## What We Built So Far

HyperChat now has a working Hyperledger Fabric proof of concept.

Completed flow:

```text
Fabric test network started
Channel created: hyperchat
Chaincode deployed: hyperchat
Group created: group1
Message sent: msg1
Messages queried successfully
```

Latest verified flow:

```text
Identity cleanup deployed
Group created: group2
Group admin stored as: User1@org1.example.com
Message sent: msg1
Message sender stored as: User1@org1.example.com
Org2 read before membership: correctly rejected
Org1 admin added: User1@org2.example.com
Org2 read after membership: succeeded
Org2 message sent: msg2
Message sender stored as: User1@org2.example.com
```

Successful chaincode query:

```bash
peer lifecycle chaincode querycommitted -C hyperchat -n hyperchat
```

Result:

```text
Committed chaincode definition for chaincode 'hyperchat' on channel 'hyperchat':
Version: 1.0, Sequence: 1, Endorsement Plugin: escc, Validation Plugin: vscc, Approvals: [Org1MSP: true, Org2MSP: true]
```

Successful message query:

```json
[
  {
    "docType": "message",
    "messageId": "msg1",
    "groupId": "group1",
    "sender": "x509::/C=US/ST=California/L=San Francisco/OU=client/CN=User1@org1.example.com::/C=US/ST=California/L=San Francisco/O=org1.example.com/CN=ca.org1.example.com",
    "text": "Hello from HyperChat",
    "createdAt": "2026-05-16T06:40:56.744Z"
  }
]
```

## Issues We Solved

### Docker Reinstall

Docker Desktop was reinstalled and WSL integration was enabled for the default `Ubuntu` distro.

Verified:

```bash
docker version
docker run hello-world
```

### Path With Spaces

Fabric scripts failed when the project lived under:

```text
C:\Summer Phase\L1\HyperChat
```

The folder was renamed to:

```text
C:\Summer_Phase\L1\HyperChat
```

Fabric commands now use:

```bash
/mnt/c/Summer_Phase/L1/HyperChat
```

### Missing jq

The Fabric scripts required `jq`.

Fix:

```bash
sudo apt update
sudo apt install -y jq
```

### Missing Node Chaincode Image

JavaScript chaincode deployment required:

```text
hyperledger/fabric-nodeenv:2.5
```

Fix:

```bash
docker pull hyperledger/fabric-nodeenv:2.5
```

## Current Chaincode Update

### Identity Formatting

The first successful run stored the full X.509 identity string for `admin`, `members`, and `sender`.

Example:

```text
x509::/C=US/ST=California/L=San Francisco/OU=client/CN=User1@org1.example.com::/C=US/ST=California/L=San Francisco/O=org1.example.com/CN=ca.org1.example.com
```

The chaincode has been updated and verified to extract the certificate common name from that identity:

```text
User1@org1.example.com
```

Verified group:

```json
{
  "docType": "group",
  "groupId": "group2",
  "name": "Clean Identity Test",
  "admin": "User1@org1.example.com",
  "members": ["User1@org1.example.com"],
  "createdAt": "2026-05-16T10:54:34.612Z"
}
```

Verified message:

```json
[
  {
    "docType": "message",
    "messageId": "msg1",
    "groupId": "group2",
    "sender": "User1@org1.example.com",
    "text": "Identity cleanup worked",
    "createdAt": "2026-05-16T10:55:53.849Z"
  }
]
```

Verified Org2 rejection before membership:

```text
Caller User1@org2.example.com is not a member of group group2
```

Verified add-member result:

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

Verified final message history:

```json
[
  {
    "docType": "message",
    "messageId": "msg1",
    "groupId": "group2",
    "sender": "User1@org1.example.com",
    "text": "Identity cleanup worked",
    "createdAt": "2026-05-16T10:55:53.849Z"
  },
  {
    "docType": "message",
    "messageId": "msg2",
    "groupId": "group2",
    "sender": "User1@org2.example.com",
    "text": "Hello from Org2",
    "createdAt": "2026-05-16T10:59:19.164Z"
  }
]
```

Changed file:

```text
chaincode/chat/lib/chatContract.js
```

The existing `group1` ledger state from the first run still contains old full IDs. New groups use clean identity values.

## Next Engineering Steps

## API Milestone

The Express API now runs and talks to Fabric Gateway.

Verified API behavior:

```text
GET /health: succeeded
GET /whoami?org=org1: User1@org1.example.com
GET /whoami?org=org2: User1@org2.example.com
POST /groups?org=org1: created group-api-1
POST /groups/group-api-1/messages?org=org1: sent msg-api-1
GET /groups/group-api-1/messages?org=org1: read messages
GET /groups/group-api-1/messages?org=org2: rejected before membership
POST /groups/group-api-1/members?org=org1: added User1@org2.example.com
```

Next checks:

1. Read `group-api-1` as Org2 after membership.
2. Send `msg-api-2` as Org2 through the API.
3. Build a simple frontend after the API flow is fully verified.

## Frontend Milestone

The React frontend has been scaffolded in:

```text
web/
```

Implemented UI capabilities:

- Switch between Org1 and Org2.
- Create or load a group.
- Add a member.
- Send messages.
- Refresh message history.
- Display Fabric permission errors returned by the API.

Run:

```bash
cd web
npm install
npm run dev
```

The API must be running at:

```text
http://localhost:3000
```
