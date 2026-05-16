# Chat Chaincode

This folder contains the Hyperledger Fabric smart contract for group and message operations.

Functions:

- `CreateGroup`
- `AddMember`
- `SendMessage`
- `GetGroup`
- `GetMessages`

## Rules

- `CreateGroup`: caller becomes admin and first member.
- `AddMember`: only the group admin can add members.
- `SendMessage`: only group members can send messages.
- `GetGroup` and `GetMessages`: only group members can read group data.

## Install Dependencies

```bash
cd chaincode/chat
npm install
```
