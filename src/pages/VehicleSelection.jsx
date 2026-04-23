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
import { paymentPerPeriodCents, leasePaymentPerPeriodCents } from '../utils/paymentCalculator';
import { Money } from '../utils/money';
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
  const [residualDollars, setResidualDollars] = useState('20000');
  const [annuityDue,     setAnnuityDue]       = useState(true);
  const [cashDollars,    setCashDollars]      = useState('40000');
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

  const parseMoney = (s) => parseFloat(String(s ?? '').replace(/\s/g, '').replace(/\$/g, '').replace(',', '.'));
  const parseRate  = (s) => parseFloat(String(s ?? '').replace(',', '.'));

  const capitalNum  = parseMoney(capitalDollars);
  const residualNum = parseMoney(residualDollars);
  const rateNum     = parseRate(interestRate);
  const cashNum     = parseMoney(cashDollars);

  const isReady = (year && make && model) || vinResult;
  const financingFieldsOk = (() => {
    if (transType === 'comptant') return Number.isFinite(cashNum) && cashNum > 0;
    if (!Number.isFinite(capitalNum) || capitalNum <= 0) return false;
    if (!(termMonths > 0)) return false;
    if (!Number.isFinite(rateNum) || rateNum < 0) return false;
    if (transType === 'location') {
      if (!Number.isFinite(residualNum) || residualNum < 0) return false;
      if (residualNum >= capitalNum) return false;
    }
    return true;
  })();

  // Aperçu « paiement de base » pour affichage dans la carte Financement
  const basePaymentPreviewCents = useMemo(() => {
    if (transType === 'comptant') return null;
    if (!financingFieldsOk) return null;
    const capC = Math.round(capitalNum * 100);
    if (transType === 'location') {
      return leasePaymentPerPeriodCents({
        annualRatePercent: rateNum,
        termMonths,
        capitalCents: capC,
        residualCents: Math.round(residualNum * 100),
        frequency: paymentFrequency,
        annuityDue,
      });
    }
    return paymentPerPeriodCents({
      annualRatePercent: rateNum,
      termMonths,
      principalCents: capC,
      frequency: paymentFrequency,
    });
  }, [transType, financingFieldsOk, capitalNum, residualNum, rateNum, termMonths, paymentFrequency, annuityDue]);

  const launch = () => {
    setFinError('');
    const vehicleData = {
      year, make, model, trim, color,
      category, subType,
      vin: vin || null,
      clientName: clientSkipped ? '' : clientNameLocal,
    };
    if (transType === 'comptant') {
      const parsed = financingSchema.safeParse({
        transactionType: 'comptant',
        capitalDollars: cashNum,
      });
      if (!parsed.success) {
        setFinError('Indiquez le prix total du véhicule.');
        return;
      }
      setFinancing({
        transactionType: 'comptant',
        capitalDollars: cashNum,
        termMonths: 0,
        interestRate: 0,
        paymentFrequency: 'monthly',
        basePaymentCents: null,
        residualDollars: 0,
        annuityDue: false,
        totalDueCents: Money.fromDollars(cashNum).cents,
      });
    } else if (transType === 'location') {
      const parsed = financingSchema.safeParse({
        transactionType: 'location',
        capitalDollars: capitalNum,
        termMonths,
        interestRate: rateNum,
        paymentFrequency,
        residualDollars: residualNum,
        annuityDue,
      });
      if (!parsed.success) {
        const first = parsed.error.issues?.[0];
        setFinError(first?.message || 'Vérifiez le capital, la résiduelle, la durée, le taux et la fréquence.');
        return;
      }
      const capC  = Math.round(capitalNum * 100);
      const resC  = Math.round(residualNum * 100);
      const baseC = leasePaymentPerPeriodCents({
        annualRatePercent: rateNum,
        termMonths,
        capitalCents: capC,
        residualCents: resC,
        frequency: paymentFrequency,
        annuityDue,
      });
      setFinancing({
        transactionType: 'location',
        capitalDollars: capitalNum,
        residualDollars: residualNum,
        termMonths,
        interestRate: rateNum,
        paymentFrequency,
        annuityDue,
        basePaymentCents: baseC,
      });
    } else {
      const parsed = financingSchema.safeParse({
        transactionType: 'financement',
        capitalDollars: capitalNum,
        termMonths,
        interestRate: rateNum,
        paymentFrequency,
      });
      if (!parsed.success) {
        setFinError('Vérifiez le capital, la durée, le taux et la fréquence.');
        return;
      }
      const capC = Math.round(capitalNum * 100);
      const baseC = paymentPerPeriodCents({
        annualRatePercent: rateNum,
        termMonths,
        principalCents: capC,
        frequency: paymentFrequency,
      });
      setFinancing({
        transactionType: 'financement',
        capitalDollars: capitalNum,
        termMonths,
        interestRate: rateNum,
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

            {/* Card — financement / location / comptant */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                <div className="step-badge">3</div>
                <h3 style={{ fontSize: 'var(--fs-lg)', margin: 0 }}>
                  {transType === 'financement' && 'Financement'}
                  {transType === 'location'    && 'Location (bail)'}
                  {transType === 'comptant'    && 'Achat comptant'}
                </h3>
                <span
                  style={{
                    marginLeft: 'auto',
                    fontSize: 'var(--fs-xs)',
                    color: 'var(--text-tertiary)',
                    fontWeight: 500,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  Étape 3 · Paramètres financiers
                </span>
              </div>
              <p className="form-helper" style={{ marginBottom: 12 }}>
                {transType === 'financement' && (
                  <>Capital à financer, durée, taux et fréquence (calcul du versement de base pour le menu final).</>
                )}
                {transType === 'location' && (
                  <>Capital loué (« cap cost »), valeur résiduelle, durée, taux et fréquence — le paiement est calculé actuariellement (paiement dû en début de période).</>
                )}
                {transType === 'comptant' && (
                  <>Aucun financement n’est calculé — indiquez simplement le prix total du véhicule.</>
                )}
              </p>
              {finError && (
                <p style={{ color: 'var(--crimson-500)', fontSize: 'var(--fs-xs)', marginBottom: 8 }}>{finError}</p>
              )}

              {transType === 'comptant' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                  <div>
                    <label className="form-label">Prix total du véhicule ($)</label>
                    <input
                      className="form-input"
                      value={cashDollars}
                      onChange={(e) => setCashDollars(e.target.value)}
                      inputMode="decimal"
                      placeholder="40 000"
                    />
                    <p className="form-helper" style={{ marginTop: 6 }}>
                      Montant payé en entier à la livraison. Les produits F&I s’ajoutent comme frais uniques.
                    </p>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={{ gridColumn: transType === 'location' ? '1 / 2' : '1 / -1' }}>
                    <label className="form-label">
                      {transType === 'location' ? 'Capital loué (cap cost) ($)' : 'Capital à financer ($)'}
                    </label>
                    <input
                      className="form-input"
                      value={capitalDollars}
                      onChange={(e) => setCapitalDollars(e.target.value)}
                      inputMode="decimal"
                      placeholder="40 000"
                    />
                  </div>

                  {transType === 'location' && (
                    <div style={{ gridColumn: '2 / 3' }}>
                      <label className="form-label">Valeur résiduelle ($)</label>
                      <input
                        className="form-input"
                        value={residualDollars}
                        onChange={(e) => setResidualDollars(e.target.value)}
                        inputMode="decimal"
                        placeholder="20 000"
                      />
                      <p className="form-helper" style={{ marginTop: 6 }}>
                        Valeur garantie à la fin du bail (option d’achat).
                        {capitalNum > 0 && residualNum >= 0 && residualNum < capitalNum
                          ? ` ≈ ${Math.round((residualNum / capitalNum) * 100)} % du capital loué.`
                          : ''}
                      </p>
                    </div>
                  )}

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
                    <label className="form-label">
                      {transType === 'location' ? 'Taux de location annuel (%)' : 'Taux annuel (%)'}
                    </label>
                    <input
                      className="form-input"
                      value={interestRate}
                      onChange={(e) => setInterestRate(e.target.value)}
                      inputMode="decimal"
                      placeholder="4.9"
                    />
                  </div>
                  <div style={{ gridColumn: transType === 'location' ? '1 / 2' : '1 / -1' }}>
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

                  {transType === 'location' && (
                    <div style={{ gridColumn: '2 / 3', display: 'flex', alignItems: 'center' }}>
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          fontSize: 'var(--fs-sm)',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                          userSelect: 'none',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={annuityDue}
                          onChange={(e) => setAnnuityDue(e.target.checked)}
                          style={{ accentColor: 'var(--or-700)' }}
                        />
                        Paiement dû en début de période (standard)
                      </label>
                    </div>
                  )}
                </div>
              )}

              {/* Aperçu versement de base */}
              {transType !== 'comptant' && basePaymentPreviewCents != null && (
                <div
                  style={{
                    marginTop: 14,
                    padding: '0.75rem 1rem',
                    background: 'var(--or-100)',
                    border: '1px solid var(--or-500)',
                    borderRadius: 'var(--r-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Zap size={16} style={{ color: 'var(--or-900)' }} />
                    <div>
                      <div
                        style={{
                          fontSize: 'var(--fs-xs)',
                          color: 'var(--or-900)',
                          fontWeight: 700,
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                        }}
                      >
                        Versement de base — {transType === 'location' ? 'location' : 'financement'}
                      </div>
                      <div
                        style={{
                          fontSize: 'var(--fs-lg)',
                          color: 'var(--text-primary)',
                          fontWeight: 700,
                        }}
                      >
                        {(basePaymentPreviewCents / 100).toLocaleString('fr-CA', {
                          style: 'currency', currency: 'CAD', maximumFractionDigits: 2,
                        })}{' '}
                        <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                          /{paymentFrequency === 'monthly' ? 'mois'
                            : paymentFrequency === 'biweekly' ? '2 sem.'
                            : 'semaine'}
                        </span>
                      </div>
                    </div>
                  </div>
                  {transType === 'location' && (
                    <div
                      style={{
                        fontSize: 'var(--fs-xs)',
                        color: 'var(--text-secondary)',
                        maxWidth: 340,
                        textAlign: 'right',
                      }}
                    >
                      Dépréciation financée :{' '}
                      <strong>
                        {(Math.max(0, capitalNum - residualNum)).toLocaleString('fr-CA', {
                          style: 'currency', currency: 'CAD', maximumFractionDigits: 0,
                        })}
                      </strong>{' '}
                      · Résiduelle à l’échéance :{' '}
                      <strong>
                        {(residualNum || 0).toLocaleString('fr-CA', {
                          style: 'currency', currency: 'CAD', maximumFractionDigits: 0,
                        })}
                      </strong>
                    </div>
                  )}
                </div>
              )}
            </div>

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
