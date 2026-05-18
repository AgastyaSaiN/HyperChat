'use strict';

const cors = require('cors');
const express = require('express');
const { evaluateTransaction, getOrgConfig, submitTransaction } = require('./fabric');

const app = express();
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || '0.0.0.0';

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'hyperchat-api' });
});

app.get('/whoami', (req, res, next) => {
  try {
    const org = getRequestOrg(req);
    const config = getOrgConfig(org);
    res.json({ org, mspId: config.mspId, userId: config.userId });
  } catch (error) {
    next(error);
  }
});

app.post('/groups', async (req, res, next) => {
  try {
    const { groupId, name } = req.body;
    requireFields({ groupId, name });

    const group = await submitTransaction(getRequestOrg(req), 'CreateGroup', groupId, name);
    res.status(201).json(group);
  } catch (error) {
    next(error);
  }
});

app.get('/groups/:groupId', async (req, res, next) => {
  try {
    const group = await evaluateTransaction(getRequestOrg(req), 'GetGroup', req.params.groupId);
    res.json(group);
  } catch (error) {
    next(error);
  }
});

app.post('/groups/:groupId/members', async (req, res, next) => {
  try {
    const { memberId } = req.body;
    requireFields({ memberId });

    const group = await submitTransaction(getRequestOrg(req), 'AddMember', req.params.groupId, memberId);
    res.json(group);
  } catch (error) {
    next(error);
  }
});

app.post('/groups/:groupId/messages', async (req, res, next) => {
  try {
    const { messageId, text } = req.body;
    requireFields({ messageId, text });

    const message = await submitTransaction(getRequestOrg(req), 'SendMessage', req.params.groupId, messageId, text);
    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
});

app.get('/groups/:groupId/messages', async (req, res, next) => {
  try {
    const messages = await evaluateTransaction(getRequestOrg(req), 'GetMessages', req.params.groupId);
    res.json(messages);
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  const status = error.statusCode || inferStatusCode(error);
  res.status(status).json({
    error: error.message || 'Unexpected API error',
  });
});

function getRequestOrg(req) {
  return req.query.org || req.header('x-hyperchat-org') || 'org1';
}

function requireFields(fields) {
  for (const [name, value] of Object.entries(fields)) {
    if (!value || String(value).trim().length === 0) {
      const error = new Error(`${name} is required`);
      error.statusCode = 400;
      throw error;
    }
  }
}

function inferStatusCode(error) {
  const message = error.message || '';
  if (message.includes('Unsupported org') || message.includes('is required')) {
    return 400;
  }
  if (message.includes('is not a member') || message.includes('Only group admin')) {
    return 403;
  }
  if (message.includes('does not exist')) {
    return 404;
  }
  if (message.includes('already exists')) {
    return 409;
  }
  return 500;
}

app.listen(port, host, () => {
  console.log(`HyperChat API listening on http://${host}:${port}`);
  console.log(`Browser URL: http://localhost:${port}`);
});
