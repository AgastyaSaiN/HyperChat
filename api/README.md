# API

Node.js Express API for HyperChat.

The API calls the deployed Fabric chaincode through the Fabric Gateway SDK.

## Endpoints

- `GET /health`
- `GET /whoami?org=org1`
- `POST /groups?org=org1`
- `GET /groups/:groupId?org=org1`
- `POST /groups/:groupId/members?org=org1`
- `POST /groups/:groupId/messages?org=org1`
- `GET /groups/:groupId/messages?org=org1`

Use `org=org1` or `org=org2` to choose which Fabric identity submits the transaction.

## Run

From this folder:

```bash
npm install
npm start
```

The Fabric test network must already be running with the `hyperchat` chaincode deployed.

Default URL:

```text
http://localhost:3000
```

The server binds to `0.0.0.0` by default so the Windows browser can reach the API while it runs inside WSL.

## Example Requests

Create a group as Org1:

```bash
curl -X POST "http://localhost:3000/groups?org=org1" \
  -H "Content-Type: application/json" \
  -d '{"groupId":"group-api-1","name":"API Test Group"}'
```

Send a message as Org1:

```bash
curl -X POST "http://localhost:3000/groups/group-api-1/messages?org=org1" \
  -H "Content-Type: application/json" \
  -d '{"messageId":"msg-api-1","text":"Hello from the API"}'
```

Try reading as Org2 before membership:

```bash
curl "http://localhost:3000/groups/group-api-1/messages?org=org2"
```

Add Org2 as Org1:

```bash
curl -X POST "http://localhost:3000/groups/group-api-1/members?org=org1" \
  -H "Content-Type: application/json" \
  -d '{"memberId":"User1@org2.example.com"}'
```

Read as Org2:

```bash
curl "http://localhost:3000/groups/group-api-1/messages?org=org2"
```

Send as Org2:

```bash
curl -X POST "http://localhost:3000/groups/group-api-1/messages?org=org2" \
  -H "Content-Type: application/json" \
  -d '{"messageId":"msg-api-2","text":"Hello from Org2 through the API"}'
```

## Verified API Flow

Verified on the Fabric test network:

- `GET /health` returned `{"ok":true,"service":"hyperchat-api"}`.
- `GET /whoami?org=org1` returned `User1@org1.example.com`.
- `GET /whoami?org=org2` returned `User1@org2.example.com`.
- Org1 created `group-api-1`.
- Org1 sent `msg-api-1`.
- Org1 read messages successfully.
- Org2 read before membership was rejected.
- Org1 added `User1@org2.example.com`.
