'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DEFAULT_RISK_SETTINGS, BrokerConfig } from '@/lib/types';

const MOCK_BROKERS: BrokerConfig[] = [
  { id: '1', name: 'Binance', enabled: true, apiKey: 'xxxx-xxxx-xxxx-1234', apiSecret: 'xxxx-xxxx-xxxx-5678', connected: true, lastChecked: new Date().toISOString(), permissions: ['read', 'trade'] },
  { id: '2', name: 'Zerodha', enabled: false, apiKey: '', apiSecret: '', connected: false, lastChecked: '', permissions: [] },
  { id: '3', name: 'CoinDCX', enabled: false, apiKey: '', apiSecret: '', connected: false, lastChecked: '', permissions: [] },
  { id: '4', name: 'TradingView', enabled: false, apiKey: '', apiSecret: '', connected: false, lastChecked: '', permissions: [] },
  { id: '5', name: 'Groww', enabled: false, apiKey: '', apiSecret: '', connected: false, lastChecked: '', permissions: [] },
];

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'risk' | 'brokers'>('risk');
  const [settings, setSettings] = useState(DEFAULT_RISK_SETTINGS);
  const [brokers, setBrokers] = useState(MOCK_BROKERS);

  const handleSave = () => {
    // Mock save
    alert('Settings saved successfully.');
  };

  return (
    <div style={{ padding: '32px', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>System Settings</h1>
          <p style={{ color: 'var(--text-muted)' }}>Configure risk parameters and broker integrations.</p>
        </div>
        <button className="btn btn-ghost" onClick={() => router.push('/dashboard')}>
          Back to Dashboard
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
        <button 
          className={`btn ${activeTab === 'risk' ? 'btn-primary' : 'btn-ghost'}`} 
          onClick={() => setActiveTab('risk')}
        >Risk Engine</button>
        <button 
          className={`btn ${activeTab === 'brokers' ? 'btn-primary' : 'btn-ghost'}`} 
          onClick={() => setActiveTab('brokers')}
        >Broker APIs</button>
      </div>

      {activeTab === 'risk' && (
        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 8, color: 'var(--cyan)' }}>Position & Risk Rules</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 6 }}>Risk per Trade (%)</label>
              <input type="number" className="input" value={settings.riskPerTradePct} onChange={e => setSettings({...settings, riskPerTradePct: Number(e.target.value)})} step="0.1" />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Percentage of equity risked per signal.</p>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 6 }}>Max Daily Loss (%)</label>
              <input type="number" className="input" value={settings.maxDailyLossPct} onChange={e => setSettings({...settings, maxDailyLossPct: Number(e.target.value)})} step="0.1" />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Trading pauses if loss exceeds this limit.</p>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 6 }}>Max Concurrent Positions</label>
              <input type="number" className="input" value={settings.maxConcurrentPositions} onChange={e => setSettings({...settings, maxConcurrentPositions: Number(e.target.value)})} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 6 }}>Trading Style</label>
              <select className="input" value={settings.tradingStyle} onChange={e => setSettings({...settings, tradingStyle: e.target.value as any})}>
                <option value="scalp">Scalp (1-15m)</option>
                <option value="intraday">Intraday (15m-1h)</option>
                <option value="swing">Swing (4h-1d)</option>
                <option value="positional">Positional (1d-1w)</option>
              </select>
            </div>
          </div>

          <div className="divider" style={{ margin: '16px 0' }} />

          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 8, color: 'var(--violet)' }}>Automation Mode</h3>
          <div style={{ display: 'flex', gap: 12 }}>
            <select className="input" style={{ flex: 1 }} value={settings.automationLevel} onChange={e => setSettings({...settings, automationLevel: Number(e.target.value) as any})}>
              <option value={0}>Level 0: Analysis Only</option>
              <option value={1}>Level 1: Alerts</option>
              <option value={2}>Level 2: Recommendations</option>
              <option value={3}>Level 3: Confirm before Execute</option>
              <option value={4}>Level 4: Full Auto-Trading</option>
            </select>
            <select className="input" style={{ flex: 1 }} value={settings.accountMode} onChange={e => setSettings({...settings, accountMode: e.target.value as any})}>
              <option value="demo">Paper Trading (Demo)</option>
              <option value="real">Real Money (API)</option>
            </select>
          </div>
        </div>
      )}

      {activeTab === 'brokers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 8, border: '1px solid var(--border)' }}>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              API keys are encrypted locally and never transmitted to our servers. They are injected directly into your exchange HTTP requests. Enable IP-restrictions on your exchange for maximum security.
            </p>
          </div>

          {brokers.map(b => (
            <div key={b.id} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    {b.name.substring(0,2).toUpperCase()}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{b.name}</h4>
                    <div style={{ fontSize: '0.75rem', color: b.connected ? 'var(--success)' : 'var(--text-muted)' }}>
                      {b.connected ? '● Connected' : '○ Not configured'}
                    </div>
                  </div>
                </div>
                <label className="toggle">
                  <input type="checkbox" checked={b.enabled} onChange={() => {}} />
                  <div className="toggle-track"><div className="toggle-thumb" /></div>
                </label>
              </div>

              {b.enabled && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>API Key</label>
                    <input type="text" className="input" defaultValue={b.apiKey} placeholder="Enter API Key" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>API Secret</label>
                    <input type="password" className="input" defaultValue={b.apiSecret} placeholder="Enter API Secret" />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                    <button className="btn btn-ghost btn-sm">Test Connection</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
        <button className="btn btn-success" onClick={handleSave}>Save Configuration</button>
      </div>

    </div>
  );
}
