# Architecture

## Main Idea

HyperChat stores group chat events as Hyperledger Fabric transactions. The ledger becomes the source of truth for group membership and message history.

This is a learning project, so version 1 stores message text directly on-chain. A later version can store encrypted messages or off-chain message bodies with only hashes on-chain.

## Ledger State

The ledger currently stores two document types:

- `group`
- `message`

### Group

```json
{
  "docType": "group",
  "groupId": "group1",
  "name": "Project Team",
  "admin": "x509::/C=US/ST=California/L=San Francisco/OU=client/CN=User1@org1.example.com::/C=US/ST=California/L=San Francisco/O=org1.example.com/CN=ca.org1.example.com",
  "members": [
    "x509::/C=US/ST=California/L=San Francisco/OU=client/CN=User1@org1.example.com::/C=US/ST=California/L=San Francisco/O=org1.example.com/CN=ca.org1.example.com"
  ],
  "createdAt": "2026-05-16T06:40:42.985Z"
}
```

The first successful run stored the full X.509 identity string. The chaincode has since been updated and verified to extract the certificate common name, so fresh records use a friendlier identity such as `User1@org1.example.com`.

### Message

```json
{
  "docType": "message",
  "messageId": "msg1",
  "groupId": "group1",
  "sender": "x509::/C=US/ST=California/L=San Francisco/OU=client/CN=User1@org1.example.com::/C=US/ST=California/L=San Francisco/O=org1.example.com/CN=ca.org1.example.com",
  "text": "Hello from HyperChat",
  "createdAt": "2026-05-16T06:40:56.744Z"
}
```

## Access Rules

The chaincode should enforce the important rules:

- `CreateGroup`: caller becomes admin and first member.
- `AddMember`: caller must be the group admin.
- `SendMessage`: caller must be a group member.
- `GetGroup`: caller must be a group member.
- `GetMessages`: caller must be a group member.

## Why Hyperledger Fabric Fits

Fabric is permissioned. Every transaction is submitted by an enrolled identity, endorsed, ordered, and committed to the ledger. That makes the message history tamper-evident and auditable.

## Current Network

Development uses the official Fabric test network:

```text
fabric-samples/test-network
```

Current channel:

```text
hyperchat
```

Current chaincode:

```text
name: hyperchat
version: 1.0
sequence: 1
language: javascript
```
