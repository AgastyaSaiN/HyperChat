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

## Current Technical Debt

### Identity Formatting

The chaincode currently stores the full X.509 identity string for `admin`, `members`, and `sender`.

Example:

```text
x509::/C=US/ST=California/L=San Francisco/OU=client/CN=User1@org1.example.com::/C=US/ST=California/L=San Francisco/O=org1.example.com/CN=ca.org1.example.com
```

This is valid but not friendly. Next we should improve `_getCallerId()` in:

```text
chaincode/chat/lib/chatContract.js
```

Target display value:

```text
User1@org1.example.com
```

Because ledger state already contains old full IDs, this cleanup should be tested on a fresh network restart or with a new group ID.

## Next Engineering Steps

1. Improve identity parsing in chaincode.
2. Redeploy chaincode with a new version or restart the test network.
3. Test Org2 permissions:
   - Org2 should fail before being added.
   - Org1 admin should add Org2.
   - Org2 should then read/send messages.
4. Add a small API using Node.js and Fabric Gateway.
5. Add a simple frontend after the API works.

