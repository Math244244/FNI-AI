import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PRODUCTS } from '../data/products';
import { loadDealerSettings, saveDealerSettings } from '../services/settingsService';
import {
  buildMergedProductListFromSettings,
  buildCatalogOverridesMap,
  buildCustomProductsPayload,
  DEALER_SETTINGS_VERSION,
} from '../utils/dealerSettingsMerge';
import PricingPanel from '../components/settings/PricingPanel';
import {
  Settings as SettingsIcon, Save, Plus, X, Upload, FileText,
  ChevronUp, ChevronDown, ArrowLeft, GripVertical, Eye, Trash2,
  Image as ImageIcon, ExternalLink,
} from 'lucide-react';

/* ─── Custom Toggle ─── */
function Toggle({ on, onChange }) {
  return (
    <div
      className={`toggle ${on ? 'on' : 'off'}`}
      onClick={() => onChange(!on)}
      role="checkbox"
      aria-checked={on}
    >
      <div className="toggle-thumb" />
    </div>
  );
}

/* ─── Custom Page Modal ─── */
function CustomPageModal({ initial, onSave, onClose }) {
  const [title,   setTitle]   = useState(initial?.title    || '');
  const [emoji,   setEmoji]   = useState(initial?.icon     || '📄');
  const [hook,    setHook]    = useState(initial?.hook?.text || '');
  const [risk,    setRisk]    = useState(initial?.risk?.points?.join('\n')    || '');
  const [solution,setSolution]= useState(initial?.solution?.points?.join('\n')|| '');
  const [image,   setImage]   = useState(initial?.customImage || '');
  const [pdfName, setPdfName] = useState(initial?.pdfName || '');
  const [pdfB64,  setPdfB64]  = useState(initial?.pdfBase64 || '');

  const fileRef = useRef();
  const pdfRef  = useRef();

  const handleImageFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('Image trop lourde (max 5 Mo)'); return; }
    const reader = new FileReader();
    reader.onload = ev => setImage(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handlePdfFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert('PDF trop lourd (max 10 Mo)'); return; }
    setPdfName(file.name);
    const reader = new FileReader();
    reader.onload = ev => setPdfB64(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!title.trim()) { alert('Le titre est requis'); return; }
    onSave({
      id:     initial?.id || `custom_${Date.now()}`,
      title,
      icon:   emoji,
      isCustom: true,
      hook:     { headline: title, text: hook },
      risk:     { headline: 'Points importants :', points: risk.split('\n').filter(Boolean) },
      solution: { headline: 'Ce que vous obtenez :', points: solution.split('\n').filter(Boolean) },
      vehicle_dots: [],
      emoji_hook:     '📌',
      emoji_risk:     '⚠️',
      emoji_solution: '✅',
      customImage:  image    || null,
      pdfName:      pdfName  || null,
      pdfBase64:    pdfB64   || null,
      customContent: hook,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 640 }}>
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: '1.125rem' }}>
              {initial ? '✏️ Modifier la page' : '➕ Ajouter une page personnalisée'}
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', margin: 0 }}>
              Cette page apparaîtra dans le flux de présentation
            </p>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Emoji + Title */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ width: 80 }}>
              <label className="form-label">Icône</label>
              <input
                className="form-input"
                value={emoji}
                onChange={e => setEmoji(e.target.value)}
                style={{ textAlign: 'center', fontSize: '1.4rem', padding: '0.6rem' }}
                maxLength={2}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label className="form-label">Titre de la page *</label>
              <input
                className="form-input"
                placeholder="ex. : Protection Peinture Premium"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>
          </div>

          {/* Hook text */}
          <div>
            <label className="form-label">📌 Texte principal (accroche)</label>
            <textarea
              className="form-input"
              placeholder="Décrivez l'essentiel du produit en 2-3 phrases..."
              value={hook}
              onChange={e => setHook(e.target.value)}
              rows={3}
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Risk & Solution in 2 cols */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label className="form-label">⚠️ Points de risque <span style={{ fontWeight: 400, color: 'var(--text-tertiary)' }}>(1 par ligne)</span></label>
              <textarea
                className="form-input"
                placeholder={"Risque A\nRisque B\nRisque C"}
                value={risk}
                onChange={e => setRisk(e.target.value)}
                rows={4}
                style={{ resize: 'vertical', fontSize: '0.8375rem' }}
              />
            </div>
            <div>
              <label className="form-label">✅ Avantages <span style={{ fontWeight: 400, color: 'var(--text-tertiary)' }}>(1 par ligne)</span></label>
              <textarea
                className="form-input"
                placeholder={"Avantage A\nAvantage B\nAvantage C"}
                value={solution}
                onChange={e => setSolution(e.target.value)}
                rows={4}
                style={{ resize: 'vertical', fontSize: '0.8375rem' }}
              />
            </div>
          </div>

          {/* Image import */}
          <div>
            <label className="form-label">🖼️ Image d'illustration <span style={{ fontWeight: 400, color: 'var(--text-tertiary)' }}>(optionnel, max 5 Mo)</span></label>
            <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
              <input
                className="form-input"
                placeholder="https://... ou importer ci-dessous"
                value={image.startsWith('data:') ? '' : image}
                onChange={e => setImage(e.target.value)}
                style={{ flex: 1 }}
              />
              <button
                className="btn-ghost"
                style={{ flexShrink: 0, border: '1.5px solid var(--border-md)', padding: '0.6rem 0.875rem' }}
                onClick={() => fileRef.current?.click()}
              >
                <Upload size={14} /> Importer
              </button>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageFile} />
            </div>
            {image && (
              <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <img src={image} alt="preview"
                  style={{ height: 56, width: 90, objectFit: 'cover', borderRadius: 'var(--r-sm)', border: '1px solid var(--border-sm)' }} />
                <button className="btn-ghost" style={{ color: 'var(--danger)', fontSize: '0.775rem' }}
                  onClick={() => setImage('')}>Supprimer</button>
              </div>
            )}
          </div>

          {/* PDF import */}
          <div>
            <label className="form-label">📄 Brochure PDF <span style={{ fontWeight: 400, color: 'var(--text-tertiary)' }}>(optionnel, max 10 Mo)</span></label>
            <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
              {pdfName ? (
                <div style={{
                  flex: 1, padding: '0.6rem 0.875rem',
                  background: 'var(--success-light)', border: '1px solid var(--success-border)',
                  borderRadius: 'var(--r-md)', fontSize: '0.8375rem',
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                }}>
                  <FileText size={14} color="var(--success)" />
                  <span style={{ fontWeight: 600, color: 'var(--success)' }}>{pdfName}</span>
                  <button className="btn-ghost" style={{ marginLeft: 'auto', padding: '0.2rem', color: 'var(--danger)' }}
                    onClick={() => { setPdfName(''); setPdfB64(''); }}><X size={12} /></button>
                </div>
              ) : (
                <div style={{
                  flex: 1, padding: '0.75rem', borderRadius: 'var(--r-md)',
                  border: '2px dashed var(--border-md)', textAlign: 'center',
                  color: 'var(--text-tertiary)', fontSize: '0.8375rem', cursor: 'pointer',
                }}
                  onClick={() => pdfRef.current?.click()}
                >
                  <Upload size={14} style={{ marginRight: '0.4rem' }} />
                  Cliquer pour importer un PDF
                </div>
              )}
              <input ref={pdfRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={handlePdfFile} />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-ghost" onClick={onClose}>Annuler</button>
          <button className="btn-primary" onClick={handleSave}>
            <Save size={14} /> {initial ? 'Mettre à jour' : 'Ajouter la page'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── PDF Viewer ─── */
function PdfViewer({ base64, name, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}
        style={{ maxWidth: '90vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={18} color="var(--brand-red)" />
            <span style={{ fontWeight: 700 }}>{name}</span>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <div style={{ flex: 1, overflow: 'hidden', padding: '0' }}>
          <iframe src={base64} title={name}
            style={{ width: '100%', height: '70vh', border: 'none' }} />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN SETTINGS PAGE
   ═══════════════════════════════════════════ */
export default function Settings() {
  const navigate = useNavigate();
  const { currentUser, userProfile, isDemo } = useAuth();
  const dealerId = userProfile?.dealerId || 'demo';

  const [tab,          setTab]         = useState('products');
  const [products,     setProducts]    = useState([]);
  const [saving,       setSaving]      = useState(false);
  const [saved,        setSaved]       = useState(false);
  const [showCustom,   setShowCustom]  = useState(false);
  const [editingCustom,setEditingCustom]=useState(null);
  const [pdfViewer,    setPdfViewer]   = useState(null);
  const [pricing,      setPricing]      = useState({});

  /* Load products + tarifs from Firestore */
  useEffect(() => {
    async function load() {
      if (isDemo) {
        setProducts(PRODUCTS.map(p => ({ ...p, active: true })));
        setPricing({});
        return;
      }
      try {
        const settings = await loadDealerSettings(dealerId);
        setProducts(buildMergedProductListFromSettings(settings, PRODUCTS));
        setPricing(settings?.pricing && typeof settings.pricing === 'object' ? settings.pricing : {});
      } catch {
        setProducts(PRODUCTS.map(p => ({ ...p, active: true })));
        setPricing({});
      }
    }
    load();
  }, [dealerId, isDemo]);

  const save = async () => {
    if (isDemo) { alert('Mode démo — sauvegardes désactivées'); return; }
    setSaving(true);
    try {
      const overrides = buildCatalogOverridesMap(products, PRODUCTS);
      await saveDealerSettings(dealerId, {
        schemaVersion:  DEALER_SETTINGS_VERSION,
        productOrder:   products.map(p => p.id),
        disabled:       products.filter(p => !p.active).map(p => p.id),
        customProducts: buildCustomProductsPayload(products),
        overrides,
        pricing,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) { alert('Erreur de sauvegarde : ' + e.message); }
    finally { setSaving(false); }
  };

  /* Reorder */
  const moveUp   = (i) => { if (i === 0) return; const a = [...products]; [a[i-1],a[i]] = [a[i],a[i-1]]; setProducts(a); };
  const moveDown = (i) => { if (i >= products.length-1) return; const a=[...products]; [a[i],a[i+1]]=[a[i+1],a[i]]; setProducts(a); };
  const toggle   = (i) => { const a=[...products]; a[i]={ ...a[i], active: !a[i].active }; setProducts(a); };
  const remove   = (i) => { const a=[...products]; a.splice(i,1); setProducts(a); };

  /* Add / edit custom */
  const addCustom = (data) => {
    if (editingCustom !== null) {
      const a = [...products];
      a[editingCustom] = { ...a[editingCustom], ...data };
      setProducts(a);
    } else {
      setProducts(prev => [...prev, { ...data, active: true }]);
    }
    setShowCustom(false);
    setEditingCustom(null);
  };

  /* Text override for a product */
  const updateText = (productId, field, value) => {
    setProducts(prev => prev.map(p =>
      p.id === productId ? { ...p, [field]: value } : p
    ));
  };

  /* PDF for a product */
  const updatePdf = (productId, pdfName, pdfBase64) => {
    setProducts(prev => prev.map(p =>
      p.id === productId ? { ...p, pdfName, pdfBase64 } : p
    ));
  };

  return (
    <div className="app-container">
      {/* Topbar */}
      <header className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="topbar-btn" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={15} /> Retour
          </button>
          <span className="topbar-divider" />
          <span className="topbar-logo">Avantage <span>Plus</span></span>
          <span className="topbar-divider" />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <SettingsIcon size={13} /> Paramètres
          </span>
        </div>
        <button
          className={saved ? 'btn-success' : 'btn-primary'}
          onClick={save}
          disabled={saving || isDemo}
          style={{ minWidth: 130 }}
        >
          {saving ? '⏳ Sauvegarde…' : saved ? '✅ Sauvegardé !' : <><Save size={14} /> Sauvegarder</>}
        </button>
      </header>

      <main className="main-content" style={{ maxWidth: 800 }}>
        {/* Demo warning */}
        {isDemo && (
          <div style={{
            marginBottom: '1.25rem', padding: '0.875rem 1.125rem',
            background: 'var(--warning-light)', border: '1px solid var(--warning-border)',
            borderRadius: 'var(--r-md)', fontSize: '0.8375rem',
            display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'var(--warning)',
          }}>
            ⚠️ Mode démo — Les modifications ne seront pas persistées
          </div>
        )}

        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Paramètres du concessionnaire</h1>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', margin: 0 }}>
            Personnalisez vos produits, textes et documents pour ce concessionnaire.
          </p>
        </div>

        {/* Tabs */}
        <div className="tabs-nav">
          {[
            { id: 'products', label: '🛡️ Produits' },
            { id: 'pricing',  label: '💲 Tarifs' },
            { id: 'texts',    label: '✏️ Textes' },
            { id: 'pdfs',     label: '📄 Brochures PDF' },
          ].map(t => (
            <button key={t.id} className={`tab-btn ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── PRODUCTS TAB ── */}
        {tab === 'products' && (
          <div className="animate-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                  Gestion des produits
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', margin: 0 }}>
                  Activez, réordonnez et personnalisez chaque produit dans le flux de présentation.
                </p>
              </div>
              <button
                className="btn-primary"
                onClick={() => { setEditingCustom(null); setShowCustom(true); }}
                style={{ flexShrink: 0 }}
              >
                <Plus size={15} /> Ajouter une page
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {products.map((p, i) => (
                <div key={p.id} className="card" style={{
                  padding: '0.875rem 1.125rem',
                  opacity: p.active ? 1 : 0.55,
                  border: p.isCustom ? '2px solid rgba(37,99,235,0.25)' : '1px solid var(--border-sm)',
                  transition: 'all 0.18s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                    {/* Drag handle */}
                    <GripVertical size={16} color="var(--text-tertiary)" style={{ cursor: 'grab', flexShrink: 0 }} />

                    {/* Icon */}
                    <div style={{
                      width: 38, height: 38, borderRadius: '10px',
                      background: p.active ? 'var(--brand-red-light)' : 'var(--bg-subtle)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.2rem', flexShrink: 0,
                    }}>{p.icon}</div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{p.title}</span>
                        {p.isCustom && <span className="badge badge-blue">Personnalisé</span>}
                        <span className="badge badge-navy" style={{ marginLeft: 'auto', flexShrink: 0 }}>#{i+1}</span>
                      </div>
                      <div style={{ fontSize: '0.775rem', color: 'var(--text-tertiary)', marginTop: '0.15rem',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.hook?.text?.slice(0, 80)}…
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                      {/* Move */}
                      <button className="btn-icon" onClick={() => moveUp(i)} disabled={i === 0}
                        style={{ opacity: i === 0 ? 0.3 : 1, width: 30, height: 30 }} title="Monter">
                        <ChevronUp size={14} />
                      </button>
                      <button className="btn-icon" onClick={() => moveDown(i)} disabled={i >= products.length-1}
                        style={{ opacity: i >= products.length-1 ? 0.3 : 1, width: 30, height: 30 }} title="Descendre">
                        <ChevronDown size={14} />
                      </button>

                      {/* Edit custom */}
                      {p.isCustom && (
                        <button className="btn-icon" onClick={() => {
                          setEditingCustom(i);
                          setShowCustom(true);
                        }} style={{ width: 30, height: 30 }} title="Modifier">
                          ✏️
                        </button>
                      )}

                      {/* Toggle */}
                      <Toggle on={p.active} onChange={() => toggle(i)} />

                      {/* Delete custom */}
                      {p.isCustom && (
                        <button className="btn-icon" onClick={() => remove(i)}
                          style={{ color: 'var(--danger)', width: 30, height: 30 }} title="Supprimer">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add another page button at bottom */}
            <button
              className="btn-ghost"
              onClick={() => { setEditingCustom(null); setShowCustom(true); }}
              style={{
                width: '100%', padding: '0.875rem',
                marginTop: '0.875rem',
                border: '2px dashed var(--border-md)',
                borderRadius: 'var(--r-lg)',
                color: 'var(--text-tertiary)',
                fontWeight: 600, fontSize: '0.875rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              }}
            >
              <Plus size={16} /> Ajouter une page personnalisée
            </button>
          </div>
        )}

        {/* ── PRICING TAB ── */}
        {tab === 'pricing' && (
          <PricingPanel products={products} pricing={pricing} onChange={setPricing} />
        )}

        {/* ── TEXTS TAB ── */}
        {tab === 'texts' && (
          <div className="animate-in">
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Personnalisez les textes affichés dans chaque slide de présentation.
            </p>
            {products.filter(p => !p.isCustom).map(p => (
              <div key={p.id} className="card" style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <span style={{ fontSize: '1.3rem' }}>{p.icon}</span>
                  <h3 style={{ fontSize: '0.9375rem' }}>{p.title}</h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <div className="section-label" style={{ color: 'var(--brand-red)' }}>✨ Accroche</div>
                    <div className="form-group">
                      <label className="form-label">Titre de l'accroche</label>
                      <input className="form-input" value={p.hook?.headline || ''} style={{ fontSize: '0.8375rem' }}
                        onChange={e => updateText(p.id, 'hook', { ...p.hook, headline: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Texte explicatif</label>
                      <textarea className="form-input" value={p.hook?.text || ''} rows={3} style={{ fontSize: '0.8125rem', resize: 'vertical' }}
                        onChange={e => updateText(p.id, 'hook', { ...p.hook, text: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <div className="section-label" style={{ color: 'var(--warning)' }}>⚠️ Risque</div>
                    <div className="form-group">
                      <label className="form-label">Titre des risques</label>
                      <input className="form-input" value={p.risk?.headline || ''} style={{ fontSize: '0.8375rem' }}
                        onChange={e => updateText(p.id, 'risk', { ...p.risk, headline: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Points (1 par ligne)</label>
                      <textarea className="form-input" value={p.risk?.points?.join('\n') || ''} rows={3} style={{ fontSize: '0.8125rem', resize: 'vertical' }}
                        onChange={e => updateText(p.id, 'risk', { ...p.risk, points: e.target.value.split('\n') })} />
                    </div>
                    <div className="section-label" style={{ color: 'var(--success)', marginTop: '0.75rem' }}>✅ Solution</div>
                    <div className="form-group">
                      <label className="form-label">Points avantages (1 par ligne)</label>
                      <textarea className="form-input" value={p.solution?.points?.join('\n') || ''} rows={3} style={{ fontSize: '0.8125rem', resize: 'vertical' }}
                        onChange={e => updateText(p.id, 'solution', { ...p.solution, points: e.target.value.split('\n') })} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── PDFs TAB ── */}
        {tab === 'pdfs' && (
          <div className="animate-in">
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Associez un dépliant PDF ou une image à chaque produit de présentation.
            </p>
            {products.map(p => (
              <PdfProductRow
                key={p.id}
                product={p}
                onUpdate={(pdfName, pdfBase64) => updatePdf(p.id, pdfName, pdfBase64)}
                onView={() => p.pdfBase64 && setPdfViewer({ name: p.pdfName, base64: p.pdfBase64 })}
              />
            ))}
          </div>
        )}
      </main>

      {/* Custom page modal */}
      {showCustom && (
        <CustomPageModal
          initial={editingCustom !== null ? products[editingCustom] : null}
          onSave={addCustom}
          onClose={() => { setShowCustom(false); setEditingCustom(null); }}
        />
      )}

      {/* PDF viewer modal */}
      {pdfViewer && (
        <PdfViewer
          base64={pdfViewer.base64}
          name={pdfViewer.name}
          onClose={() => setPdfViewer(null)}
        />
      )}
    </div>
  );
}

/* ── PDF row sub-component ── */
function PdfProductRow({ product, onUpdate, onView }) {
  const inputRef = useRef();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert('PDF trop lourd (max 10 Mo)'); return; }
    const reader = new FileReader();
    reader.onload = ev => onUpdate(file.name, ev.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="card" style={{ marginBottom: '0.75rem', padding: '1rem 1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
        <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{product.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.225rem' }}>{product.title}</div>
          {product.pdfName ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="badge badge-green"><FileText size={10} /> {product.pdfName}</span>
              <button className="btn-ghost" style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }} onClick={onView}>
                <Eye size={12} /> Voir
              </button>
              <button className="btn-ghost" style={{ fontSize: '0.75rem', color: 'var(--danger)', padding: '0.2rem 0.5rem' }}
                onClick={() => onUpdate('', '')}>
                <Trash2 size={12} />
              </button>
            </div>
          ) : (
            <span style={{ fontSize: '0.775rem', color: 'var(--text-tertiary)' }}>Aucun document associé</span>
          )}
        </div>
        <button className="btn-ghost"
          style={{ flexShrink: 0, border: '1.5px solid var(--border-md)', fontSize: '0.8125rem', display: 'flex', gap: '0.375rem', alignItems: 'center' }}
          onClick={() => inputRef.current?.click()}
        >
          <Upload size={13} /> {product.pdfName ? 'Remplacer' : 'Ajouter un PDF'}
        </button>
        <input ref={inputRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={handleFile} />
      </div>
    </div>
  );
}
