# HyperChat Runbook

This runbook is the full local startup, reset, verification, and shutdown guide.

Run Fabric commands inside WSL Ubuntu.

Project path inside Ubuntu:

```bash
/mnt/c/Summer_Phase/L1/HyperChat
```

## Components

HyperChat has four moving parts:

```text
Docker Desktop
  |
Hyperledger Fabric test network
  |
Node.js API
  |
React frontend
```

## 1. Start Docker Desktop

Open Docker Desktop first and wait until it says Docker is running.

Verify inside Ubuntu:

```bash
docker version
```

The output should include both:

```text
Client
Server
```

## 2. Clean Fabric State

Use this when you want a fresh ledger and fresh channel.

```bash
cd /mnt/c/Summer_Phase/L1/HyperChat/fabric-samples/test-network
./network.sh down
```

Remove only Fabric test-network containers, volumes, network, and old chaincode build images:

```bash
docker container prune -f
docker volume rm compose_orderer.example.com compose_peer0.org1.example.com compose_peer0.org2.example.com 2>/dev/null || true
docker volume rm docker_orderer.example.com docker_peer0.org1.example.com docker_peer0.org2.example.com 2>/dev/null || true
docker network rm fabric_test 2>/dev/null || true
docker image rm $(docker images -q 'dev-peer*') 2>/dev/null || true
```

Do not run broad Docker cleanup commands unless you intentionally want to remove unrelated Docker data.

## 3. Start Fabric Network

```bash
cd /mnt/c/Summer_Phase/L1/HyperChat/fabric-samples/test-network
./network.sh up createChannel -c hyperchat -r 20 -d 5
```

The `-r 20 -d 5` flags give the Fabric CLI more time to retry while Docker Desktop is warming up.

Verify containers:

```bash
docker ps --filter name=orderer.example.com
docker ps --filter name=peer0.org1.example.com
docker ps --filter name=peer0.org2.example.com
```

All three should be running.

## 4. Deploy Chaincode

```bash
cd /mnt/c/Summer_Phase/L1/HyperChat/fabric-samples/test-network
./network.sh deployCC \
  -c hyperchat \
  -ccn hyperchat \
  -ccp ../../chaincode/chat \
  -ccl javascript \
  -r 20 \
  -d 5
```

If deployment fails because the Node chaincode image is missing:

```bash
docker pull hyperledger/fabric-nodeenv:2.5
```

Then rerun deploy.

Verify chaincode commit:

```bash
export PATH=${PWD}/../bin:$PATH
export FABRIC_CFG_PATH=$PWD/../config/
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051

peer lifecycle chaincode querycommitted -C hyperchat -n hyperchat
```

Expected:

```text
Committed chaincode definition for chaincode 'hyperchat' on channel 'hyperchat'
Version: 1.0, Sequence: 1
```

## 5. Start API

Use a second terminal.

```bash
cd /mnt/c/Summer_Phase/L1/HyperChat/api
npm start
```

Expected:

```text
HyperChat API listening on http://localhost:3000
```

Health check from another terminal:

```bash
curl http://localhost:3000/health
```

Expected:

```json
{"ok":true,"service":"hyperchat-api"}
```

## 6. Start Frontend

Use a third terminal.

```bash
cd /mnt/c/Summer_Phase/L1/HyperChat/web
npm run dev
```

Open the Vite URL shown in the terminal, usually:

```text
http://localhost:5173
```

## 7. UI Verification Flow

Use a fresh group ID after every full Fabric reset, for example:

```text
group-ui-1
```

In the frontend:

1. Select `Org1`.
2. Create group `group-ui-1`.
3. Send a message as Org1.
4. Refresh messages and confirm the Org1 message appears.
5. Switch to `Org2`.
6. Refresh messages and confirm permission is denied.
7. Switch back to `Org1`.
8. Add member:
   ```text
   User1@org2.example.com
   ```
9. Switch to `Org2`.
10. Refresh messages and confirm messages load.
11. Send a message as Org2.
12. Switch to Org1 and refresh. Both messages should appear.

## 8. API Verification Flow

Create group:

```bash
curl -X POST "http://localhost:3000/groups?org=org1" \
  -H "Content-Type: application/json" \
  -d '{"groupId":"group-api-1","name":"API Test Group"}'
```

Send Org1 message:

```bash
curl -X POST "http://localhost:3000/groups/group-api-1/messages?org=org1" \
  -H "Content-Type: application/json" \
  -d '{"messageId":"msg-api-1","text":"Hello from the API"}'
```

Read as Org2 before membership:

```bash
curl "http://localhost:3000/groups/group-api-1/messages?org=org2"
```

Expected: permission error.

Add Org2:

```bash
curl -X POST "http://localhost:3000/groups/group-api-1/members?org=org1" \
  -H "Content-Type: application/json" \
  -d '{"memberId":"User1@org2.example.com"}'
```

Send Org2 message:

```bash
curl -X POST "http://localhost:3000/groups/group-api-1/messages?org=org2" \
  -H "Content-Type: application/json" \
  -d '{"messageId":"msg-api-2","text":"Hello from Org2 through the API"}'
```

Read final history:

```bash
curl "http://localhost:3000/groups/group-api-1/messages?org=org1"
```

## 9. Shutdown

Stop frontend:

```text
Ctrl+C
```

Stop API:

```text
Ctrl+C
```

Stop Fabric:

```bash
cd /mnt/c/Summer_Phase/L1/HyperChat/fabric-samples/test-network
./network.sh down
```

## Troubleshooting

### `ledger [hyperchat] already exists`

The old peer ledger volume still exists.

Run:

```bash
./network.sh down
docker volume rm compose_orderer.example.com compose_peer0.org1.example.com compose_peer0.org2.example.com 2>/dev/null || true
docker volume rm docker_orderer.example.com docker_peer0.org1.example.com docker_peer0.org2.example.com 2>/dev/null || true
```

Then restart Fabric.

### `Anchor peer update failed`

Usually Docker Desktop or the orderer was slow to respond.

Run the clean reset, then start with longer retries:

```bash
./network.sh up createChannel -c hyperchat -r 20 -d 5
```

### `Admin@org1.example.com/msp does not exist`

The network setup did not finish correctly, so crypto material is incomplete.

Fix:

```bash
./network.sh down
./network.sh up createChannel -c hyperchat -r 20 -d 5
```

Do not deploy chaincode until the network startup finishes successfully.

### API Cannot Connect

Check Fabric containers:

```bash
docker ps --filter name=peer0.org1.example.com
docker ps --filter name=peer0.org2.example.com
docker ps --filter name=orderer.example.com
```

Check API health:

```bash
curl http://localhost:3000/health
```

