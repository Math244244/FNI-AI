import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getDealers, createDealer, updateDealer, toggleDealerActive,
  getUsersByDealer, createUser, toggleUserActive,
} from '../../services/adminService';
import {
  Building2, Plus, Edit2, Users, Search, X, Save,
  ToggleLeft, ToggleRight, ChevronDown, ChevronRight, UserPlus,
  Phone, Mail, MapPin, Eye, EyeOff, Loader,
} from 'lucide-react';

/* ══════════════════ DEALER MODAL ══════════════════ */
function DealerModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState({
    name:     initial?.name     || '',
    address:  initial?.address  || '',
    city:     initial?.city     || '',
    province: initial?.province || 'QC',
    phone:    initial?.phone    || '',
    email:    initial?.email    || '',
    logo:     initial?.logo     || '',
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');
  const f = (k) => (v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Le nom du concessionnaire est requis'); return; }
    setSaving(true);
    try { await onSave(form); onClose(); }
    catch (e) { setError(e.message); setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ fontSize: '1.125rem' }}>
            {initial ? '✏️ Modifier le concessionnaire' : '🏢 Nouveau concessionnaire'}
          </h2>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {error && (
            <div style={{ padding: '0.75rem', background: 'var(--brand-red-light)', border: '1px solid var(--brand-red-border)', borderRadius: 'var(--r-md)', fontSize: '0.8375rem', color: 'var(--brand-red)' }}>
              ⚠️ {error}
            </div>
          )}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Nom du concessionnaire *</label>
            <input className="form-input" placeholder="Ex. : Toyota Sherbrooke" value={form.name} onChange={e => f('name')(e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Courriel</label>
              <input className="form-input" type="email" placeholder="info@dealer.ca" value={form.email} onChange={e => f('email')(e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Téléphone</label>
              <input className="form-input" placeholder="819-555-1234" value={form.phone} onChange={e => f('phone')(e.target.value)} />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Adresse</label>
            <input className="form-input" placeholder="123 rue Principale" value={form.address} onChange={e => f('address')(e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Ville</label>
              <input className="form-input" placeholder="Sherbrooke" value={form.city} onChange={e => f('city')(e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Province</label>
              <select className="form-input" value={form.province} onChange={e => f('province')(e.target.value)}>
                {['QC','ON','BC','AB','MB','SK','NS','NB','PE','NL'].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Logo (URL optionnel)</label>
            <input className="form-input" placeholder="https://..." value={form.logo} onChange={e => f('logo')(e.target.value)} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-ghost" onClick={onClose}>Annuler</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <><Loader size={14} /> Sauvegarde…</> : <><Save size={14} /> {initial ? 'Mettre à jour' : 'Créer'}</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════ USER MODAL ══════════════════ */
function UserModal({ dealerId, dealerName, onSave, onClose }) {
  const [form, setForm] = useState({ displayName: '', email: '', password: '', role: 'seller', phone: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const f = (k) => (v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.displayName || !form.email || !form.password) { setError('Tous les champs marqués * sont requis'); return; }
    if (form.password.length < 6) { setError('Le mot de passe doit contenir au moins 6 caractères'); return; }
    setSaving(true); setError('');
    try {
      await onSave({ ...form, dealerId });
      onClose();
    } catch (e) {
      const msg = {
        'auth/email-already-in-use': 'Ce courriel est déjà utilisé par un autre compte.',
        'auth/invalid-email':        'Format de courriel invalide.',
        'auth/weak-password':        'Mot de passe trop faible (min. 6 caractères).',
      }[e.code] || e.message;
      setError(msg);
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: '1.125rem' }}>👤 Nouvel utilisateur</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', margin: 0 }}>
              Concessionnaire : {dealerName}
            </p>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {error && (
            <div style={{ padding: '0.75rem', background: 'var(--brand-red-light)', border: '1px solid var(--brand-red-border)', borderRadius: 'var(--r-md)', fontSize: '0.8375rem', color: 'var(--brand-red)' }}>
              ⚠️ {error}
            </div>
          )}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Nom complet *</label>
            <input className="form-input" placeholder="Jean Tremblay" value={form.displayName} onChange={e => f('displayName')(e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Courriel *</label>
              <input className="form-input" type="email" placeholder="jean@dealer.ca" value={form.email} onChange={e => f('email')(e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Téléphone</label>
              <input className="form-input" placeholder="819-555-0001" value={form.phone} onChange={e => f('phone')(e.target.value)} />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Mot de passe temporaire *</label>
            <div style={{ position: 'relative' }}>
              <input className="form-input" type={showPwd ? 'text' : 'password'} placeholder="Min. 6 caractères" value={form.password}
                onChange={e => f('password')(e.target.value)} style={{ paddingRight: '2.5rem' }} />
              <button type="button" onClick={() => setShowPwd(s=>!s)} style={{
                position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: '0.2rem',
              }}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Rôle</label>
            <select className="form-input" value={form.role} onChange={e => f('role')(e.target.value)}>
              <option value="seller">Conseiller F&I (Vendeur)</option>
              <option value="dealerAdmin">Administrateur du concessionnaire</option>
            </select>
          </div>
          <div style={{
            padding: '0.75rem 0.875rem', background: 'var(--info-light)',
            border: '1px solid rgba(37,99,235,0.2)', borderRadius: 'var(--r-md)',
            fontSize: '0.8rem', color: 'var(--info)',
          }}>
            💡 L'utilisateur pourra se connecter avec ce courriel et ce mot de passe. Vous pouvez lui demander de le changer lors de sa première connexion.
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-ghost" onClick={onClose}>Annuler</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <><Loader size={14} /> Création…</> : <><UserPlus size={14} /> Créer l'utilisateur</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════ DEALER ROW ══════════════════ */
function DealerRow({ dealer, onEdit, onToggle, onAddUser }) {
  const [expanded, setExpanded] = useState(false);
  const [users, setUsers]       = useState([]);
  const [usersLoaded, setUsersLoaded] = useState(false);

  const loadUsers = async () => {
    if (!usersLoaded) {
      const u = await getUsersByDealer(dealer.id);
      setUsers(u);
      setUsersLoaded(true);
    }
    setExpanded(e => !e);
  };

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '0.75rem', opacity: dealer.active ? 1 : 0.55 }}>
      {/* Dealer header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem' }}>
        <div style={{
          width: 44, height: 44, borderRadius: '12px', flexShrink: 0,
          background: dealer.active ? 'var(--brand-red-light)' : 'var(--bg-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem',
        }}>
          {dealer.logo ? <img src={dealer.logo} alt="" style={{ width: 36, height: 36, objectFit: 'contain' }} /> : '🏢'}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontWeight: 800, fontSize: '0.9375rem' }}>{dealer.name}</span>
            <span className={`badge ${dealer.active ? 'badge-green' : 'badge-red'}`}>
              {dealer.active ? 'Actif' : 'Inactif'}
            </span>
          </div>
          <div style={{ fontSize: '0.775rem', color: 'var(--text-tertiary)', display: 'flex', gap: '0.875rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
            {dealer.city && <span><MapPin size={10} /> {dealer.city}, {dealer.province}</span>}
            {dealer.phone && <span><Phone size={10} /> {dealer.phone}</span>}
            {dealer.email && <span><Mail size={10} /> {dealer.email}</span>}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexShrink: 0 }}>
          <button className="btn-ghost" style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem', display: 'flex', gap: '0.35rem' }}
            onClick={() => onAddUser(dealer)}>
            <UserPlus size={13} /> Ajouter un user
          </button>
          <button className="btn-icon" onClick={() => onEdit(dealer)} title="Modifier"><Edit2 size={14} /></button>
          <button className="btn-icon"
            style={{ color: dealer.active ? 'var(--success)' : 'var(--text-tertiary)' }}
            onClick={() => onToggle(dealer)} title={dealer.active ? 'Désactiver' : 'Activer'}>
            {dealer.active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
          </button>
          <button className="btn-icon" onClick={loadUsers} title="Voir les utilisateurs">
            <Users size={14} />
            {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
        </div>
      </div>

      {/* Expanded users */}
      {expanded && (
        <div style={{ borderTop: '1px solid var(--border-sm)', background: 'var(--bg-subtle)', padding: '0.875rem 1.25rem' }}>
          {users.length === 0 ? (
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.825rem', margin: 0 }}>
              Aucun utilisateur pour ce concessionnaire.
            </p>
          ) : users.map(u => (
            <div key={u.id} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.5rem 0', borderBottom: '1px solid var(--border-sm)',
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: u.role === 'dealerAdmin' ? 'var(--brand-red-light)' : 'var(--info-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.9rem', flexShrink: 0,
              }}>
                {u.role === 'dealerAdmin' ? '👑' : '👤'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.8375rem' }}>{u.displayName}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{u.email}</div>
              </div>
              <span className={`badge ${u.role === 'dealerAdmin' ? 'badge-red' : 'badge-blue'}`}>
                {u.role === 'dealerAdmin' ? 'Admin' : 'Conseiller'}
              </span>
              <span className={`badge ${u.active ? 'badge-green' : 'badge-red'}`}>
                {u.active ? '●' : '○'}
              </span>
              <button className="btn-icon" style={{ width: 28, height: 28, color: u.active ? 'var(--success)' : 'var(--text-tertiary)' }}
                onClick={async () => {
                  await toggleUserActive(u.id, !u.active);
                  setUsers(prev => prev.map(p => p.id === u.id ? { ...p, active: !p.active } : p));
                }}>
                {u.active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════ MAIN PAGE ══════════════════ */
export default function DealerManagement() {
  const { currentUser } = useAuth();
  const [dealers,     setDealers]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [showDealer,  setShowDealer]  = useState(false);
  const [editDealer,  setEditDealer]  = useState(null);
  const [addUserTo,   setAddUserTo]   = useState(null);

  const load = async () => {
    setLoading(true);
    try { setDealers(await getDealers()); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = dealers.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    (d.city || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateDealer = async (data) => {
    await createDealer(data, currentUser.uid);
    await load();
  };

  const handleUpdateDealer = async (data) => {
    await updateDealer(editDealer.id, data);
    await load();
  };

  const handleToggle = async (dealer) => {
    await toggleDealerActive(dealer.id, !dealer.active);
    await load();
  };

  const handleCreateUser = async (data) => {
    await createUser(data);
    setAddUserTo(null);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.625rem', marginBottom: '0.25rem' }}>Gestion des concessionnaires</h1>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', margin: 0 }}>
            {dealers.length} concessionnaire{dealers.length !== 1 ? 's' : ''} enregistré{dealers.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button className="btn-primary" onClick={() => { setEditDealer(null); setShowDealer(true); }}>
          <Plus size={15} /> Nouveau concessionnaire
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '1.5rem', maxWidth: 420 }}>
        <Search size={15} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
        <input className="form-input" placeholder="Rechercher par nom ou ville…"
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ paddingLeft: '2.5rem' }} />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-tertiary)' }}>
          <Loader size={28} style={{ animation: 'spin 0.8s linear infinite', marginBottom: '0.5rem' }} />
          <p>Chargement…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-tertiary)' }}>
          <Building2 size={40} style={{ opacity: 0.25, marginBottom: '0.75rem' }} />
          <p>Aucun concessionnaire trouvé</p>
          <button className="btn-primary" style={{ marginTop: '0.75rem' }} onClick={() => { setEditDealer(null); setShowDealer(true); }}>
            Créer le premier concessionnaire
          </button>
        </div>
      ) : filtered.map(d => (
        <DealerRow
          key={d.id} dealer={d}
          onEdit={(d) => { setEditDealer(d); setShowDealer(true); }}
          onToggle={handleToggle}
          onAddUser={setAddUserTo}
        />
      ))}

      {/* Dealer modal */}
      {showDealer && (
        <DealerModal
          initial={editDealer}
          onSave={editDealer ? handleUpdateDealer : handleCreateDealer}
          onClose={() => { setShowDealer(false); setEditDealer(null); }}
        />
      )}

      {/* User modal */}
      {addUserTo && (
        <UserModal
          dealerId={addUserTo.id}
          dealerName={addUserTo.name}
          onSave={handleCreateUser}
          onClose={() => setAddUserTo(null)}
        />
      )}

    </div>
  );
}
