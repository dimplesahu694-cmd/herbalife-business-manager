import React, { useState, useEffect } from 'react';

export default function HerbalifeApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [data, setData] = useState({
    leads: [],
    events: [],
    team: [],
    dailyLog: []
  });

  const [formData, setFormData] = useState({
    leadName: '', leadPhone: '', leadSource: '', leadInterest: '', leadStatus: '',
    eventTicket: '', eventName: '', eventPaid: '', eventAttended: '',
    teamName: '', teamPhone: '', teamLevel: '', teamCategory: '', teamVolume: '',
    logDate: new Date().toISOString().split('T')[0], logContacts: '', logMessages: '', logResponses: '', logCustomers: ''
  });

  const [aiLoading, setAiLoading] = useState(false);
  const [aiTasks, setAiTasks] = useState(null);
  const [syncStatus, setSyncStatus] = useState('✅ Synced');

  // Load initial data
  useEffect(() => {
    const savedUser = localStorage.getItem('herbalifeUser');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setIsLoggedIn(true);
      setShowLoginForm(false);
      const savedData = localStorage.getItem(`herbalifeData_${userData.uid}`);
      if (savedData) setData(JSON.parse(savedData));
    }
  }, []);

  // Save data when it changes
  useEffect(() => {
    if (user && isLoggedIn) {
      localStorage.setItem(`herbalifeData_${user.uid}`, JSON.stringify(data));
      setSyncStatus('✅ Synced');
    }
  }, [data, user, isLoggedIn]);

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    if (!loginEmail || !loginPassword) {
      setLoginError('Please enter email and password');
      return;
    }
    try {
      const userData = { email: loginEmail, uid: btoa(loginEmail + Date.now()) };
      localStorage.setItem('herbalifeUser', JSON.stringify(userData));
      setUser(userData);
      setIsLoggedIn(true);
      setShowLoginForm(false);
    } catch (error) {
      setLoginError('Login failed: ' + error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('herbalifeUser');
    setUser(null);
    setIsLoggedIn(false);
    setShowLoginForm(true);
    setData({ leads: [], events: [], team: [], dailyLog: [] });
  };

  // Add Lead
  const addLead = () => {
    if (!formData.leadName || !formData.leadPhone) {
      alert('Please fill in Name and Phone');
      return;
    }
    setData({
      ...data,
      leads: [...data.leads, {
        id: Date.now(),
        leadName: formData.leadName,
        leadPhone: formData.leadPhone,
        leadSource: formData.leadSource || 'Not specified',
        leadInterest: formData.leadInterest || 'Not specified',
        leadStatus: formData.leadStatus || 'New'
      }]
    });
    setFormData(prev => ({
      ...prev,
      leadName: '', leadPhone: '', leadSource: '', leadInterest: '', leadStatus: ''
    }));
  };

  // Add Event
  const addEvent = () => {
    if (!formData.eventTicket || !formData.eventName) {
      alert('Please fill Ticket and Name');
      return;
    }
    setData({
      ...data,
      events: [...data.events, {
        id: Date.now(),
        ticket: formData.eventTicket,
        name: formData.eventName,
        paid: formData.eventPaid || 'Pending'
      }]
    });
    setFormData(prev => ({ ...prev, eventTicket: '', eventName: '', eventPaid: '' }));
  };

  // Add Team
  const addTeam = () => {
    if (!formData.teamName) {
      alert('Please fill in Name');
      return;
    }
    setData({
      ...data,
      team: [...data.team, {
        id: Date.now(),
        name: formData.teamName,
        phone: formData.teamPhone,
        level: formData.teamLevel || 'Direct',
        category: formData.teamCategory || 'Active'
      }]
    });
    setFormData(prev => ({ ...prev, teamName: '', teamPhone: '', teamLevel: '', teamCategory: '' }));
  };

  // Add Daily Log
  const addLog = () => {
    if (!formData.logDate) {
      alert('Please select date');
      return;
    }
    setData({
      ...data,
      dailyLog: [...data.dailyLog, {
        id: Date.now(),
        date: formData.logDate,
        contacts: parseInt(formData.logContacts) || 0,
        messages: parseInt(formData.logMessages) || 0,
        responses: parseInt(formData.logResponses) || 0,
        customers: parseInt(formData.logCustomers) || 0
      }]
    });
    setFormData(prev => ({
      ...prev,
      logDate: new Date().toISOString().split('T')[0],
      logContacts: '', logMessages: '', logResponses: '', logCustomers: ''
    }));
  };

  // Generate AI Tasks
  const generateAITasks = async () => {
    setAiLoading(true);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `Generate a specific daily task list for a Herbalife distributor. Morning (7-9 AM), Afternoon (12-2 PM), Evening (7-8 PM). Current: ${data.leads.length} leads, ${data.leads.filter(l => l.leadStatus === 'Hot Lead').length} hot leads, ${data.team.length} team.`
          }]
        })
      });
      const result = await response.json();
      if (result.content && result.content[0]) {
        setAiTasks(result.content[0].text);
      }
    } catch (error) {
      setAiTasks('Error generating tasks. Try again.');
    }
    setAiLoading(false);
  };

  // Styles
  const styles = {
    container: { fontFamily: 'system-ui, sans-serif', backgroundColor: '#f5f5f5', minHeight: '100vh', margin: 0, padding: 0 },
    header: { background: '#fff', padding: '1.5rem', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: '24px', fontWeight: '600', margin: 0 },
    button: { background: '#2563eb', color: '#fff', padding: '10px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', marginRight: '8px' },
    input: { width: '100%', padding: '10px 12px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' },
    card: { background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1.5rem', marginBottom: '1.5rem' },
    tabs: { display: 'flex', gap: 0, borderBottom: '1px solid #e0e0e0', background: '#fff', overflowX: 'auto', position: 'sticky', top: 0, zIndex: 99 },
    tab: { padding: '12px 16px', cursor: 'pointer', borderBottom: '3px solid transparent', fontSize: '14px', fontWeight: '500', whiteSpace: 'nowrap', color: '#666' },
    tabActive: { borderBottomColor: '#2563eb', color: '#2563eb' },
    section: { padding: '1.5rem', maxWidth: '900px', margin: '0 auto' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '1.5rem' },
    metric: { background: '#f8f9fa', padding: '1rem', borderRadius: '8px', textAlign: 'center', border: '1px solid #e0e0e0' },
    metricValue: { fontSize: '28px', fontWeight: '700', color: '#2563eb' },
    table: { width: '100%', fontSize: '13px', borderCollapse: 'collapse', marginTop: '1rem' },
    th: { textAlign: 'left', padding: '10px', borderBottom: '2px solid #e0e0e0', fontWeight: '600', backgroundColor: '#f8f9fa' },
    td: { padding: '10px', borderBottom: '1px solid #e0e0e0' }
  };

  // Login screen
  if (!isLoggedIn) {
    return (
      <div style={styles.container}>
        <div style={styles.header}><div style={styles.title}>🎯 Herbalife Business Manager</div></div>
        <div style={styles.section}>
          <div style={styles.card}>
            <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '1rem' }}>🔐 Login / Create Account</div>
            <form onSubmit={handleLogin}>
              <input style={styles.input} placeholder="Email" type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
              <input style={styles.input} placeholder="Password" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
              {loginError && <div style={{ color: '#dc2626', fontSize: '13px', marginBottom: '1rem' }}>{loginError}</div>}
              <button type="submit" style={styles.button}>Sign In / Create</button>
            </form>
            <div style={{ background: '#f0f9ff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '1rem', marginTop: '1rem', fontSize: '13px' }}>
              Use any email and password to sign in!
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main app
  const hotLeads = data.leads.filter(l => l.leadStatus === 'Hot Lead').length;
  const customers = data.leads.filter(l => l.leadStatus === 'Converted').length;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div><div style={styles.title}>🎯 Herbalife Business Manager</div><div style={{ fontSize: '12px', color: '#666' }}>☁️ {syncStatus}</div></div>
        <div><div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>👤 {user?.email}</div><button onClick={handleLogout} style={{...styles.button, background: '#dc2626', padding: '8px 16px'}}>Logout</button></div>
      </div>

      <div style={styles.tabs}>
        {[{id: 'dashboard', label: '📊 Dashboard'}, {id: 'leads', label: '📋 Leads'}, {id: 'events', label: '🎟️ Events'}, {id: 'team', label: '👥 Team'}, {id: 'daily', label: '📅 Daily Log'}].map(t => (
          <div key={t.id} onClick={() => setActiveTab(t.id)} style={{...styles.tab, ...(activeTab === t.id ? styles.tabActive : {})}}>{t.label}</div>
        ))}
      </div>

      <div style={styles.section}>
        {activeTab === 'dashboard' && (
          <div>
            <div style={styles.grid}>
              <div style={styles.metric}><div style={{ fontSize: '12px', color: '#666' }}>Total Leads</div><div style={styles.metricValue}>{data.leads.length}</div></div>
              <div style={styles.metric}><div style={{ fontSize: '12px', color: '#666' }}>Hot Leads</div><div style={styles.metricValue}>{hotLeads}</div></div>
              <div style={styles.metric}><div style={{ fontSize: '12px', color: '#666' }}>Customers</div><div style={styles.metricValue}>{customers}</div></div>
              <div style={styles.metric}><div style={{ fontSize: '12px', color: '#666' }}>Team</div><div style={styles.metricValue}>{data.team.length}</div></div>
            </div>
            <div style={styles.card}>
              <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '1rem' }}>🤖 AI Task Generator</div>
              <button onClick={generateAITasks} disabled={aiLoading} style={{...styles.button, opacity: aiLoading ? 0.6 : 1}}>{aiLoading ? '⏳ Generating...' : '✨ Generate Tasks'}</button>
              {aiTasks && <div style={{ marginTop: '1rem', padding: '1rem', background: '#f0f9ff', borderRadius: '6px', fontSize: '13px', whiteSpace: 'pre-wrap', lineHeight: '1.6', color: '#1e40af' }}>{aiTasks}</div>}
            </div>
          </div>
        )}

        {activeTab === 'leads' && (
          <div>
            <div style={styles.card}>
              <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '1rem' }}>➕ Add Lead</div>
              <input style={styles.input} placeholder="Name" value={formData.leadName} onChange={(e) => setFormData({...formData, leadName: e.target.value})} />
              <input style={styles.input} placeholder="Phone" value={formData.leadPhone} onChange={(e) => setFormData({...formData, leadPhone: e.target.value})} />
              <select style={styles.input} value={formData.leadSource} onChange={(e) => setFormData({...formData, leadSource: e.target.value})}>
                <option>Select Source</option>
                <option>WhatsApp</option>
                <option>Instagram</option>
                <option>Facebook</option>
                <option>Referral</option>
              </select>
              <select style={styles.input} value={formData.leadStatus} onChange={(e) => setFormData({...formData, leadStatus: e.target.value})}>
                <option>Select Status</option>
                <option>New</option>
                <option>Hot Lead</option>
                <option>Warm Lead</option>
                <option>Converted</option>
              </select>
              <button onClick={addLead} style={styles.button}>+ Add Lead</button>
            </div>
            {data.leads.length > 0 && (
              <div style={styles.card}>
                <table style={styles.table}>
                  <thead><tr><th style={styles.th}>Name</th><th style={styles.th}>Phone</th><th style={styles.th}>Status</th></tr></thead>
                  <tbody>
                    {data.leads.map(lead => (
                      <tr key={lead.id}><td style={styles.td}>{lead.leadName}</td><td style={styles.td}>{lead.leadPhone}</td><td style={styles.td}>{lead.leadStatus}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'events' && (
          <div>
            <div style={styles.card}>
              <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '1rem' }}>🎟️ Add Ticket</div>
              <input style={styles.input} placeholder="Ticket Number" value={formData.eventTicket} onChange={(e) => setFormData({...formData, eventTicket: e.target.value})} />
              <input style={styles.input} placeholder="Name" value={formData.eventName} onChange={(e) => setFormData({...formData, eventName: e.target.value})} />
              <button onClick={addEvent} style={styles.button}>+ Add Ticket</button>
            </div>
          </div>
        )}

        {activeTab === 'team' && (
          <div>
            <div style={styles.card}>
              <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '1rem' }}>👥 Add Member</div>
              <input style={styles.input} placeholder="Name" value={formData.teamName} onChange={(e) => setFormData({...formData, teamName: e.target.value})} />
              <input style={styles.input} placeholder="Phone" value={formData.teamPhone} onChange={(e) => setFormData({...formData, teamPhone: e.target.value})} />
              <button onClick={addTeam} style={styles.button}>+ Add Member</button>
            </div>
          </div>
        )}

        {activeTab === 'daily' && (
          <div>
            <div style={styles.card}>
              <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '1rem' }}>📊 Daily Log</div>
              <input style={styles.input} type="date" value={formData.logDate} onChange={(e) => setFormData({...formData, logDate: e.target.value})} />
              <input style={styles.input} placeholder="Contacts" type="number" value={formData.logContacts} onChange={(e) => setFormData({...formData, logContacts: e.target.value})} />
              <input style={styles.input} placeholder="Messages" type="number" value={formData.logMessages} onChange={(e) => setFormData({...formData, logMessages: e.target.value})} />
              <button onClick={addLog} style={styles.button}>+ Log</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
