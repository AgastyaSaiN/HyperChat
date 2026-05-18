import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

function App() {
  const [org, setOrg] = useState('org1');
  const [groupId, setGroupId] = useState('group-ui-1');
  const [groupName, setGroupName] = useState('UI Test Group');
  const [memberId, setMemberId] = useState('User1@org2.example.com');
  const [messageText, setMessageText] = useState('');
  const [messageId, setMessageId] = useState(() => makeMessageId());
  const [messages, setMessages] = useState([]);
  const [group, setGroup] = useState(null);
  const [status, setStatus] = useState('Ready');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState(() => [
    makeLog('info', `Frontend loaded. API base: ${API_BASE}`),
  ]);

  const currentUser = useMemo(() => {
    return org === 'org1' ? 'User1@org1.example.com' : 'User1@org2.example.com';
  }, [org]);

  useEffect(() => {
    setStatus(`Using ${currentUser}`);
    addLog('info', `Selected identity: ${currentUser}`);
  }, [currentUser]);

  async function checkApiHealth() {
    await runAction('API is reachable', async () => {
      const result = await api('/health', { org, addLog });
      addLog('success', `Health check returned: ${JSON.stringify(result)}`);
    });
  }

  async function createGroup(event) {
    event.preventDefault();
    await runAction('Group created', async () => {
      const result = await api('/groups', {
        method: 'POST',
        org,
        body: { groupId, name: groupName },
        addLog,
      });
      setGroup(result);
      setMessages([]);
    });
  }

  async function loadGroup() {
    await runAction('Group loaded', async () => {
      const result = await api(`/groups/${encodeURIComponent(groupId)}`, { org, addLog });
      setGroup(result);
    });
  }

  async function addMember(event) {
    event.preventDefault();
    await runAction('Member added', async () => {
      const result = await api(`/groups/${encodeURIComponent(groupId)}/members`, {
        method: 'POST',
        org,
        body: { memberId },
        addLog,
      });
      setGroup(result);
    });
  }

  async function sendMessage(event) {
    event.preventDefault();
    await runAction('Message sent', async () => {
      await api(`/groups/${encodeURIComponent(groupId)}/messages`, {
        method: 'POST',
        org,
        body: { messageId, text: messageText },
        addLog,
      });
      setMessageText('');
      setMessageId(makeMessageId());
      await refreshMessages();
    });
  }

  async function refreshMessages() {
    const result = await api(`/groups/${encodeURIComponent(groupId)}/messages`, { org, addLog });
    setMessages(Array.isArray(result) ? result : []);
    return result;
  }

  async function loadMessages() {
    await runAction('Messages loaded', refreshMessages);
  }

  async function runAction(successMessage, action) {
    setLoading(true);
    setError('');
    setStatus('Submitting to Fabric...');
    addLog('info', 'Submitting action...');
    try {
      await action();
      setStatus(successMessage);
      addLog('success', successMessage);
    } catch (err) {
      setError(err.message);
      setStatus('Action failed');
      addLog('error', err.message);
    } finally {
      setLoading(false);
    }
  }

  function addLog(level, message) {
    setLogs((current) => [makeLog(level, message), ...current].slice(0, 40));
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <h1>HyperChat</h1>
          <p>Permissioned group chat on Hyperledger Fabric</p>
        </div>
        <div className="identity-panel">
          <span>{currentUser}</span>
          <div className="segmented">
            <button className={org === 'org1' ? 'active' : ''} onClick={() => setOrg('org1')}>
              Org1
            </button>
            <button className={org === 'org2' ? 'active' : ''} onClick={() => setOrg('org2')}>
              Org2
            </button>
          </div>
        </div>
      </header>

      <section className="status-strip" aria-live="polite">
        <span>{status}</span>
        <button type="button" className="health-button" onClick={checkApiHealth} disabled={loading}>
          Check API
        </button>
        {error && <strong>{error}</strong>}
      </section>

      <section className="workspace">
        <aside className="control-panel">
          <form onSubmit={createGroup} className="form-section">
            <h2>Group</h2>
            <label>
              Group ID
              <input value={groupId} onChange={(event) => setGroupId(event.target.value)} />
            </label>
            <label>
              Name
              <input value={groupName} onChange={(event) => setGroupName(event.target.value)} />
            </label>
            <div className="button-row">
              <button type="submit" disabled={loading}>
                Create
              </button>
              <button type="button" onClick={loadGroup} disabled={loading}>
                Load
              </button>
            </div>
          </form>

          <form onSubmit={addMember} className="form-section">
            <h2>Members</h2>
            <label>
              Member ID
              <input value={memberId} onChange={(event) => setMemberId(event.target.value)} />
            </label>
            <button type="submit" disabled={loading}>
              Add Member
            </button>
          </form>

          <div className="group-summary">
            <h2>Current Group</h2>
            {group ? (
              <>
                <dl>
                  <div>
                    <dt>ID</dt>
                    <dd>{group.groupId}</dd>
                  </div>
                  <div>
                    <dt>Admin</dt>
                    <dd>{group.admin}</dd>
                  </div>
                </dl>
                <ul>
                  {group.members.map((member) => (
                    <li key={member}>{member}</li>
                  ))}
                </ul>
              </>
            ) : (
              <p>No group loaded</p>
            )}
          </div>
        </aside>

        <section className="chat-panel">
          <div className="chat-header">
            <div>
              <h2>{groupId}</h2>
              <p>{messages.length} ledger message{messages.length === 1 ? '' : 's'}</p>
            </div>
            <button type="button" onClick={loadMessages} disabled={loading}>
              Refresh
            </button>
          </div>

          <div className="message-list">
            {messages.length === 0 ? (
              <p className="empty-state">No messages loaded</p>
            ) : (
              messages.map((message) => (
                <article className="message" key={message.messageId}>
                  <div className="message-meta">
                    <strong>{message.sender}</strong>
                    <span>{formatDate(message.createdAt)}</span>
                  </div>
                  <p>{message.text}</p>
                  <small>{message.messageId}</small>
                </article>
              ))
            )}
          </div>

          <form onSubmit={sendMessage} className="composer">
            <label>
              Message ID
              <input value={messageId} onChange={(event) => setMessageId(event.target.value)} />
            </label>
            <label>
              Message
              <textarea
                value={messageText}
                onChange={(event) => setMessageText(event.target.value)}
                placeholder="Write a ledger-backed message"
              />
            </label>
            <button type="submit" disabled={loading || !messageText.trim()}>
              Send
            </button>
          </form>
        </section>
      </section>

      <section className="event-console">
        <div className="console-header">
          <h2>Runtime Console</h2>
          <button type="button" onClick={() => setLogs([])}>
            Clear
          </button>
        </div>
        <div className="console-lines" aria-live="polite">
          {logs.length === 0 ? (
            <p>No events yet</p>
          ) : (
            logs.map((log) => (
              <div className={`console-line ${log.level}`} key={log.id}>
                <span>{log.time}</span>
                <strong>{log.level.toUpperCase()}</strong>
                <p>{log.message}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

async function api(path, options = {}) {
  const url = new URL(path, API_BASE);
  url.searchParams.set('org', options.org || 'org1');
  const method = options.method || 'GET';

  options.addLog?.('request', `${method} ${url.toString()}`);

  let response;
  try {
    response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch (error) {
    throw new Error(
      `Network request failed for ${method} ${url.toString()}. Check that the API is running on ${API_BASE}, the port is reachable from the browser, and CORS is enabled. Browser error: ${error.message}`
    );
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload?.error || `Request failed with status ${response.status}`;
    throw new Error(`${method} ${url.pathname} failed (${response.status}): ${message}`);
  }
  options.addLog?.('response', `${response.status} ${method} ${url.pathname}`);
  return payload;
}

function makeLog(level, message) {
  return {
    id: `${Date.now()}-${Math.random()}`,
    level,
    message,
    time: new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date()),
  };
}

function makeMessageId() {
  return `msg-ui-${Date.now()}`;
}

function formatDate(value) {
  if (!value) {
    return '';
  }
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'medium',
  }).format(new Date(value));
}

createRoot(document.getElementById('root')).render(<App />);
