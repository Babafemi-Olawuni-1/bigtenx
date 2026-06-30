// Wallet.jsx — Rebuilt per spec: currency dropdown, live rates, provider resolver
import { useState, useEffect, useRef, useCallback } from "react";
import {
  ArrowLeft, Sun, Moon, ChevronDown, Send, History,
  ArrowDownToLine, ArrowUpFromLine, Check, X, RefreshCw
} from "lucide-react";
import { t, C } from "../dashboard/tokens";
import { API } from "../auth/api";

// ── CURRENCY CONFIGURATION ─────────────────────────────────────────────────
const CURRENCIES = [
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', provider: 'paystack', flag: '🇳🇬' },
  { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi', provider: 'flutterwave', flag: '🇬🇭' },
  { code: 'USDT', symbol: '$', name: 'USDT', provider: 'crypto', flag: '₮' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', provider: 'flutterwave', flag: '🇰🇪' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', provider: 'flutterwave', flag: '🇿🇦' },
];

const ACTIVE_PROVIDERS = ['paystack']; // only NGN/Paystack live now

const NIGERIAN_BANKS = [
  'Access Bank','First Bank','GTBank','UBA','Zenith Bank',
  'Kuda Bank','Moniepoint','Opay','Palmpay','Polaris Bank',
  'Stanbic IBTC','Union Bank','Wema Bank','Fidelity Bank',
  'Keystone Bank','Ecobank','Heritage Bank',
];

const PAYSTACK_BACKEND_RATE = 1373.11; // fixed rate backend uses
const FALLBACK_RATE = 1587;

// ── TOP-LEVEL CURRENCY DROPDOWN ───────────────────────────────────────────
function CurrencyDropdown({ value, onChange, show, setShow, darkMode, tk }) {
  const curr = CURRENCIES.find(c => c.code === value) || CURRENCIES[0];
  const dropRef = useRef(null);
  useEffect(() => {
    const handleOutside = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setShow(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [setShow]);
  return (
    <div ref={dropRef} style={{ position: 'relative', flexShrink: 0 }}>
      <button onClick={() => setShow(s => !s)} style={{
        display: 'flex', alignItems: 'center', gap: 6, padding: '10px 12px',
        borderRadius: 12, background: darkMode ? 'rgba(255,255,255,0.08)' : '#F0F2F5',
        border: `1.5px solid ${tk.cardBorder}`, cursor: 'pointer', color: tk.text,
        fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap',
      }}>
        <span>{curr.flag}</span>
        <span>{curr.code}</span>
        <ChevronDown size={13} color={tk.text} />
      </button>
      {show && (
        <div style={{
          position: 'absolute', top: '110%', right: 0,
          background: darkMode ? '#0D1B2E' : '#fff',
          border: `1.5px solid ${tk.cardBorder}`,
          borderRadius: 14, zIndex: 50, minWidth: 210,
          boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
          overflow: 'hidden',
        }}>
          {CURRENCIES.map(c => {
            const active = ACTIVE_PROVIDERS.includes(c.provider);
            return (
              <button key={c.code} onClick={() => { if (active) { onChange(c.code); setShow(false); } }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '11px 16px', background: 'none', border: 'none',
                  cursor: active ? 'pointer' : 'not-allowed',
                  color: !active ? (darkMode ? 'rgba(255,255,255,0.3)' : '#CBD5E0') : tk.text,
                  fontWeight: c.code === value ? 700 : 500, fontSize: 13,
                  borderBottom: `1px solid ${tk.cardBorder}`,
                }}
              >
                <span style={{ fontSize: 16 }}>{c.flag}</span>
                <div style={{ textAlign: 'left' }}>
                  <div>{c.code}</div>
                  <div style={{ fontSize: 10, opacity: 0.5 }}>{active ? c.name : 'Coming soon'}</div>
                </div>
                {!active && <span style={{ marginLeft: 'auto', fontSize: 9, background: '#F0F2F5', color: '#8899AA', padding: '2px 6px', borderRadius: 6 }}>Soon</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── TRANSACTION TYPE META ─────────────────────────────────────────────────
const TX_META = {
  deposit:       { label: 'Deposit',       credit: true,  color: '#10b981', icon: 'down' },
  withdrawal:    { label: 'Withdrawal',    credit: false, color: '#EF4444', icon: 'up'   },
  admin_credit:  { label: 'Admin Credit',  credit: true,  color: '#10b981', icon: 'down' },
  admin_debit:   { label: 'Admin Debit',   credit: false, color: '#EF4444', icon: 'up'   },
  badge_purchase:{ label: 'Badge Purchase',credit: false, color: '#8B5CF6', icon: 'up'   },
  streak_reward: { label: 'Weekly Reward', credit: true,  color: '#F59E0B', icon: 'gift' },
  task_reward:   { label: 'Task Reward',   credit: true,  color: '#3B82F6', icon: 'star' },
  referral:      { label: 'Referral Bonus',credit: true,  color: C.orange,  icon: 'users'},
  vip_purchase:  { label: 'VIP Purchase',  credit: false, color: '#7C3AED', icon: 'crown'},
}
function getTxMeta(type) {
  return TX_META[type] || { label: type?.replace(/_/g,' ')?.replace(/\b\w/g,c=>c.toUpperCase()) || 'Transaction', credit: true, color: '#8899AA', icon: 'dot' }
}

function TxIcon({ icon, color }) {
  const bg = color + '18'
  return (
    <div style={{ width: 42, height: 42, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {icon === 'down'  && <ArrowDownToLine size={17} color={color} />}
      {icon === 'up'    && <ArrowUpFromLine size={17} color={color} />}
      {icon === 'gift'  && <span style={{ fontSize: 17 }}>🎁</span>}
      {icon === 'star'  && <span style={{ fontSize: 17 }}>⭐</span>}
      {icon === 'users' && <span style={{ fontSize: 17 }}>👥</span>}
      {icon === 'crown' && <span style={{ fontSize: 17 }}>👑</span>}
      {icon === 'dot'   && <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />}
    </div>
  )
}

function HistoryTab({ transactions, loadingHistory, loadHistory, darkMode, tk }) {
  const [selected, setSelected] = useState(null)

  const statusColor = (s) => s === 'completed' ? '#10b981' : s === 'rejected' ? '#EF4444' : '#F59E0B'
  const statusBg    = (s) => s === 'completed' ? '#10b98115' : s === 'rejected' ? '#EF444415' : '#F59E0B15'

  return (
    <div style={{ background: tk.card, borderRadius: 24, padding: 24, border: `1px solid ${tk.cardBorder}` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <span style={{ fontSize: 15, fontWeight: 800, color: tk.text }}>Transaction History</span>
        <button onClick={loadHistory} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6 }}>
          <RefreshCw size={15} color="#8899AA" />
        </button>
      </div>

      {loadingHistory ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#8899AA' }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', border: `2px solid ${C.orange}`, borderTopColor: 'transparent', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          Loading...
        </div>
      ) : transactions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <History size={38} color={tk.cardBorder} style={{ marginBottom: 12 }} />
          <div style={{ fontSize: 14, fontWeight: 700, color: tk.text }}>No transactions yet</div>
          <div style={{ fontSize: 12, color: '#8899AA', marginTop: 4 }}>Deposits, withdrawals and earnings appear here</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {transactions.map((tx, i) => {
            const meta = getTxMeta(tx.type)
            const sign = meta.credit ? '+' : '-'
            const amt  = parseFloat(tx.amount || 0)
            const date = new Date(tx.created_at)
            return (
              <div key={i} onClick={() => setSelected(tx)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '13px 14px', borderRadius: 14, cursor: 'pointer',
                  background: darkMode ? 'rgba(255,255,255,0.04)' : '#F7F9FC',
                  border: `1px solid ${tk.cardBorder}`,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.07)' : '#EEF2F8'}
                onMouseLeave={e => e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.04)' : '#F7F9FC'}
              >
                <TxIcon icon={meta.icon} color={meta.color} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: tk.text }}>{meta.label}</div>
                  <div style={{ fontSize: 10, color: '#8899AA', marginTop: 2 }}>
                    {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {tx.reference && <span style={{ marginLeft: 6, opacity: 0.6 }}>{tx.reference.slice(0, 12)}…</span>}
                  </div>
                  {tx.reason && (
                    <div style={{ fontSize: 10, color: meta.color, marginTop: 2, fontWeight: 600 }}>
                      "{tx.reason}"
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: meta.credit ? '#10b981' : '#EF4444' }}>
                    {sign}${amt.toFixed(2)}
                  </div>
                  <div style={{
                    display: 'inline-block', marginTop: 4,
                    fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                    background: statusBg(tx.status), color: statusColor(tx.status),
                  }}>
                    {tx.status?.toUpperCase()}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div onClick={() => setSelected(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 2000,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: darkMode ? '#0D1B2E' : '#fff',
            borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 500,
            padding: '0 0 32px',
            boxShadow: '0 -8px 40px rgba(0,0,0,0.2)',
            animation: 'slideUp 0.25s ease',
          }}>
            <style>{`@keyframes slideUp{from{transform:translateY(60px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
            {/* Handle */}
            <div style={{ width: 40, height: 4, borderRadius: 2, background: '#CBD5E0', margin: '14px auto 0' }} />
            {/* Header */}
            {(() => {
              const meta = getTxMeta(selected.type)
              const amt  = parseFloat(selected.amount || 0)
              return (
                <>
                  <div style={{
                    margin: '16px 20px 20px',
                    background: meta.credit
                      ? 'linear-gradient(135deg,#001F54,#003B8E)'
                      : 'linear-gradient(135deg,#1a0000,#3B0000)',
                    borderRadius: 18, padding: '20px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <TxIcon icon={meta.icon} color={meta.color} />
                      <div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>{meta.label}</div>
                        <div style={{ fontSize: 26, fontWeight: 900, color: meta.credit ? '#10b981' : '#FF6B6B', marginTop: 2 }}>
                          {meta.credit ? '+' : '-'}${amt.toFixed(2)}
                        </div>
                      </div>
                      <div style={{ marginLeft: 'auto' }}>
                        <div style={{
                          padding: '4px 12px', borderRadius: 20, fontSize: 10, fontWeight: 800,
                          background: selected.status === 'completed' ? '#10b98120' : selected.status === 'rejected' ? '#EF444420' : '#F59E0B20',
                          color: selected.status === 'completed' ? '#10b981' : selected.status === 'rejected' ? '#EF4444' : '#F59E0B',
                        }}>
                          {selected.status?.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '0 20px' }}>
                    {[
                      ['Date', new Date(selected.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })],
                      selected.reference && ['Reference', selected.reference],
                      selected.bank_name && ['Bank', selected.bank_name],
                      selected.account_name && ['Account Name', selected.account_name],
                      selected.account_number && ['Account No.', selected.account_number],
                      selected.network && ['Network', selected.network],
                      selected.wallet_address && ['Wallet', selected.wallet_address.slice(0,20) + '…'],
                      selected.currency && ['Currency', selected.currency],
                      selected.rate_used && ['Rate Used', `1 USD = ₦${parseFloat(selected.rate_used).toFixed(2)}`],
                      selected.reason && ['Admin Reason', selected.reason],
                    ].filter(Boolean).map(([k, v]) => (
                      <div key={k} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                        padding: '11px 0', borderBottom: `1px solid ${tk.cardBorder}`,
                      }}>
                        <span style={{ fontSize: 12, color: '#8899AA', fontWeight: 600, flexShrink: 0, marginRight: 16 }}>{k}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: tk.text, textAlign: 'right', wordBreak: 'break-all' }}>{v}</span>
                      </div>
                    ))}
                    <button onClick={() => setSelected(null)} style={{
                      marginTop: 20, width: '100%', padding: 14, borderRadius: 14,
                      background: C.orange, border: 'none', color: '#fff',
                      fontWeight: 800, fontSize: 14, cursor: 'pointer',
                    }}>
                      Close
                    </button>
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Wallet({ user, updateUser, darkMode, setDarkMode, onBack, initialTab }) {
  const tk = t(darkMode);
  const usdBalance = parseFloat(user?.usd_balance ?? user?.usdBalance ?? 0);
  const coins = parseInt(user?.coins ?? 0);

  // ── TABS ───────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState(initialTab || 'deposit');
  useEffect(() => { if (initialTab) setActiveTab(initialTab); }, [initialTab]);

  // ── EXCHANGE RATES ─────────────────────────────────────────────────────
  const [rates, setRates] = useState({ NGN: FALLBACK_RATE, GHS: 15.8, KES: 128, ZAR: 18.5, USDT: 1 });
  const [ratesLoading, setRatesLoading] = useState(true);

  useEffect(() => {
    fetch("https://open.er-api.com/v6/latest/USD")
      .then(r => r.json())
      .then(data => {
        if (data?.rates) {
          setRates({
            NGN: parseFloat(data.rates.NGN) || FALLBACK_RATE,
            GHS: parseFloat(data.rates.GHS) || 15.8,
            KES: parseFloat(data.rates.KES) || 128,
            ZAR: parseFloat(data.rates.ZAR) || 18.5,
            USDT: 1,
          });
        }
      })
      .catch(() => {}) // keep fallback
      .finally(() => setRatesLoading(false));
  }, []);

  // ── DEPOSIT STATE ──────────────────────────────────────────────────────
  const [depositCurrency, setDepositCurrency] = useState('NGN');
  const [depositAmount, setDepositAmount] = useState('');
  const [depositEmail, setDepositEmail] = useState(user?.email || '');
  const [showDepositCurrencyDrop, setShowDepositCurrencyDrop] = useState(false);
  const [paystackSuccess, setPaystackSuccess] = useState(false);

  useEffect(() => { if (user?.email) setDepositEmail(user.email); }, [user?.email]);

  // ── WITHDRAW STATE ─────────────────────────────────────────────────────
  const [withdrawCurrency, setWithdrawCurrency] = useState('NGN');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [showWithdrawCurrencyDrop, setShowWithdrawCurrencyDrop] = useState(false);
  const [bankDetails, setBankDetails] = useState({ bankCode: '', bankName: '', accountNumber: '', accountName: '' });
  const [savedBanks, setSavedBanks] = useState([]);
  const [useSavedBank, setUseSavedBank] = useState(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [network, setNetwork] = useState('TRC20');
  const [banksList, setBanksList] = useState([]);
  const [resolvingAccount, setResolvingAccount] = useState(false);

  // ── HISTORY ────────────────────────────────────────────────────────────
  const [transactions, setTransactions] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // ── MODAL & TOAST ──────────────────────────────────────────────────────
  const [modal, setModal] = useState(null); // 'deposit' | 'withdraw'
  const [modalAnimate, setModalAnimate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const openModal = (type) => {
    setModal(type);
    setTimeout(() => setModalAnimate(true), 10);
  };
  const closeModal = () => {
    setModalAnimate(false);
    setTimeout(() => { setModal(null); }, 280);
  };

  // ── LOAD BANKS FROM PAYSTACK ──────────────────────────────────────────
  useEffect(() => {
    fetch(`${API}/paystack/banks.php`)
      .then(r => r.json())
      .then(d => { if (d?.status && Array.isArray(d.data)) setBanksList(d.data); })
      .catch(() => {});
  }, []);

  // ── AUTO-RESOLVE ACCOUNT NAME ─────────────────────────────────────────
  useEffect(() => {
    const accNum  = bankDetails.accountNumber;
    const bankCode = bankDetails.bankCode;
    if (accNum.length !== 10 || !bankCode) return;
    setResolvingAccount(true);
    fetch(`${API}/paystack/resolve_account.php?account_number=${accNum}&bank_code=${bankCode}`)
      .then(r => r.json())
      .then(d => {
        if (d?.status && d?.data?.account_name) {
          setBankDetails(b => ({ ...b, accountName: d.data.account_name }));
        } else {
          setBankDetails(b => ({ ...b, accountName: '' }));
        }
      })
      .catch(() => {})
      .finally(() => setResolvingAccount(false));
  }, [bankDetails.accountNumber, bankDetails.bankCode]);

  // ── BALANCE SYNC ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;
    fetch(`${API}/wallet/index.php?user_id=${user.id}`)
      .then(r => r.json())
      .then(data => {
        if (data?.success && data?.wallet) {
          updateUser({
            usd_balance: parseFloat(data.wallet.usd_balance),
            usdBalance: parseFloat(data.wallet.usd_balance),
            coins: parseInt(data.wallet.coins),
            deposit_status: parseInt(data.wallet.deposit_status ?? 1),
            withdraw_status: parseInt(data.wallet.withdraw_status ?? 1),
            account_status: parseInt(data.wallet.account_status ?? 1),
          });
        }
      })
      .catch(() => {});
  }, [user?.id]);

  // ── PAYSTACK RETURN VERIFICATION ──────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('reference');
    if (!ref || !user?.id) return;
    fetch(`${API}/paystack/verify.php?reference=${ref}&user_id=${user.id}`)
      .then(r => r.json())
      .then(data => {
        if (data?.success) {
          updateUser({ usd_balance: parseFloat(data.newBalance), usdBalance: parseFloat(data.newBalance) });
          setPaystackSuccess(true);
          loadHistory();
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      })
      .catch(() => {});
  }, [user?.id]);

  // ── HISTORY LOAD ──────────────────────────────────────────────────────
  const loadHistory = async () => {
    if (!user?.id) return;
    setLoadingHistory(true);
    try {
      const res = await fetch(`${API}/wallet/history.php?user_id=${user.id}`);
      const data = await res.json();
      if (data?.success && Array.isArray(data.transactions)) setTransactions(data.transactions);
    } catch {}
    finally { setLoadingHistory(false); }
  };

  useEffect(() => { if (activeTab === 'history') loadHistory(); }, [activeTab]);

  // ── COMPUTED VALUES ────────────────────────────────────────────────────
  const depUsdAmt = parseFloat(depositAmount) || 0;
  const depCurr = CURRENCIES.find(c => c.code === depositCurrency) || CURRENCIES[0];
  const depRate = rates[depositCurrency] || 1;
  const depLocalAmt = depUsdAmt * depRate;
  const depProvider = depCurr.provider;
  const depProviderActive = ACTIVE_PROVIDERS.includes(depProvider);

  const wdrUsdAmt = parseFloat(withdrawAmount) || 0;
  const wdrCurr = CURRENCIES.find(c => c.code === withdrawCurrency) || CURRENCIES[0];
  const wdrRate = rates[withdrawCurrency] || 1;
  const wdrLocalAmt = wdrUsdAmt * wdrRate;

  // ── DEPOSIT SUBMIT ─────────────────────────────────────────────────────
  const depositFrozen = parseInt(user?.deposit_status ?? 1) === 0;
  const withdrawFrozen = parseInt(user?.withdraw_status ?? 1) === 0;
  const accountFrozen = parseInt(user?.account_status ?? 1) === 0;

  const initiateDeposit = () => {
    if (accountFrozen) { showToast('Your account is disabled. Contact support.', 'error'); return; }
    if (depositFrozen) { showToast('Deposits are currently frozen on your account. Contact support.', 'error'); return; }
    if (depUsdAmt <= 0) { showToast('Please enter a valid amount', 'error'); return; }
    if (!depositEmail?.includes('@')) { showToast('Please enter a valid email', 'error'); return; }
    if (!depProviderActive) { showToast(`${depositCurrency} payments not yet available`, 'error'); return; }
    openModal('deposit');
  };

  const confirmDeposit = async () => {
    setSubmitting(true);
    try {
      // Send USD amount; backend converts using its fixed rate
      // To get exact NGN charged: send nairaTotal / backend_rate
      const usdForPaystack = depLocalAmt / PAYSTACK_BACKEND_RATE;
      const res = await fetch(`${API}/paystack/init.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: depositEmail, amount: usdForPaystack.toString() }),
      });
      const data = await res.json();
      if (data?.status && data?.data?.authorization_url) {
        window.location.href = data.data.authorization_url;
      } else {
        showToast(data?.message || 'Payment failed to initialize', 'error');
        closeModal();
      }
    } catch {
      showToast('Payment initialization failed', 'error');
      closeModal();
    } finally { setSubmitting(false); }
  };

  // ── WITHDRAW SUBMIT ────────────────────────────────────────────────────
  const initiateWithdraw = () => {
    if (accountFrozen) { showToast('Your account is disabled. Contact support.', 'error'); return; }
    if (withdrawFrozen) { showToast('Withdrawals are currently frozen on your account. Contact support.', 'error'); return; }
    if (wdrUsdAmt <= 0) { showToast('Enter a valid amount', 'error'); return; }
    if (wdrUsdAmt < 3) { showToast('Minimum withdrawal is $3', 'error'); return; }
    if (wdrUsdAmt > usdBalance) { showToast('Insufficient balance', 'error'); return; }
    if (withdrawCurrency === 'USDT') {
      if (!walletAddress.trim()) { showToast('Enter your USDT wallet address', 'error'); return; }
    } else {
      const bd = useSavedBank !== null ? savedBanks[useSavedBank] : bankDetails;
      if (!bd?.bankName || !bd?.accountNumber || !bd?.accountName) {
        showToast('Fill in all bank details', 'error'); return;
      }
      if (bd.accountNumber.length !== 10) { showToast('Account number must be 10 digits', 'error'); return; }
    }
    openModal('withdraw');
  };

  const confirmWithdraw = async () => {
    setSubmitting(true);
    const bd = useSavedBank !== null ? savedBanks[useSavedBank] : bankDetails;
    try {
      const body = {
        user_id: user.id,
        amount: wdrUsdAmt,
        currency: withdrawCurrency,
        ...(withdrawCurrency === 'USDT'
          ? { wallet_address: walletAddress, network }
          : { bank_name: bd.bankName, account_number: bd.accountNumber, account_name: bd.accountName }
        ),
      };
      const res = await fetch(`${API}/wallet/withdraw.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data?.success) {
        showToast(data.message || 'Withdrawal request submitted', 'success');
        // Save bank for future use
        if (withdrawCurrency !== 'USDT' && useSavedBank === null && bd.bankName) {
          const existing = savedBanks.find(s => s.accountNumber === bd.accountNumber);
          if (!existing) setSavedBanks(prev => [...prev, { ...bd }]);
        }
        setWithdrawAmount('');
        closeModal();
        setActiveTab('history');
        fetch(`${API}/wallet/index.php?user_id=${user.id}`)
          .then(r => r.json())
          .then(d => {
            if (d?.success && d?.wallet) updateUser({ usd_balance: parseFloat(d.wallet.usd_balance), usdBalance: parseFloat(d.wallet.usd_balance), coins: parseInt(d.wallet.coins) });
          });
      } else {
        showToast(data?.message || 'Withdrawal failed', 'error');
        closeModal();
      }
    } catch {
      showToast('Network error', 'error');
      closeModal();
    } finally { setSubmitting(false); }
  };

  // ── STYLES ────────────────────────────────────────────────────────────
  const inp = {
    width: '100%', padding: '13px 15px', borderRadius: 13,
    border: `1.5px solid ${tk.cardBorder}`,
    background: darkMode ? 'rgba(255,255,255,0.04)' : '#F7F8FC',
    color: tk.text, WebkitTextFillColor: tk.text,
    colorScheme: darkMode ? 'dark' : 'light',
    fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
  };

  const sel = { ...inp, appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer' };

  return (
    <div style={{ background: tk.bg, minHeight: '100vh', paddingBottom: 50 }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)',
          background: toast.type === 'error' ? '#EF4444' : '#10b981',
          color: '#fff', borderRadius: 12, padding: '12px 20px',
          fontSize: 13, fontWeight: 600, zIndex: 2000,
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          {toast.type === 'error' ? <X size={14} /> : <Check size={14} />} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px', background: tk.bg, borderBottom: `1px solid ${tk.cardBorder}`,
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {onBack && (
            <button onClick={onBack} style={{
              width: 38, height: 38, borderRadius: '50%',
              background: tk.card, border: `1.5px solid ${tk.cardBorder}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}>
              <ArrowLeft size={18} color={tk.text} />
            </button>
          )}
          <span style={{ fontSize: 18, fontWeight: 800, color: tk.text }}>Wallet</span>
        </div>
        <button onClick={() => setDarkMode(!darkMode)} style={{
          width: 38, height: 38, borderRadius: '50%',
          background: tk.card, border: `1.5px solid ${tk.cardBorder}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>
          {darkMode ? <Sun size={15} color={C.orange} /> : <Moon size={15} color={C.navy} />}
        </button>
      </div>

      <div style={{ padding: '0 16px', maxWidth: 600, margin: '0 auto' }}>
        {/* Balance Card */}
        <div style={{
          margin: '20px 0', borderRadius: 24,
          background: 'linear-gradient(135deg, #001F54 0%, #003B8E 100%)',
          padding: '24px 20px', position: 'relative', overflow: 'hidden',
          boxShadow: '0 12px 24px -10px rgba(0,31,84,0.4)',
        }}>
          <div style={{ position: 'absolute', top: -50, right: -50, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,111,0,0.1)' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Total Balance</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginTop: 6 }}>
                  ${usdBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div style={{ background: 'rgba(255,111,0,0.2)', borderRadius: 30, padding: '4px 14px', border: '1px solid rgba(255,111,0,0.3)' }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: '#FF8F00' }}>USD</span>
              </div>
            </div>
            <div style={{ marginTop: 20, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>XP Balance</span>
              <span style={{ fontSize: 15, fontWeight: 800, color: '#FF8F00' }}>{coins.toLocaleString()} XP</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          {[
            { id: 'deposit', label: 'Add Funds', icon: ArrowDownToLine },
            { id: 'withdraw', label: 'Withdraw', icon: ArrowUpFromLine },
            { id: 'history', label: 'History', icon: History },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              flex: 1, padding: '12px 0', borderRadius: 14,
              background: activeTab === tab.id ? C.orange : tk.card,
              border: `1.5px solid ${activeTab === tab.id ? C.orange : tk.cardBorder}`,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.2s ease',
            }}>
              <tab.icon size={16} color={activeTab === tab.id ? '#fff' : C.orange} />
              <span style={{ fontSize: 13, fontWeight: 700, color: activeTab === tab.id ? '#fff' : tk.text }}>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── ADD FUNDS TAB ── */}
        {activeTab === 'deposit' && (
          <div style={{ background: tk.card, borderRadius: 24, padding: 24, border: `1px solid ${tk.cardBorder}` }}>
            {/* Freeze Banner */}
            {(depositFrozen || accountFrozen) && (
              <div style={{
                background: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: 14,
                padding: '12px 16px', marginBottom: 16,
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ fontSize: 18 }}>🔒</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#DC2626' }}>
                    {accountFrozen ? 'Account Disabled' : 'Deposits Frozen'}
                  </div>
                  <div style={{ fontSize: 11, color: '#EF4444', marginTop: 2 }}>
                    {accountFrozen ? 'Your account has been disabled. Contact support.' : 'Deposits are currently disabled on your account. Contact support.'}
                  </div>
                </div>
              </div>
            )}
            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: tk.text }}>Add Funds</span>
              <CurrencyDropdown
                value={depositCurrency}
                onChange={setDepositCurrency}
                show={showDepositCurrencyDrop}
                setShow={setShowDepositCurrencyDrop}
                darkMode={darkMode}
                tk={tk}
              />
            </div>

            {/* Amount input — always USD */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: tk.text, marginBottom: 8, display: 'block' }}>
                Amount to Add (USD)
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', fontSize: 15, fontWeight: 700, color: tk.text, opacity: 0.6 }}>$</span>
                <input
                  type="number" min="0" step="0.01"
                  value={depositAmount} onChange={e => setDepositAmount(e.target.value)}
                  placeholder="0.00"
                  style={{ ...inp, paddingLeft: 32, fontSize: 18, fontWeight: 800 }}
                />
              </div>
            </div>

            {/* Live conversion block */}
            {depUsdAmt > 0 && (
              <div style={{
                background: darkMode ? 'rgba(255,111,0,0.08)' : '#FFF8F0',
                border: `1.5px solid ${C.orange}25`,
                borderRadius: 14, padding: '14px 16px', marginBottom: 16,
                transition: 'all 0.3s ease',
              }}>
                <div style={{ fontSize: 11, color: C.orange, fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  You will send
                </div>
                <div style={{ fontSize: 22, fontWeight: 900, color: tk.text }}>
                  {depCurr.symbol}{depLocalAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: 11, color: '#8899AA', marginTop: 4 }}>
                  {ratesLoading
                    ? 'Fetching live rate...'
                    : `Exchange rate 1 USD = ${depositCurrency === 'USDT' ? '$1' : `${depCurr.symbol}${depRate.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}`
                  }
                </div>
              </div>
            )}

            {/* Email (readonly) */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: tk.text, marginBottom: 8, display: 'block' }}>Email Address</label>
              <input
                type="email" value={depositEmail} readOnly
                style={{ ...inp, opacity: 0.7, cursor: 'not-allowed' }}
              />
            </div>

            {/* Payment provider info */}
            <div style={{
              background: depProviderActive
                ? (darkMode ? 'rgba(16,185,129,0.08)' : '#F0FDF4')
                : (darkMode ? 'rgba(255,255,255,0.04)' : '#F7F8FC'),
              borderRadius: 12, padding: '10px 14px', marginBottom: 16,
              border: `1px solid ${depProviderActive ? '#10b98130' : tk.cardBorder}`,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{ fontSize: 18 }}>{depCurr.flag}</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: depProviderActive ? '#10b981' : '#8899AA' }}>
                  {depProviderActive ? `✓ ${depCurr.provider.charAt(0).toUpperCase() + depCurr.provider.slice(1)} — Ready` : `${depositCurrency} payments — Coming Soon`}
                </div>
                <div style={{ fontSize: 10, color: '#8899AA' }}>
                  {depProviderActive ? `Secure checkout via ${depCurr.provider}` : 'Only NGN via Paystack is currently active'}
                </div>
              </div>
            </div>

            {paystackSuccess && (
              <div style={{ marginBottom: 14, padding: 12, borderRadius: 12, background: 'rgba(16,185,129,0.12)', textAlign: 'center', color: '#10b981', fontSize: 13, fontWeight: 700 }}>
                ✓ Deposit successful! Your balance has been updated.
              </div>
            )}

            <button onClick={initiateDeposit} disabled={!depProviderActive || depositFrozen || accountFrozen} style={{
              width: '100%', padding: 15, borderRadius: 14,
              background: (depProviderActive && !depositFrozen && !accountFrozen) ? C.orange : '#CBD5E0',
              border: 'none', color: '#fff', fontWeight: 800, fontSize: 14,
              cursor: (depProviderActive && !depositFrozen && !accountFrozen) ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: (depProviderActive && !depositFrozen && !accountFrozen) ? '0 4px 14px rgba(255,111,0,0.3)' : 'none',
              transition: 'all 0.2s',
            }}>
              <Send size={16} /> {depositFrozen || accountFrozen ? '🔒 Deposits Frozen' : 'Proceed to Add Funds'}
            </button>
          </div>
        )}

        {/* ── WITHDRAW TAB ── */}
        {activeTab === 'withdraw' && (
          <div style={{ background: tk.card, borderRadius: 24, padding: 24, border: `1px solid ${tk.cardBorder}` }}>
            {/* Freeze Banner */}
            {(withdrawFrozen || accountFrozen) && (
              <div style={{
                background: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: 14,
                padding: '12px 16px', marginBottom: 16,
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ fontSize: 18 }}>🔒</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#DC2626' }}>
                    {accountFrozen ? 'Account Disabled' : 'Withdrawals Frozen'}
                  </div>
                  <div style={{ fontSize: 11, color: '#EF4444', marginTop: 2 }}>
                    {accountFrozen ? 'Your account has been disabled. Contact support.' : 'Withdrawals are currently disabled on your account. Contact support.'}
                  </div>
                </div>
              </div>
            )}
            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: tk.text }}>Withdraw Funds</span>
              <CurrencyDropdown
                value={withdrawCurrency}
                onChange={setWithdrawCurrency}
                show={showWithdrawCurrencyDrop}
                setShow={setShowWithdrawCurrencyDrop}
                darkMode={darkMode}
                tk={tk}
              />
            </div>

            {/* Amount input — always USD */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: tk.text, marginBottom: 8, display: 'block' }}>
                Amount to Withdraw (USD)
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', fontSize: 15, fontWeight: 700, color: tk.text, opacity: 0.6 }}>$</span>
                <input
                  type="number" min="0" step="0.01"
                  value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)}
                  placeholder="0.00"
                  style={{ ...inp, paddingLeft: 32, paddingRight: 70, fontSize: 18, fontWeight: 800 }}
                />
                <button onClick={() => setWithdrawAmount(usdBalance.toFixed(2))} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: `${C.orange}15`, border: `1px solid ${C.orange}30`,
                  borderRadius: 8, padding: '4px 10px', color: C.orange,
                  fontSize: 11, fontWeight: 700, cursor: 'pointer',
                }}>MAX</button>
              </div>
            </div>

            {/* Live conversion */}
            {wdrUsdAmt > 0 && (
              <div style={{
                background: darkMode ? 'rgba(255,111,0,0.08)' : '#FFF8F0',
                border: `1.5px solid ${C.orange}25`, borderRadius: 14, padding: '14px 16px', marginBottom: 16,
              }}>
                <div style={{ fontSize: 11, color: C.orange, fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  You'll receive
                </div>
                <div style={{ fontSize: 22, fontWeight: 900, color: tk.text }}>
                  {wdrCurr.symbol}{wdrLocalAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: 11, color: '#8899AA', marginTop: 4 }}>
                  {ratesLoading ? 'Fetching live rate...' : `Exchange rate 1 USD = ${withdrawCurrency === 'USDT' ? '$1' : `${wdrCurr.symbol}${wdrRate.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}`}
                </div>
              </div>
            )}

            {/* NGN — Bank Details */}
            {withdrawCurrency !== 'USDT' && (
              <div>
                {/* Saved banks */}
                {savedBanks.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: tk.text, marginBottom: 10 }}>Select Bank Account</div>
                    {savedBanks.map((bank, i) => (
                      <div key={i} onClick={() => setUseSavedBank(useSavedBank === i ? null : i)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '12px 14px', borderRadius: 12, marginBottom: 8, cursor: 'pointer',
                          border: `1.5px solid ${useSavedBank === i ? C.orange : tk.cardBorder}`,
                          background: useSavedBank === i ? `${C.orange}08` : tk.card,
                        }}>
                        <div style={{
                          width: 18, height: 18, borderRadius: '50%',
                          border: `2px solid ${useSavedBank === i ? C.orange : '#CBD5E0'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {useSavedBank === i && <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.orange }} />}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: tk.text }}>{bank.bankName}</div>
                          <div style={{ fontSize: 11, color: '#8899AA' }}>{bank.accountName} • {bank.accountNumber}</div>
                        </div>
                      </div>
                    ))}
                    <div onClick={() => setUseSavedBank(null)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '12px 14px', borderRadius: 12, marginBottom: 16, cursor: 'pointer',
                        border: `1.5px solid ${useSavedBank === null ? C.orange : tk.cardBorder}`,
                        background: useSavedBank === null ? `${C.orange}08` : tk.card,
                      }}>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${useSavedBank === null ? C.orange : '#CBD5E0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {useSavedBank === null && <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.orange }} />}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: tk.text }}>Add New Bank Account</div>
                    </div>
                  </div>
                )}

                {/* New bank form */}
                {useSavedBank === null && (
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: tk.text, marginBottom: 12 }}>Bank Details</div>
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ fontSize: 11, fontWeight: 600, color: '#8899AA', display: 'block', marginBottom: 6 }}>Select Bank</label>
                      <div style={{ position: 'relative' }}>
                        <select
                          value={bankDetails.bankCode}
                          onChange={e => {
                            const selected = banksList.find(b => b.code === e.target.value);
                            setBankDetails(b => ({ ...b, bankCode: e.target.value, bankName: selected?.name || '', accountName: '' }));
                          }}
                          style={sel}
                        >
                          <option value="">— Select Bank —</option>
                          {banksList.length > 0
                            ? banksList.map(b => <option key={b.code} value={b.code}>{b.name}</option>)
                            : NIGERIAN_BANKS.map(b => <option key={b} value={b}>{b}</option>)
                          }
                        </select>
                        <ChevronDown size={14} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: tk.text, opacity: 0.5 }} />
                      </div>
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ fontSize: 11, fontWeight: 600, color: '#8899AA', display: 'block', marginBottom: 6 }}>Account Number</label>
                      <input type="text" maxLength={10} value={bankDetails.accountNumber}
                        onChange={e => setBankDetails(b => ({ ...b, accountNumber: e.target.value, accountName: '' }))}
                        placeholder="10-digit account number" style={inp} />
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ fontSize: 11, fontWeight: 600, color: '#8899AA', display: 'block', marginBottom: 6 }}>
                        Account Name {resolvingAccount && <span style={{ color: C.orange, fontSize: 10 }}>  Verifying...</span>}
                      </label>
                      <input type="text" value={bankDetails.accountName} readOnly
                        placeholder={resolvingAccount ? 'Fetching account name...' : 'Auto-filled after account number'}
                        style={{ ...inp, opacity: 0.8, cursor: 'not-allowed', background: darkMode ? 'rgba(255,255,255,0.02)' : '#F0F2F5' }} />
                      {bankDetails.accountName && (
                        <div style={{ fontSize: 11, color: '#10b981', marginTop: 4, fontWeight: 600 }}>✓ Verified: {bankDetails.accountName}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* USDT — Wallet Details */}
            {withdrawCurrency === 'USDT' && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: tk.text, marginBottom: 12 }}>Wallet Details</div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#8899AA', display: 'block', marginBottom: 6 }}>Network</label>
                  <div style={{ position: 'relative' }}>
                    <select value={network} onChange={e => setNetwork(e.target.value)} style={sel}>
                      <option value="TRC20">TRC20</option>
                      <option value="ERC20">ERC20 (coming soon)</option>
                    </select>
                    <ChevronDown size={14} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: tk.text, opacity: 0.5 }} />
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#8899AA', display: 'block', marginBottom: 6 }}>Wallet Address</label>
                  <input type="text" value={walletAddress} onChange={e => setWalletAddress(e.target.value)}
                    placeholder="Your USDT wallet address" style={inp} />
                </div>
              </div>
            )}

            <button onClick={initiateWithdraw} disabled={withdrawFrozen || accountFrozen} style={{
              width: '100%', padding: 15, borderRadius: 14,
              background: (withdrawFrozen || accountFrozen) ? '#CBD5E0' : C.orange,
              border: 'none', color: '#fff',
              fontWeight: 800, fontSize: 14,
              cursor: (withdrawFrozen || accountFrozen) ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: (!withdrawFrozen && !accountFrozen) ? '0 4px 14px rgba(255,111,0,0.3)' : 'none',
              transition: 'all 0.2s',
            }}>
              <Send size={16} /> {(withdrawFrozen || accountFrozen) ? '🔒 Withdrawals Frozen' : 'Request Payment'}
            </button>
          </div>
        )}

        {/* ── HISTORY TAB ── */}
        {activeTab === 'history' && (
          <HistoryTab
            transactions={transactions}
            loadingHistory={loadingHistory}
            loadHistory={loadHistory}
            darkMode={darkMode}
            tk={tk}
          />
        )}
      </div>

      {/* ── DEPOSIT CONFIRM MODAL ── */}
      {modal === 'deposit' && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
          zIndex: 1000, paddingTop: 60, opacity: modalAnimate ? 1 : 0, transition: 'opacity 0.25s',
        }}>
          <div style={{
            background: '#fff', borderRadius: 28, width: '90%', maxWidth: 400,
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
            transform: modalAnimate ? 'translateY(0)' : 'translateY(-60px)',
            opacity: modalAnimate ? 1 : 0, transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
          }}>
            <div style={{ background: 'linear-gradient(135deg,#001F54,#003B8E)', borderRadius: '28px 28px 0 0', padding: '24px 24px 20px' }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Confirm Deposit</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', marginTop: 6 }}>${depUsdAmt.toFixed(2)}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>via Paystack → {depCurr.symbol}{depLocalAmt.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
            </div>
            <div style={{ padding: '20px 24px' }}>
              {[['Email', depositEmail], ['Provider', 'Paystack'], ['Currency', depositCurrency]].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F0F2F5', fontSize: 13 }}>
                  <span style={{ color: '#8899AA' }}>{k}</span>
                  <span style={{ fontWeight: 700, color: '#001F54' }}>{v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button onClick={closeModal} disabled={submitting} style={{ flex: 1, padding: 14, borderRadius: 12, border: '1.5px solid #E9EDF2', background: '#fff', color: '#001F54', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>Cancel</button>
                <button onClick={confirmDeposit} disabled={submitting} style={{ flex: 2, padding: 14, borderRadius: 12, background: C.orange, border: 'none', color: '#fff', fontWeight: 800, cursor: 'pointer', fontSize: 13, opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? 'Redirecting...' : 'Pay Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── WITHDRAW CONFIRM MODAL ── */}
      {modal === 'withdraw' && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
          zIndex: 1000, paddingTop: 60, opacity: modalAnimate ? 1 : 0, transition: 'opacity 0.25s',
        }}>
          <div style={{
            background: '#fff', borderRadius: 28, width: '90%', maxWidth: 400,
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
            transform: modalAnimate ? 'translateY(0)' : 'translateY(-60px)',
            opacity: modalAnimate ? 1 : 0, transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
          }}>
            <div style={{ background: 'linear-gradient(135deg,#001F54,#003B8E)', borderRadius: '28px 28px 0 0', padding: '24px 24px 20px' }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Confirm Withdrawal</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', marginTop: 6 }}>${wdrUsdAmt.toFixed(2)}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>≈ {wdrCurr.symbol}{wdrLocalAmt.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
            </div>
            <div style={{ padding: '20px 24px' }}>
              {withdrawCurrency === 'USDT' ? (
                [['Network', network], ['Address', walletAddress.slice(0, 16) + '...']].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F0F2F5', fontSize: 13 }}>
                    <span style={{ color: '#8899AA' }}>{k}</span>
                    <span style={{ fontWeight: 700, color: '#001F54' }}>{v}</span>
                  </div>
                ))
              ) : (() => {
                const bd = useSavedBank !== null ? savedBanks[useSavedBank] : bankDetails;
                return [['Bank', bd.bankName], ['Account', bd.accountNumber], ['Name', bd.accountName]].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F0F2F5', fontSize: 13 }}>
                    <span style={{ color: '#8899AA' }}>{k}</span>
                    <span style={{ fontWeight: 700, color: '#001F54' }}>{v}</span>
                  </div>
                ));
              })()}
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button onClick={closeModal} disabled={submitting} style={{ flex: 1, padding: 14, borderRadius: 12, border: '1.5px solid #E9EDF2', background: '#fff', color: '#001F54', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>Cancel</button>
                <button onClick={confirmWithdraw} disabled={submitting} style={{ flex: 2, padding: 14, borderRadius: 12, background: C.orange, border: 'none', color: '#fff', fontWeight: 800, cursor: 'pointer', fontSize: 13, opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? 'Submitting...' : 'Confirm Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
