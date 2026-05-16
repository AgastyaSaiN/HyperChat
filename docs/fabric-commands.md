# Fabric Commands

Run these commands inside the working Ubuntu distro.

Enter the project:

```bash
cd /mnt/c/Summer_Phase/L1/HyperChat
```

## Start the Test Network

```bash
cd fabric-samples/test-network
./network.sh down
./network.sh up createChannel -c hyperchat
```

## Deploy HyperChat Chaincode

```bash
./network.sh deployCC \
  -c hyperchat \
  -ccn hyperchat \
  -ccp ../../chaincode/chat \
  -ccl javascript
```

If deployment fails with a missing Node chaincode image:

```bash
docker pull hyperledger/fabric-nodeenv:2.5
```

Then rerun `deployCC`.

## Configure Peer CLI

```bash
export PATH=${PWD}/../bin:$PATH
export FABRIC_CFG_PATH=$PWD/../config/
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051
```

## Check Chaincode Deployment

```bash
peer lifecycle chaincode querycommitted -C hyperchat -n hyperchat
```

Expected:

```text
Committed chaincode definition for chaincode 'hyperchat' on channel 'hyperchat':
Version: 1.0, Sequence: 1, Endorsement Plugin: escc, Validation Plugin: vscc, Approvals: [Org1MSP: true, Org2MSP: true]
```

## Try the Contract

Create a group:

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

Send a message:

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

Read messages:

```bash
peer chaincode query \
  -C hyperchat \
  -n hyperchat \
  -c '{"function":"GetMessages","Args":["group1"]}'
```

Expected result after the first message:

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

## Next Permission Test

Switch the CLI to Org2:

```bash
export CORE_PEER_LOCALMSPID="Org2MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org2.example.com/users/User1@org2.example.com/msp
export CORE_PEER_ADDRESS=localhost:9051
```

Then try reading messages:

```bash
peer chaincode query \
  -C hyperchat \
  -n hyperchat \
  -c '{"function":"GetMessages","Args":["group1"]}'
```

Expected behavior before Org2 is added:

```text
Caller ... is not a member of group group1
```

## Add Org2 And Verify Access

Switch back to Org1:

```bash
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051
```

Add Org2 user:

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
  -c '{"function":"AddMember","Args":["group2","User1@org2.example.com"]}'
```

Switch to Org2:

```bash
export CORE_PEER_LOCALMSPID="Org2MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org2.example.com/users/User1@org2.example.com/msp
export CORE_PEER_ADDRESS=localhost:9051
```

Read messages as Org2:

```bash
peer chaincode query \
  -C hyperchat \
  -n hyperchat \
  -c '{"function":"GetMessages","Args":["group2"]}'
```

Send a message as Org2:

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
  -c '{"function":"SendMessage","Args":["group2","msg2","Hello from Org2"]}'
```
