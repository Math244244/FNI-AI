import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePresentation } from '../context/PresentationContext';
import { useAuth } from '../context/AuthContext';
import {
  ChevronLeft, Search, User, Car, ArrowRight, SkipForward,
} from 'lucide-react';
import {
  CATEGORIES, LOISIR_TYPES, VR_TYPES, VEHICLE_COLORS,
  getYears, getMakes, getModels,
} from '../data/vehicleData';

export default function VehicleSelection() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const {
    setMode, setVehicle, setClientName,
    setCondition, setTransactionType, startSession,
  } = usePresentation();
  const { isDemo } = useAuth();

  const [condition, setLocalCondition] = useState('neuf');
  const [transType, setLocalTransType] = useState('financement');
  const [clientNameLocal, setClientNameLocal] = useState('');
  const [clientSkipped, setClientSkipped] = useState(false);

  const [category, setCategory] = useState('automobile');
  const [subType, setSubType] = useState(null);

  const [vin, setVin] = useState('');
  const [vinResult, setVinRes] = useState(null);
  const [vinError, setVinErr] = useState('');
  const [vinLoading, setVinLoad] = useState(false);

  const [year, setYear] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [trim, setTrim] = useState('');
  const [color, setColor] = useState('');
  const [vehicleImg, setVehicleImg] = useState('');

  const [models, setModels] = useState([]);
  const [modelsLoading, setModelsLoading] = useState(false);

  useEffect(() => {
    const m = params.get('mode');
    setMode(m === 'remote' ? 'remote' : 'live');
  }, [params, setMode]);

  const resetVehicleFields = () => {
    setYear(''); setMake(''); setModel(''); setTrim('');
    setModels([]); setVinRes(null); setVin(''); setVinErr('');
    setVehicleImg('');
  };

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setSubType(null);
    resetVehicleFields();
  };

  const handleSubTypeChange = (st) => {
    setSubType(st);
    resetVehicleFields();
  };

  useEffect(() => {
    if (!year || !make) { setModels([]); return; }
    let cancelled = false;
    setModelsLoading(true);
    getModels(category, subType, make, year).then(list => {
      if (!cancelled) { setModels(list); setModelsLoading(false); }
    });
    return () => { cancelled = true; };
  }, [year, make, category, subType]);

  useEffect(() => {
    if (!make || !model || category !== 'automobile') {
      setVehicleImg('');
      return;
    }
    const url = `https://cdn.imagin.studio/getimage?customer=img&make=${encodeURIComponent(make)}&modelFamily=${encodeURIComponent(model)}&modelYear=${year || new Date().getFullYear()}&angle=23&width=640`;
    setVehicleImg(url);
  }, [make, model, year, category]);

  const decodeVin = async () => {
    if (!vin.trim()) return;
    setVinLoad(true); setVinErr('');
    try {
      const r = await fetch(
        `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`,
      );
      const d = await r.json();
      const get = (v) => d.Results?.find(x => x.Variable === v)?.Value || '';
      const y = get('Model Year');
      const mk = get('Make');
      const mo = get('Model');
      if (!mk || mk === 'Not Applicable') {
        setVinErr('VIN non reconnu. Vérifiez le numéro.');
        setVinLoad(false);
        return;
      }
      setVinRes({ year: y, make: mk, model: mo });
      setYear(y);
      setMake(mk);
      setModel(mo);
    } catch {
      setVinErr('Erreur réseau. Vérifiez votre connexion.');
    } finally {
      setVinLoad(false);
    }
  };

  const isReady = (year && make && model) || vinResult;

  const launch = () => {
    const vehicleData = {
      year, make, model, trim, color,
      category, subType,
      vin: vin || null,
      clientName: clientSkipped ? '' : clientNameLocal,
    };
    setVehicle(vehicleData);
    setClientName(clientSkipped ? '' : clientNameLocal);
    setCondition(condition);
    setTransactionType(transType);
    startSession(vehicleData);
    navigate('/presentation');
  };

  const years = getYears(category);
  const makes = getMakes(category, subType);
  const needsSubType = category === 'loisirs' || category === 'vr';
  const subTypes = category === 'loisirs' ? LOISIR_TYPES : category === 'vr' ? VR_TYPES : [];
  const showVehicleFields = !needsSubType || subType;

  const Step = ({ n, title, icon, children }) => (
    <div className="card" style={{ marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div className="step-badge">{n}</div>
        <h3 style={{ fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {icon} {title}
        </h3>
      </div>
      {children}
    </div>
  );

  return (
    <div className="app-container">
      <header className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="topbar-btn" onClick={() => navigate('/dashboard')}>
            <ChevronLeft size={16} /> Tableau de bord
          </button>
          <span className="topbar-divider" />
          <span className="topbar-logo">Avantage <span>Plus</span></span>
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
          Nouvelle présentation
        </span>
      </header>

      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ marginBottom: '2rem' }} className="animate-up">
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>Configurer la présentation</h1>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', margin: 0 }}>
            Remplissez les informations pour personnaliser la présentation neuro-vente.
          </p>
        </div>

        {/* Step 1: Condition */}
        <Step n="1" icon="🚘" title="Condition du véhicule">
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {['neuf', 'usage'].map(c => (
              <div key={c} className={`choice-pill ${condition === c ? 'selected' : ''}`}
                onClick={() => setLocalCondition(c)}
                style={{ minWidth: 130 }}>
                <span style={{ fontSize: '1.2rem' }}>{c === 'neuf' ? '✨' : '🔄'}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                    {c === 'neuf' ? 'Neuf' : 'Occasion'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    {c === 'neuf' ? 'Véhicule 0 km' : 'Véhicule pré-aimé'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Step>

        {/* Step 2: Transaction type */}
        <Step n="2" icon="💳" title="Type de transaction">
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {[
              { v: 'financement', label: 'Financement', sub: 'Prêt auto', icon: '🏦' },
              { v: 'location', label: 'Location', sub: 'Bail / Leasing', icon: '🔄' },
              { v: 'comptant', label: 'Comptant', sub: 'Achat direct', icon: '💰' },
            ].map(t => (
              <div key={t.v} className={`choice-pill ${transType === t.v ? 'selected' : ''}`}
                onClick={() => setLocalTransType(t.v)}
                style={{ minWidth: 140 }}>
                <span style={{ fontSize: '1.1rem' }}>{t.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{t.label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{t.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </Step>

        {/* Step 3: Client name */}
        <Step n="3" icon={<User size={15} />} title="Nom du client">
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <User size={15} style={{
                position: 'absolute', left: '1rem', top: '50%',
                transform: 'translateY(-50%)', color: 'var(--text-tertiary)',
                pointerEvents: 'none',
              }} />
              <input
                className="form-input"
                style={{
                  paddingLeft: '2.5rem',
                  opacity: clientSkipped ? 0.4 : 1,
                  background: clientSkipped ? 'var(--bg-subtle)' : 'white',
                }}
                placeholder="Jean Tremblay"
                value={clientSkipped ? '— Passé —' : clientNameLocal}
                onChange={e => setClientNameLocal(e.target.value)}
                disabled={clientSkipped}
              />
            </div>
            <button
              className={`btn-ghost ${clientSkipped ? 'btn-outline' : ''}`}
              style={{
                flexShrink: 0, fontWeight: 700, fontSize: '0.8125rem',
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                color: clientSkipped ? 'var(--brand-red)' : 'var(--text-muted)',
                border: clientSkipped ? '1.5px solid var(--brand-red-border)' : '1.5px solid var(--border-md)',
                borderRadius: 'var(--r-md)', padding: '0.65rem 1rem',
              }}
              onClick={() => { setClientSkipped(s => !s); if (!clientSkipped) setClientNameLocal(''); }}
            >
              <SkipForward size={14} />
              {clientSkipped ? 'Rétablir' : 'Passer'}
            </button>
          </div>
          {clientSkipped && (
            <p style={{ marginTop: '0.6rem', fontSize: '0.775rem', color: 'var(--text-tertiary)' }}>
              La présentation sera anonyme — le nom du client ne sera pas enregistré.
            </p>
          )}
        </Step>

        {/* Step 4: Vehicle identification */}
        <Step n="4" icon={<Car size={15} />} title="Identification du véhicule">

          {/* Category selector */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div className="section-label">Catégorie</div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  style={{
                    flex: 1,
                    padding: '0.75rem 0.5rem',
                    borderRadius: 'var(--r-md)',
                    border: category === cat.id
                      ? '2px solid var(--brand-red)'
                      : '1.5px solid var(--border-md)',
                    background: category === cat.id ? 'var(--brand-red-light)' : 'white',
                    cursor: 'pointer',
                    transition: 'var(--tx)',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: '0.35rem',
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>{cat.icon}</span>
                  <span style={{
                    fontSize: '0.8125rem',
                    fontWeight: category === cat.id ? 700 : 600,
                    color: category === cat.id ? 'var(--brand-red)' : 'var(--text-primary)',
                  }}>
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Sub-category selector */}
          {needsSubType && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div className="section-label">
                {category === 'loisirs' ? 'Type de véhicule récréatif' : 'Type de VR'}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {subTypes.map(st => (
                  <button
                    key={st.id}
                    onClick={() => handleSubTypeChange(st.id)}
                    style={{
                      padding: '0.55rem 1rem',
                      borderRadius: 'var(--r-full)',
                      border: subType === st.id
                        ? '2px solid var(--brand-red)'
                        : '1.5px solid var(--border-md)',
                      background: subType === st.id ? 'var(--brand-red-light)' : 'white',
                      cursor: 'pointer',
                      transition: 'var(--tx)',
                      fontSize: '0.8125rem',
                      fontWeight: subType === st.id ? 700 : 500,
                      color: subType === st.id ? 'var(--brand-red)' : 'var(--text-secondary)',
                      display: 'flex', alignItems: 'center', gap: '0.35rem',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span>{st.icon}</span> {st.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Vehicle fields — only show when category + subtype are selected */}
          {showVehicleFields && (
            <>
              {/* VIN decode */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div className="section-label">Numéro de série (NIV / VIN) — optionnel</div>
                <div style={{ display: 'flex', gap: '0.625rem' }}>
                  <input
                    className="form-input"
                    placeholder="ex. : 1N6BA1CXXXR109186"
                    value={vin}
                    onChange={e => { setVin(e.target.value.toUpperCase()); setVinRes(null); setVinErr(''); }}
                    style={{ flex: 1, fontFamily: 'monospace', letterSpacing: '0.05em', textTransform: 'uppercase' }}
                  />
                  <button className="btn-primary" onClick={decodeVin} disabled={vinLoading || vin.length < 10}
                    style={{ flexShrink: 0, minWidth: 100 }}>
                    {vinLoading ? '…' : <><Search size={14} /> Décoder</>}
                  </button>
                </div>
                {vinError && <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.4rem' }}>{vinError}</p>}
                {vinResult && (
                  <div style={{
                    marginTop: '0.75rem', padding: '0.75rem 1rem', borderRadius: 'var(--r-md)',
                    background: 'var(--success-light)', border: '1px solid var(--success-border)',
                    color: 'var(--success)', fontSize: '0.875rem', fontWeight: 600,
                  }}>
                    {vinResult.year} {vinResult.make} {vinResult.model} — Identifié via VIN
                  </div>
                )}
              </div>

              {/* Divider OR */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                color: 'var(--text-tertiary)', fontSize: '0.8rem', fontWeight: 600,
                marginBottom: '1rem',
              }}>
                <div style={{ flex: 1, height: 1, background: 'var(--border-sm)' }} />
                OU SÉLECTION MANUELLE
                <div style={{ flex: 1, height: 1, background: 'var(--border-sm)' }} />
              </div>

              {/* Year / Make / Model / Trim */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem', marginBottom: '0.625rem' }}>
                <div>
                  <div className="section-label">Année</div>
                  <select className="form-input" value={year}
                    onChange={e => { setYear(e.target.value); setMake(''); setModel(''); setTrim(''); setModels([]); }}>
                    <option value="">— Sélectionner —</option>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <div className="section-label">Marque</div>
                  <select className="form-input" value={make} disabled={!year}
                    onChange={e => { setMake(e.target.value); setModel(''); setTrim(''); }}>
                    <option value="">— Sélectionner —</option>
                    {makes.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem', marginBottom: '0.875rem' }}>
                <div>
                  <div className="section-label">Modèle</div>
                  {category === 'loisirs' && subType === 'bateau' ? (
                    <input
                      className="form-input"
                      placeholder="Saisir le modèle"
                      value={model}
                      disabled={!make || !year}
                      onChange={e => { setModel(e.target.value); setTrim(''); }}
                    />
                  ) : (
                    <select className="form-input" value={model} disabled={!make || !year}
                      onChange={e => { setModel(e.target.value); setTrim(''); }}>
                      <option value="">
                        {modelsLoading ? 'Chargement…' : '— Sélectionner —'}
                      </option>
                      {models.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  )}
                </div>
                <div>
                  <div className="section-label">Version <span style={{ opacity: 0.5, fontWeight: 400 }}>(optionnel)</span></div>
                  <input className="form-input" placeholder="ex. SE, LX, Sport" value={trim}
                    onChange={e => setTrim(e.target.value)} />
                </div>
              </div>

              {/* Color */}
              <div style={{ marginBottom: '0.875rem' }}>
                <div className="section-label">Couleur <span style={{ opacity: 0.5, fontWeight: 400 }}>(optionnel)</span></div>
                <select className="form-input" value={color} onChange={e => setColor(e.target.value)}
                  style={{ maxWidth: 240 }}>
                  <option value="">— Sélectionner —</option>
                  {VEHICLE_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Vehicle preview (automobiles only) */}
              {vehicleImg && category === 'automobile' && (
                <div style={{
                  marginTop: '0.75rem', padding: '1.5rem',
                  background: '#FFFFFF', borderRadius: 'var(--r-lg)',
                  textAlign: 'center', border: '1px solid var(--border-sm)',
                }}>
                  <img
                    src={vehicleImg}
                    alt={`${year} ${make} ${model}`}
                    style={{ maxHeight: 180, maxWidth: '100%', objectFit: 'contain', borderRadius: 'var(--r-sm)' }}
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                  <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {year && <span className="badge badge-gray">{year}</span>}
                    {make && <span className="badge badge-gray">{make}</span>}
                    {model && <span className="badge badge-gray">{model}</span>}
                    {trim && <span className="badge badge-blue">{trim}</span>}
                    {color && <span className="badge badge-amber">{color}</span>}
                  </div>
                </div>
              )}
            </>
          )}

          {needsSubType && !subType && (
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', fontStyle: 'italic' }}>
              Sélectionnez un type de véhicule pour continuer.
            </p>
          )}
        </Step>

        {/* Launch button */}
        <div style={{
          position: 'sticky', bottom: 0,
          background: 'linear-gradient(to top, #FFFFFF 70%, transparent)',
          padding: '1.5rem 0',
        }}>
          <div style={{
            padding: '0.75rem 1.25rem', borderRadius: 'var(--r-md)',
            background: 'white', border: '1px solid var(--border-sm)',
            marginBottom: '0.75rem', display: 'flex', gap: '0.5rem',
            flexWrap: 'wrap', alignItems: 'center', fontSize: '0.825rem',
          }}>
            {!clientSkipped && clientNameLocal && <span className="badge badge-gray"><User size={10} /> {clientNameLocal}</span>}
            {clientSkipped && <span className="badge badge-amber">Anonyme</span>}
            <span className="badge badge-gray">
              {condition === 'neuf' ? '✨ Neuf' : '🔄 Occasion'}
            </span>
            <span className="badge badge-blue">
              {transType === 'financement' ? 'Financement' : transType === 'location' ? 'Location' : 'Comptant'}
            </span>
            <span className="badge badge-gray">
              {CATEGORIES.find(c => c.id === category)?.label || ''}
              {subType ? ` › ${[...LOISIR_TYPES, ...VR_TYPES].find(s => s.id === subType)?.label || ''}` : ''}
            </span>
            {model && <span className="badge badge-green">{year} {make} {model}</span>}
            {color && <span className="badge badge-amber">{color}</span>}
          </div>

          <button
            className="btn-primary"
            style={{ width: '100%', padding: '0.95rem', fontSize: '1rem' }}
            disabled={!isReady}
            onClick={launch}
          >
            Lancer la présentation <ArrowRight size={18} />
          </button>
          {!isReady && (
            <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.775rem', marginTop: '0.5rem' }}>
              Complétez l'identification du véhicule pour continuer
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
