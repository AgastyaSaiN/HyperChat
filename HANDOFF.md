# HyperChat Handoff

This file records the project state so a new Codex/chat session can continue if needed.

## Project Goal

Build a first Hyperledger Fabric project: a simple permissioned group chat.

Version 1 scope:

- A registered user creates a group.
- The group creator becomes the group admin.
- Only the group admin can add members.
- Only group members can send messages.
- Only group members can read messages.
- Messages are stored on the Fabric ledger as immutable/tamper-evident transactions.

## Architecture Chosen

```text
React frontend
    |
Node.js Express API
    |
Fabric Gateway SDK
    |
Hyperledger Fabric test network
    |
JavaScript chat chaincode
```

Version 1 stores message text directly on-chain for learning simplicity. Later versions can encrypt messages or store message bodies off-chain with hashes on-chain.

## Current Files Created

```text
README.md
HANDOFF.md
docs/architecture.md
docs/fabric-commands.md
docs/progress.md
chaincode/chat/README.md
chaincode/chat/package.json
chaincode/chat/index.js
chaincode/chat/lib/chatContract.js
api/README.md
web/README.md
```

## Chaincode Implemented

Location:

```text
chaincode/chat
```

Functions:

```text
InitLedger()
CreateGroup(groupId, name)
AddMember(groupId, memberId)
SendMessage(groupId, messageId, text)
GetGroup(groupId)
GetMessages(groupId)
```

Rules enforced by chaincode:

- `CreateGroup`: caller becomes admin and first member.
- `AddMember`: caller must be group admin.
- `SendMessage`: caller must be group member.
- `GetGroup` and `GetMessages`: caller must be group member.

Important implementation detail:

- Caller identity is read from `ctx.clientIdentity.getID()`.
- The contract extracts the certificate common name from that ID when possible.

## Machine Setup Done

Windows/WSL setup:

- WSL2 installed.
- Default `Ubuntu` distro was working.
- `HyperChatUbuntu` also existed but should be ignored.
- Docker Desktop was reinstalled and then worked from `Ubuntu`.

Verified inside `Ubuntu`:

```text
docker version: worked, client and server visible
docker run hello-world: worked
node --version: v24.13.1
npm --version: 11.8.0
git --version: worked
```

PowerShell `npm` policy issue:

- PowerShell initially blocked `npm.ps1`.
- `npm.cmd` worked.
- This is not critical for Fabric work because Fabric commands run inside Ubuntu.

## Fabric Setup Done

The official Fabric installer was downloaded and run:

```bash
curl -sSLO https://raw.githubusercontent.com/hyperledger/fabric/main/scripts/install-fabric.sh
chmod +x install-fabric.sh
./install-fabric.sh docker samples binary
```

This created:

```text
fabric-samples/
fabric-samples/bin/peer
fabric-samples/bin/configtxgen
fabric-samples/bin/cryptogen
fabric-samples/test-network/
```

The project was renamed to remove spaces from the path:

```text
C:\Summer_Phase\L1\HyperChat
```

Inside Ubuntu:

```bash
/mnt/c/Summer_Phase/L1/HyperChat
```

`jq` was installed in Ubuntu, and the missing JavaScript chaincode builder image was pulled:

```bash
sudo apt install -y jq
docker pull hyperledger/fabric-nodeenv:2.5
```

## Fabric Proof Complete

The Fabric proof of concept worked.

Confirmed chaincode deployment:

```text
Committed chaincode definition for chaincode 'hyperchat' on channel 'hyperchat':
Version: 1.0, Sequence: 1, Endorsement Plugin: escc, Validation Plugin: vscc, Approvals: [Org1MSP: true, Org2MSP: true]
```

Created group:

```text
groupId: group1
name: Project Team
admin: User1 from Org1, currently stored as full X.509 identity string
```

Sent message:

```text
messageId: msg1
groupId: group1
text: Hello from HyperChat
sender: User1 from Org1, currently stored as full X.509 identity string
```

Queried messages successfully:

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

## Problem Hit

The original workspace path had a space:

```text
C:\Summer Phase\L1\HyperChat
```

Inside Ubuntu:

```bash
/mnt/c/Summer Phase/L1/HyperChat
```

Fabric's `network.sh` scripts broke because of the space in `Summer Phase`.

Errors included:

```text
pushd: too many arguments
/mnt/c/Summer: No such file or directory
ambiguous redirect
println: command not found
jq command not found
```

The network partially started, but channel anchor peer setup failed. Chaincode deploy then failed too.

`jq` was also missing in Ubuntu and needs to be installed.

## Next Plan

Continue from the renamed path:

```text
C:\Summer_Phase\L1\HyperChat
```

Next work:

1. Improve identity formatting in chaincode.
2. Test Org2 permission behavior.
3. Build the Node.js API.
4. Build the frontend.

## Commands To Run Next

Inside Ubuntu:

```bash
cd /mnt/c/Summer_Phase/L1/HyperChat
```

Clean and restart the Fabric test network:

```bash
cd /mnt/c/Summer_Phase/L1/HyperChat/fabric-samples/test-network
./network.sh down
./network.sh up createChannel -c hyperchat
```

Deploy HyperChat chaincode:

```bash
./network.sh deployCC \
  -c hyperchat \
  -ccn hyperchat \
  -ccp ../../chaincode/chat \
  -ccl javascript
```

Set peer CLI environment:

```bash
export PATH=${PWD}/../bin:$PATH
export FABRIC_CFG_PATH=$PWD/../config/
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051
```

Create first group:

```bash
peer chaincode invoke \
  -o localhost:7050 \
  --ordererTLSHostnameOverride orderer.example.com \
  --tls \
  --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" \
  -C hyperchat \
  -n hyperchat \
  --peerAddresses localhost:7051 \
  --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" \
  --peerAddresses localhost:9051 \
  --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" \
  -c '{"function":"CreateGroup","Args":["group1","Project Team"]}'
```

Send first message:

```bash
peer chaincode invoke \
  -o localhost:7050 \
  --ordererTLSHostnameOverride orderer.example.com \
  --tls \
  --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" \
  -C hyperchat \
  -n hyperchat \
  --peerAddresses localhost:7051 \
  --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" \
  --peerAddresses localhost:9051 \
  --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" \
  -c '{"function":"SendMessage","Args":["group1","msg1","Hello from HyperChat"]}'
```

Query messages:

```bash
peer chaincode query \
  -C hyperchat \
  -n hyperchat \
  -c '{"function":"GetMessages","Args":["group1"]}'
```

## Important Note For New Session

Do not use the old spaced path:

```bash
/mnt/c/Summer Phase/L1/HyperChat
```

Use:

```bash
/mnt/c/Summer_Phase/L1/HyperChat
```
