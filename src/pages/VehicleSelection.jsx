import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePresentation } from '../context/PresentationContext';
import {
  ChevronLeft, User, Car, ArrowRight, SkipForward, Sparkles, RefreshCcw,
  Banknote, Repeat2, DollarSign, ScanLine, Zap,
} from 'lucide-react';
import {
  CATEGORIES, LOISIR_TYPES, VR_TYPES, VEHICLE_COLORS,
  getYears, getMakes, getModels,
} from '../data/vehicleData';
import Select from '../components/ui/Select';
import Combobox from '../components/ui/Combobox';
import Button from '../components/ui/Button';
import SearchBar from '../components/VehiclePicker/SearchBar';
import RecentChips from '../components/VehiclePicker/RecentChips';
import LivePreview from '../components/VehiclePicker/LivePreview';
import useRecentVehicles from '../hooks/useRecentVehicles';
import { paymentPerPeriodCents } from '../utils/paymentCalculator';
import { financingSchema } from '../schemas/financing';
import ComplianceBanner from '../components/ComplianceBanner';

export default function VehicleSelection() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const {
    setMode, setVehicle, setClientName,
    setCondition, setTransactionType, startSession, setFinancing,
  } = usePresentation();

  const { recents, addRecent, clearRecents } = useRecentVehicles();

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

  const [models, setModels] = useState([]);
  const [modelsLoading, setModelsLoading] = useState(false);

  const [capitalDollars, setCapitalDollars]   = useState('40000');
  const [termMonths,    setTermMonths]       = useState(60);
  const [interestRate,  setInterestRate]     = useState('4.9');
  const [paymentFrequency, setPaymentFrequency] = useState(/** @type {'monthly'|'biweekly'|'weekly'} */ ('biweekly'));
  const [finError,     setFinError]          = useState('');

  useEffect(() => {
    const m = params.get('mode');
    setMode(m === 'remote' ? 'remote' : 'live');
  }, [params, setMode]);

  const resetVehicleFields = () => {
    setYear(''); setMake(''); setModel(''); setTrim('');
    setModels([]); setVinRes(null); setVin(''); setVinErr('');
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

  /* Model fetch */
  useEffect(() => {
    if (!year || !make) { setModels([]); return; }
    let cancelled = false;
    setModelsLoading(true);
    getModels(category, subType, make, year).then(list => {
      if (!cancelled) { setModels(list); setModelsLoading(false); }
    });
    return () => { cancelled = true; };
  }, [year, make, category, subType]);

  /* VIN decode */
  const decodeVin = useCallback(async (explicit) => {
    const vinVal = (explicit || vin).trim().toUpperCase();
    if (!vinVal || vinVal.length < 10) return;
    setVin(vinVal);
    setVinLoad(true); setVinErr('');
    try {
      const r = await fetch(
        `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vinVal}?format=json`,
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
  }, [vin]);

  const handleSearchSelect = useCallback((item) => {
    if (item.year) setYear(String(item.year));
    if (item.make) setMake(item.make);
    if (item.model) setModel(item.model);
  }, []);

  const handleRecentPick = useCallback((r) => {
    setCategory(r.category || 'automobile');
    setSubType(r.subType || null);
    setYear(String(r.year));
    setMake(r.make);
    setModel(r.model || '');
  }, []);

  const isReady = (year && make && model) || vinResult;
  const financingFieldsOk = transType === 'comptant' || (capitalDollars.trim() !== '' && termMonths > 0 && String(interestRate).trim() !== '');

  const launch = () => {
    setFinError('');
    const vehicleData = {
      year, make, model, trim, color,
      category, subType,
      vin: vin || null,
      clientName: clientSkipped ? '' : clientNameLocal,
    };
    if (transType === 'comptant') {
      setFinancing({
        transactionType: 'comptant',
        capitalDollars: 0,
        termMonths: 0,
        interestRate: 0,
        paymentFrequency: 'monthly',
        basePaymentCents: null,
      });
    } else {
      const cap = parseFloat(String(capitalDollars).replace(/\s/g, '').replace(',', '.'));
      const rate = parseFloat(String(interestRate).replace(',', '.'));
      const parsed = financingSchema.safeParse({
        transactionType: transType,
        capitalDollars: cap,
        termMonths: termMonths,
        interestRate: rate,
        paymentFrequency,
      });
      if (!parsed.success) {
        setFinError('Vérifiez le capital, la durée, le taux et la fréquence.');
        return;
      }
      const capC = Math.round(cap * 100);
      const baseC = paymentPerPeriodCents({
        annualRatePercent: rate,
        termMonths: termMonths,
        principalCents: capC,
        frequency: paymentFrequency,
      });
      setFinancing({
        transactionType: transType,
        capitalDollars: cap,
        termMonths: termMonths,
        interestRate: rate,
        paymentFrequency,
        basePaymentCents: baseC,
      });
    }
    addRecent(vehicleData);
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

  const yearItems = useMemo(() => years.map((y) => ({ value: String(y), label: String(y) })), [years]);
  const makeItems = useMemo(() => makes.map((m) => ({ value: m, label: m })), [makes]);
  const modelItems = useMemo(() => models.map((m) => ({ value: m, label: m })), [models]);
  const NONE = '__none__';
  const colorItems = useMemo(() => [
    { value: NONE, label: '— Aucune —' },
    ...VEHICLE_COLORS.map((c) => ({ value: c, label: c })),
  ], []);

  return (
    <div className="app-container">
      <header className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Button variant="ghost" size="sm" icon={<ChevronLeft size={14} />} onClick={() => navigate('/dashboard')}>
            Tableau de bord
          </Button>
          <span className="topbar-divider" />
          <span className="topbar-logo">Avantage <span>Plus</span></span>
        </div>
        <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', letterSpacing: '0.04em' }}>
          Nouvelle présentation
        </span>
      </header>

      <main id="main-content" className="main-content" style={{ maxWidth: 1280 }}>
        {/* Header éditorial */}
        <div className="animate-up" style={{ marginBottom: '1.5rem' }}>
          <span className="overline">Étape 1 · Identification</span>
          <h1 className="display-italic" style={{ fontSize: 'var(--fs-3xl)', margin: '0.5rem 0 0.35rem', letterSpacing: '-0.02em' }}>
            Configurez votre présentation.
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-md)', margin: 0, maxWidth: 680 }}>
            Décrivez le véhicule, le client, et le type de transaction.
            Tout est centralisé sur une seule page — rapide, précis, sans surprise.
          </p>
        </div>

        {/* Search bar universelle */}
        <div style={{ marginBottom: '1rem' }}>
          <SearchBar
            onSelect={handleSearchSelect}
            onVin={(v) => { setVin(v); decodeVin(v); }}
            recents={recents}
          />
        </div>

        {/* Recents chips */}
        {recents.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <RecentChips recents={recents} onPick={handleRecentPick} onClear={clearRecents} />
          </div>
        )}

        {/* Layout 2-colonnes : config + preview */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 360px',
          gap: '2rem',
          alignItems: 'start',
        }} className="vehicle-grid">

          {/* ─── Col gauche : configurateur ─── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Card — véhicule */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div className="step-badge">1</div>
                <h3 style={{ fontSize: 'var(--fs-lg)', margin: 0 }}>Véhicule</h3>
              </div>

              {/* VIN décodeur compact */}
              <div style={{ marginBottom: 16 }}>
                <label className="form-label">VIN (optionnel — décodeur auto)</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <ScanLine size={14} style={{
                      position: 'absolute', left: 12, top: '50%',
                      transform: 'translateY(-50%)', color: 'var(--text-tertiary)',
                    }} />
                    <input
                      className="form-input"
                      placeholder="ex. : 1N6BA1CXXXR109186"
                      value={vin}
                      onChange={e => { setVin(e.target.value.toUpperCase()); setVinRes(null); setVinErr(''); }}
                      style={{
                        paddingLeft: 34,
                        fontFamily: 'var(--font-mono)',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                      }}
                    />
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => decodeVin()}
                    disabled={vinLoading || vin.length < 10}
                    loading={vinLoading}
                    icon={<Zap size={14} />}
                  >
                    Décoder
                  </Button>
                </div>
                {vinError && <p style={{ color: 'var(--crimson-500)', fontSize: 'var(--fs-xs)', marginTop: 8 }}>{vinError}</p>}
                {vinResult && (
                  <div style={{
                    marginTop: 10, padding: '0.75rem 1rem', borderRadius: 'var(--r-md)',
                    background: 'var(--success-light)', border: '1px solid var(--success-border)',
                    color: 'var(--forest-600)', fontSize: 'var(--fs-sm)', fontWeight: 600,
                  }}>
                    {vinResult.year} {vinResult.make} {vinResult.model} — identifié via VIN
                  </div>
                )}
              </div>

              <div className="divider-gold" style={{ margin: '18px 0' }} />

              {/* Catégorie */}
              <div style={{ marginBottom: 18 }}>
                <label className="form-label">Catégorie</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryChange(cat.id)}
                      style={{
                        flex: 1,
                        padding: '0.85rem 0.5rem',
                        borderRadius: 'var(--r-md)',
                        border: `1px solid ${category === cat.id ? 'var(--or-700)' : 'var(--border-md)'}`,
                        background: category === cat.id ? 'var(--or-100)' : 'var(--bg-card)',
                        cursor: 'pointer',
                        transition: 'var(--tx)',
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', gap: 6,
                      }}
                    >
                      <span style={{ fontSize: '1.3rem' }}>{cat.icon}</span>
                      <span style={{
                        fontSize: 'var(--fs-sm)',
                        fontWeight: category === cat.id ? 700 : 500,
                        color: category === cat.id ? 'var(--or-900)' : 'var(--text-primary)',
                      }}>
                        {cat.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sous-type */}
              {needsSubType && (
                <div style={{ marginBottom: 18 }}>
                  <label className="form-label">
                    {category === 'loisirs' ? 'Type de véhicule récréatif' : 'Type de VR'}
                  </label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {subTypes.map(st => (
                      <button
                        key={st.id}
                        onClick={() => handleSubTypeChange(st.id)}
                        style={{
                          padding: '0.5rem 0.95rem',
                          borderRadius: 'var(--r-full)',
                          border: `1px solid ${subType === st.id ? 'var(--or-700)' : 'var(--border-md)'}`,
                          background: subType === st.id ? 'var(--or-100)' : 'var(--bg-card)',
                          cursor: 'pointer',
                          transition: 'var(--tx)',
                          fontSize: 'var(--fs-sm)',
                          fontWeight: subType === st.id ? 700 : 500,
                          color: subType === st.id ? 'var(--or-900)' : 'var(--text-secondary)',
                          display: 'flex', alignItems: 'center', gap: 6,
                        }}
                      >
                        <span>{st.icon}</span> {st.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Champs véhicule — ordre Marque -> Année -> Modèle */}
              {showVehicleFields ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="form-label">Marque</label>
                    <Combobox
                      value={make}
                      onValueChange={(v) => { setMake(v); setYear(''); setModel(''); setTrim(''); setModels([]); }}
                      placeholder="— Sélectionner —"
                      items={makeItems}
                      ariaLabel="Marque"
                      emptyLabel="Aucune marque trouvée"
                    />
                  </div>

                  <div>
                    <label className="form-label">Année</label>
                    <Combobox
                      value={year}
                      onValueChange={(v) => { setYear(v); setModel(''); setTrim(''); }}
                      placeholder="— Sélectionner —"
                      items={yearItems}
                      disabled={!make}
                      ariaLabel="Année"
                      emptyLabel="Aucune année trouvée"
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">
                      Modèle
                      {modelsLoading && (
                        <span style={{ marginLeft: 8, fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', fontWeight: 400 }}>
                          · chargement…
                        </span>
                      )}
                    </label>
                    {category === 'loisirs' && subType === 'bateau' ? (
                      <input
                        className="form-input"
                        placeholder="Saisir le modèle"
                        value={model}
                        disabled={!make || !year}
                        onChange={e => { setModel(e.target.value); setTrim(''); }}
                      />
                    ) : (
                      <Combobox
                        value={model}
                        onValueChange={(v) => { setModel(v); setTrim(''); }}
                        placeholder={modelsLoading ? 'Chargement…' : '— Sélectionner —'}
                        items={modelItems}
                        disabled={!make || !year || modelsLoading || modelItems.length === 0}
                        ariaLabel="Modèle"
                        emptyLabel="Aucun modèle trouvé"
                        allowCustom
                      />
                    )}
                  </div>

                  <div>
                    <label className="form-label">
                      Version <span style={{ opacity: 0.5, fontWeight: 400 }}>(optionnel)</span>
                    </label>
                    <input
                      className="form-input"
                      placeholder="ex. SE, LX, Sport"
                      value={trim}
                      onChange={e => setTrim(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="form-label">
                      Couleur <span style={{ opacity: 0.5, fontWeight: 400 }}>(optionnel)</span>
                    </label>
                    <Select
                      value={color === '' ? NONE : color}
                      onValueChange={(v) => setColor(v === NONE ? '' : v)}
                      placeholder="— Sélectionner —"
                      items={colorItems}
                      ariaLabel="Couleur"
                    />
                  </div>
                </div>
              ) : (
                <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--fs-sm)', fontStyle: 'italic' }}>
                  Sélectionnez un type de véhicule pour continuer.
                </p>
              )}
            </div>

            {/* Card — client + transaction */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div className="step-badge">2</div>
                <h3 style={{ fontSize: 'var(--fs-lg)', margin: 0 }}>Client et transaction</h3>
              </div>

              {/* Nom du client */}
              <div style={{ marginBottom: 16 }}>
                <label className="form-label">Nom du client</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <User size={14} style={{
                      position: 'absolute', left: 12, top: '50%',
                      transform: 'translateY(-50%)', color: 'var(--text-tertiary)',
                    }} />
                    <input
                      className="form-input"
                      style={{
                        paddingLeft: 34,
                        opacity: clientSkipped ? 0.45 : 1,
                        background: clientSkipped ? 'var(--bg-subtle)' : 'var(--bg-input)',
                      }}
                      placeholder="Jean Tremblay"
                      value={clientSkipped ? '— Passé —' : clientNameLocal}
                      onChange={e => setClientNameLocal(e.target.value)}
                      disabled={clientSkipped}
                    />
                  </div>
                  <Button
                    variant={clientSkipped ? 'outline' : 'ghost'}
                    icon={<SkipForward size={13} />}
                    onClick={() => { setClientSkipped(s => !s); if (!clientSkipped) setClientNameLocal(''); }}
                  >
                    {clientSkipped ? 'Rétablir' : 'Passer'}
                  </Button>
                </div>
                {clientSkipped && (
                  <p className="form-helper" style={{ fontStyle: 'italic' }}>
                    La présentation sera anonyme — le nom du client ne sera pas enregistré.
                  </p>
                )}
              </div>

              {/* Condition */}
              <div style={{ marginBottom: 16 }}>
                <label className="form-label">Condition du véhicule</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[
                    { v: 'neuf',  label: 'Neuf',     sub: '0 km',          icon: <Sparkles size={16} /> },
                    { v: 'usage', label: 'Occasion', sub: 'Pré-aimé',      icon: <RefreshCcw size={16} /> },
                  ].map(c => (
                    <button
                      key={c.v}
                      onClick={() => setLocalCondition(c.v)}
                      className={`choice-pill ${condition === c.v ? 'selected' : ''}`}
                      style={{ minWidth: 140 }}
                    >
                      <span style={{ color: condition === c.v ? 'var(--or-900)' : 'var(--text-secondary)' }}>{c.icon}</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 'var(--fs-sm)', color: 'var(--text-primary)' }}>{c.label}</div>
                        <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)' }}>{c.sub}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Type de transaction */}
              <div>
                <label className="form-label">Type de transaction</label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {[
                    { v: 'financement', label: 'Financement', sub: 'Prêt auto',     icon: <Banknote size={16} /> },
                    { v: 'location',    label: 'Location',    sub: 'Bail',          icon: <Repeat2 size={16} /> },
                    { v: 'comptant',    label: 'Comptant',    sub: 'Achat direct',  icon: <DollarSign size={16} /> },
                  ].map(t => (
                    <button
                      key={t.v}
                      onClick={() => setLocalTransType(t.v)}
                      className={`choice-pill ${transType === t.v ? 'selected' : ''}`}
                      style={{ minWidth: 150 }}
                    >
                      <span style={{ color: transType === t.v ? 'var(--or-900)' : 'var(--text-secondary)' }}>{t.icon}</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 'var(--fs-sm)', color: 'var(--text-primary)' }}>{t.label}</div>
                        <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)' }}>{t.sub}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Card — financement (hors comptant) */}
            {transType !== 'comptant' && (
              <div className="card" style={{ padding: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div className="step-badge">3</div>
                  <h3 style={{ fontSize: 'var(--fs-lg)', margin: 0 }}>Financement</h3>
                </div>
                <p className="form-helper" style={{ marginBottom: 12 }}>
                  Capital à financer, durée, taux et fréquence des paiements (calcul du versement de base pour le menu final).
                </p>
                {finError && <p style={{ color: 'var(--crimson-500)', fontSize: 'var(--fs-xs)', marginBottom: 8 }}>{finError}</p>}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Capital à financer ($)</label>
                    <input
                      className="form-input"
                      value={capitalDollars}
                      onChange={(e) => setCapitalDollars(e.target.value)}
                      inputMode="decimal"
                    />
                  </div>
                  <div>
                    <label className="form-label">Durée (mois)</label>
                    <Select
                      value={String(termMonths)}
                      onValueChange={(v) => setTermMonths(parseInt(v, 10))}
                      items={Array.from({ length: 21 }, (_, i) => 12 + i * 6).map((m) => ({ value: String(m), label: `${m} mois` }))}
                      placeholder="Mois"
                      ariaLabel="Durée en mois"
                    />
                  </div>
                  <div>
                    <label className="form-label">Taux annuel (%)</label>
                    <input
                      className="form-input"
                      value={interestRate}
                      onChange={(e) => setInterestRate(e.target.value)}
                      inputMode="decimal"
                    />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Fréquence de paiement</label>
                    <Select
                      value={paymentFrequency}
                      onValueChange={(v) => setPaymentFrequency(/** @type {'monthly'|'biweekly'|'weekly'} */(v))}
                      items={[
                        { value: 'monthly', label: 'Mensuel' },
                        { value: 'biweekly', label: 'Aux 2 semaines' },
                        { value: 'weekly', label: 'Hebdomadaire' },
                      ]}
                      ariaLabel="Fréquence de paiement"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* CTA lancement */}
            <div style={{
              position: 'sticky',
              bottom: 12,
              background: 'var(--bg-card)',
              border: '1px solid var(--border-md)',
              borderRadius: 'var(--r-lg)',
              padding: '1rem 1.25rem',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              zIndex: 10,
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="overline" style={{ marginBottom: 4 }}>
                  {isReady ? 'Prêt à lancer' : 'Paramètres manquants'}
                </div>
                <div style={{
                  color: 'var(--text-primary)',
                  fontSize: 'var(--fs-sm)',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {isReady
                    ? `${year} ${make} ${model}${trim ? ' · ' + trim : ''}`
                    : 'Complétez la fiche véhicule pour démarrer.'}
                </div>
              </div>
              <Button
                variant="primary"
                size="lg"
                disabled={!isReady || !financingFieldsOk}
                onClick={launch}
                iconRight={<ArrowRight size={18} />}
              >
                Lancer la présentation
              </Button>
            </div>
            <ComplianceBanner style={{ marginTop: 16 }} />
          </div>

          {/* ─── Col droite : live preview ─── */}
          <aside className="vehicle-aside">
            <LivePreview
              year={year}
              make={make}
              model={model}
              trim={trim}
              color={color}
              category={category}
              subType={subType}
              clientName={clientSkipped ? '' : clientNameLocal}
              condition={condition}
              transType={transType}
            />
          </aside>
        </div>
      </main>

      <style>{`
        @media (max-width: 980px) {
          .vehicle-grid { grid-template-columns: 1fr !important; }
          .vehicle-aside { order: -1; }
        }
      `}</style>
    </div>
  );
}
