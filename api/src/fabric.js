'use strict';

const grpc = require('@grpc/grpc-js');
const { connect, hash, signers } = require('@hyperledger/fabric-gateway');
const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const { TextDecoder } = require('node:util');

const utf8Decoder = new TextDecoder();

const projectRoot = path.resolve(__dirname, '..', '..');
const testNetworkPath = path.join(projectRoot, 'fabric-samples', 'test-network');

const channelName = process.env.CHANNEL_NAME || 'hyperchat';
const chaincodeName = process.env.CHAINCODE_NAME || 'hyperchat';

const orgs = {
  org1: {
    mspId: 'Org1MSP',
    userId: 'User1@org1.example.com',
    peerEndpoint: process.env.ORG1_PEER_ENDPOINT || 'localhost:7051',
    peerHostAlias: 'peer0.org1.example.com',
    cryptoPath: path.join(testNetworkPath, 'organizations', 'peerOrganizations', 'org1.example.com'),
  },
  org2: {
    mspId: 'Org2MSP',
    userId: 'User1@org2.example.com',
    peerEndpoint: process.env.ORG2_PEER_ENDPOINT || 'localhost:9051',
    peerHostAlias: 'peer0.org2.example.com',
    cryptoPath: path.join(testNetworkPath, 'organizations', 'peerOrganizations', 'org2.example.com'),
  },
};

function getOrgConfig(orgName = 'org1') {
  const normalized = String(orgName).toLowerCase();
  const org = orgs[normalized];
  if (!org) {
    throw new Error(`Unsupported org "${orgName}". Use "org1" or "org2".`);
  }
  return org;
}

async function evaluateTransaction(orgName, transactionName, ...args) {
  return withContract(orgName, async (contract) => {
    const resultBytes = await contract.evaluateTransaction(transactionName, ...args);
    return decodeResult(resultBytes);
  });
}

async function submitTransaction(orgName, transactionName, ...args) {
  return withContract(orgName, async (contract) => {
    const resultBytes = await contract.submitTransaction(transactionName, ...args);
    return decodeResult(resultBytes);
  });
}

async function withContract(orgName, callback) {
  const org = getOrgConfig(orgName);
  const client = await newGrpcConnection(org);
  const gateway = connect({
    client,
    identity: await newIdentity(org),
    signer: await newSigner(org),
    hash: hash.sha256,
    evaluateOptions: () => ({ deadline: Date.now() + 5000 }),
    endorseOptions: () => ({ deadline: Date.now() + 15000 }),
    submitOptions: () => ({ deadline: Date.now() + 5000 }),
    commitStatusOptions: () => ({ deadline: Date.now() + 60000 }),
  });

  try {
    const network = gateway.getNetwork(channelName);
    const contract = network.getContract(chaincodeName);
    return await callback(contract);
  } finally {
    gateway.close();
    client.close();
  }
}

async function newGrpcConnection(org) {
  const tlsRootCert = await fs.readFile(path.join(org.cryptoPath, 'peers', org.peerHostAlias, 'tls', 'ca.crt'));
  const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
  return new grpc.Client(org.peerEndpoint, tlsCredentials, {
    'grpc.ssl_target_name_override': org.peerHostAlias,
  });
}

async function newIdentity(org) {
  const certDirectoryPath = path.join(org.cryptoPath, 'users', org.userId, 'msp', 'signcerts');
  const certPath = await getFirstDirFileName(certDirectoryPath);
  const credentials = await fs.readFile(certPath);
  return { mspId: org.mspId, credentials };
}

async function newSigner(org) {
  const keyDirectoryPath = path.join(org.cryptoPath, 'users', org.userId, 'msp', 'keystore');
  const keyPath = await getFirstDirFileName(keyDirectoryPath);
  const privateKeyPem = await fs.readFile(keyPath);
  const privateKey = crypto.createPrivateKey(privateKeyPem);
  return signers.newPrivateKeySigner(privateKey);
}

async function getFirstDirFileName(dirPath) {
  const files = await fs.readdir(dirPath);
  const file = files[0];
  if (!file) {
    throw new Error(`No files in directory: ${dirPath}`);
  }
  return path.join(dirPath, file);
}

function decodeResult(resultBytes) {
  const result = utf8Decoder.decode(resultBytes);
  if (!result) {
    return null;
  }

  try {
    return JSON.parse(result);
  } catch {
    return result;
  }
}

module.exports = {
  evaluateTransaction,
  submitTransaction,
  getOrgConfig,
};

