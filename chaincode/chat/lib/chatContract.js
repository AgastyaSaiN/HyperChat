'use strict';

const { Contract } = require('fabric-contract-api');

class ChatContract extends Contract {
  async InitLedger() {
    return 'HyperChat ledger initialized';
  }

  async CreateGroup(ctx, groupId, name) {
    this._requireValue(groupId, 'groupId');
    this._requireValue(name, 'name');

    const existing = await ctx.stub.getState(this._groupKey(groupId));
    if (existing && existing.length > 0) {
      throw new Error(`Group ${groupId} already exists`);
    }

    const caller = this._getCallerId(ctx);
    const group = {
      docType: 'group',
      groupId,
      name,
      admin: caller,
      members: [caller],
      createdAt: this._getTxTimestamp(ctx),
    };

    await ctx.stub.putState(this._groupKey(groupId), Buffer.from(JSON.stringify(group)));
    return JSON.stringify(group);
  }

  async AddMember(ctx, groupId, memberId) {
    this._requireValue(groupId, 'groupId');
    this._requireValue(memberId, 'memberId');

    const group = await this._getGroup(ctx, groupId);
    const caller = this._getCallerId(ctx);

    if (group.admin !== caller) {
      throw new Error(`Only group admin ${group.admin} can add members`);
    }

    if (!group.members.includes(memberId)) {
      group.members.push(memberId);
      await ctx.stub.putState(this._groupKey(groupId), Buffer.from(JSON.stringify(group)));
    }

    return JSON.stringify(group);
  }

  async SendMessage(ctx, groupId, messageId, text) {
    this._requireValue(groupId, 'groupId');
    this._requireValue(messageId, 'messageId');
    this._requireValue(text, 'text');

    const existing = await ctx.stub.getState(this._messageKey(groupId, messageId));
    if (existing && existing.length > 0) {
      throw new Error(`Message ${messageId} already exists in group ${groupId}`);
    }

    const group = await this._getGroup(ctx, groupId);
    const caller = this._getCallerId(ctx);

    if (!group.members.includes(caller)) {
      throw new Error(`Caller ${caller} is not a member of group ${groupId}`);
    }

    const message = {
      docType: 'message',
      messageId,
      groupId,
      sender: caller,
      text,
      createdAt: this._getTxTimestamp(ctx),
    };

    await ctx.stub.putState(this._messageKey(groupId, messageId), Buffer.from(JSON.stringify(message)));
    return JSON.stringify(message);
  }

  async GetGroup(ctx, groupId) {
    const group = await this._getGroup(ctx, groupId);
    this._requireGroupMember(ctx, group);
    return JSON.stringify(group);
  }

  async GetMessages(ctx, groupId) {
    this._requireValue(groupId, 'groupId');

    const group = await this._getGroup(ctx, groupId);
    this._requireGroupMember(ctx, group);

    const iterator = await ctx.stub.getStateByRange(
      this._messageKey(groupId, ''),
      this._messageKey(groupId, '\uffff')
    );

    const messages = [];
    try {
      while (true) {
        const result = await iterator.next();
        if (result.value && result.value.value) {
          messages.push(JSON.parse(result.value.value.toString('utf8')));
        }

        if (result.done) {
          break;
        }
      }
    } finally {
      await iterator.close();
    }

    messages.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    return JSON.stringify(messages);
  }

  async _getGroup(ctx, groupId) {
    this._requireValue(groupId, 'groupId');

    const groupBytes = await ctx.stub.getState(this._groupKey(groupId));
    if (!groupBytes || groupBytes.length === 0) {
      throw new Error(`Group ${groupId} does not exist`);
    }

    return JSON.parse(groupBytes.toString('utf8'));
  }

  _requireGroupMember(ctx, group) {
    const caller = this._getCallerId(ctx);
    if (!group.members.includes(caller)) {
      throw new Error(`Caller ${caller} is not a member of group ${group.groupId}`);
    }
  }

  _getCallerId(ctx) {
    const clientId = ctx.clientIdentity.getID();
    const match = clientId.match(/::CN=([^:/]+)(?:::|$)/);
    return match ? match[1] : clientId;
  }

  _getTxTimestamp(ctx) {
    const timestamp = ctx.stub.getTxTimestamp();
    const millis = Number(timestamp.seconds.low) * 1000 + Math.floor(timestamp.nanos / 1000000);
    return new Date(millis).toISOString();
  }

  _groupKey(groupId) {
    return `group:${groupId}`;
  }

  _messageKey(groupId, messageId) {
    return `message:${groupId}:${messageId}`;
  }

  _requireValue(value, name) {
    if (!value || String(value).trim().length === 0) {
      throw new Error(`${name} is required`);
    }
  }
}

module.exports = ChatContract;

