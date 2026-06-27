// Wallet.jsx - COMPLETE REFACTORED VERSION WITH CUSTOM MOBILE FINTECH MODALS
import { useState, useEffect } from "react";
import { 
  Sun, Moon, Copy, ArrowLeft, X, Check, Send, Users,
  Wallet as WalletIcon, History, ArrowDownToLine, ArrowUpFromLine,
  TrendingUp
} from "lucide-react";
import { t, C } from "../dashboard/tokens";
import { API } from "../auth/api";

export default function Wallet({ user, updateUser, darkMode, setDarkMode, onBack, initialTab }) {
  const tk = t(darkMode);
  
  // ─── STANDARD BALANCES (AS REQUESTED) ───────────────────────────
  const usdBalance = parseFloat(user?.usd_balance ?? user?.usdBalance ?? 0);
  const coins = parseInt(user?.coins ?? 0);

  // ─── TABS & NAVIGATION ───────────────────────────────────────────
  const [activeTab, setActiveTab] = useState(initialTab || "deposit");
  const [toast, setToast] = useState(null);

  // Sync tab if initialTab changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // ─── DUAL CURRENCY VALUES & TOGGLES ──────────────────────────────
  const [depositAmount, setDepositAmount] = useState("");
  const [depositCurrency, setDepositCurrency] = useState("USD"); // "USD" or "NGN"
  
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawCurrency, setWithdrawCurrency] = useState("USD"); // "USD" or "NGN"

  // ─── BANK DETAILS FOR WITHDRAWAL ────────────────────────────────
  const [bankDetails, setBankDetails] = useState({
    bankName: "",
    accountName: "",
    accountNumber: "",
  });

  // ─── PAYSTACK SPECIFIC STATES ───────────────────────────────────
  const [paystackEmail, setPaystackEmail] = useState(user?.email || "");
  const [paystackSuccess, setPaystackSuccess] = useState(false);

  // ─── TRANSACTION HISTORY ─────────────────────────────────────────
  const [transactions, setTransactions] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // ─── EXCHANGE RATES ──────────────────────────────────────────────
  // liveRate = real-time USD/NGN (fetched on mount, fallback 1587)
  // PAYSTACK_BACKEND_RATE = fixed rate the backend init.php uses
  const PAYSTACK_BACKEND_RATE = 1373.11;
  const [liveRate, setLiveRate] = useState(1587.00);

  // ─── ANIMATED CONFIRMATION MODAL STATES ──────────────────────────
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmType, setConfirmType] = useState(null); // 'deposit' or 'withdraw'
  const [modalAnimate, setModalAnimate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [depositRef, setDepositRef] = useState("");
  const [withdrawRef, setWithdrawRef] = useState("");

  // Prefill email when user data is ready
  useEffect(() => {
    if (user?.email) {
      setPaystackEmail(user.email);
    }
  }, [user?.email]);

  // ─── FETCH LIVE MARKET RATE ─────────────────────────────────────
  useEffect(() => {
    fetch("https://open.er-api.com/v6/latest/USD")
      .then((res) => res.json())
      .then((data) => {
        if (data?.rates?.NGN) {
          setLiveRate(parseFloat(data.rates.NGN));
        }
      })
      .catch(() => setLiveRate(1587));
  }, []);

  // ─── BALANCE SYNC (FIXED AS REQUESTED) ───────────────────────────
  useEffect(() => {
    if (!user?.id) return;
    fetch(`${API}/wallet/index.php?user_id=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && data?.wallet) {
          updateUser({
            usd_balance: parseFloat(data.wallet.usd_balance),
            usdBalance: parseFloat(data.wallet.usd_balance),
            coins: parseInt(data.wallet.coins),
          });
        }
      })
      .catch((err) => console.log(err));
  }, [user?.id]);

  // ─── LOAD TRANSACTION HISTORY ────────────────────────────────────
  const loadHistory = async () => {
    if (!user?.id) return;
    setLoadingHistory(true);
    try {
      const res = await fetch(`${API}/wallet/history.php?user_id=${user.id}`);
      const data = await res.json();
      if (data?.success && Array.isArray(data?.transactions)) {
        setTransactions(data.transactions);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === "history") {
      loadHistory();
    }
  }, [activeTab]);

  // ─── PAYSTACK VERIFICATION ON RETURN ─────────────────────────────
  useEffect(() => {
    const verifyPaystack = async () => {
      const params = new URLSearchParams(window.location.search);
      const reference = params.get("reference");

      if (!reference || !user?.id) return;

      try {
        const res = await fetch(
          `${API}/paystack/verify.php?reference=${reference}&user_id=${user.id}`
        );
        const data = await res.json();

        if (data?.success) {
          updateUser({ 
            usdBalance: parseFloat(data.newBalance),
            usd_balance: parseFloat(data.newBalance)
          });
          setPaystackSuccess(true);
          loadHistory();
          // Clear URL params
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } catch (error) {
        console.log(error);
      }
    };

    verifyPaystack();
  }, [user?.id, updateUser]);

  const showToastMsg = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ─── CALCULATED VALUES FOR DEPOSIT ──────────────────────────────
  const depAmountParsed = parseFloat(depositAmount) || 0;
  const depositNairaTotal = depositCurrency === "USD"
    ? depAmountParsed * liveRate
    : depAmountParsed;
  const depositUsdTotal = depositCurrency === "USD"
    ? depAmountParsed
    : depAmountParsed / liveRate;

  // ─── CALCULATED VALUES FOR WITHDRAWAL ────────────────────────────
  const wdrAmountParsed = parseFloat(withdrawAmount) || 0;
  const withdrawNairaTotal = withdrawCurrency === "USD"
    ? wdrAmountParsed * liveRate
    : wdrAmountParsed;
  const withdrawUsdTotal = withdrawCurrency === "USD"
    ? wdrAmountParsed
    : wdrAmountParsed / liveRate;

  // ─── OPEN & CLOSE MODALS ─────────────────────────────────────────
  const openModal = (type) => {
    setConfirmType(type);
    
    // Generate references for confirmation display (e.g. BTX-760636)
    const randomRef = Math.floor(100000 + Math.random() * 900000);
    if (type === "deposit") {
      setDepositRef("BTX-" + randomRef);
    } else {
      setWithdrawRef("BTX-" + randomRef);
    }

    setShowConfirmModal(true);
    setTimeout(() => {
      setModalAnimate(true);
    }, 10);
  };

  const closeModal = () => {
    setModalAnimate(false);
    setTimeout(() => {
      setShowConfirmModal(false);
      setConfirmType(null);
    }, 300);
  };

  // ─── DEPOSIT SUBMIT (PRE-MODAL VALIDATION) ───────────────────────
  const initiateDeposit = () => {
    if (depAmountParsed <= 0) {
      showToastMsg("Please enter a valid amount", "error");
      return;
    }
    if (!paystackEmail || !paystackEmail.includes("@")) {
      showToastMsg("Please enter a valid email address", "error");
      return;
    }
    openModal("deposit");
  };

  // ─── PAYSTACK INITIALIZATION (ON MODAL CONFIRMATION) ──────────────
  const confirmPaystackDeposit = async () => {
    setIsSubmitting(true);
    try {
      // Pass the USD amount that converts to the desired Naira amount
      // Backend init.php calculates: $nairaAmount = $amount * PAYSTACK_BACKEND_RATE
      // So we send: nairaTotal / PAYSTACK_BACKEND_RATE to get exact NGN charge
      const usdForPaystack = depositNairaTotal / PAYSTACK_BACKEND_RATE;

      const res = await fetch(`${API}/paystack/init.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: paystackEmail,
          amount: usdForPaystack.toString()
        })
      });

      const data = await res.json();
      if (data?.status && data?.data?.authorization_url) {
        window.location.href = data.data.authorization_url;
      } else {
        showToastMsg(data?.message || "Failed to initialize payment", "error");
        closeModal();
      }
    } catch (error) {
      console.log(error);
      showToastMsg("Payment initialization failed", "error");
      closeModal();
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── WITHDRAW SUBMIT (PRE-MODAL VALIDATION) ──────────────────────
  const initiateWithdrawal = () => {
    if (wdrAmountParsed <= 0) {
      showToastMsg("Please enter a valid amount", "error");
      return;
    }
    if (withdrawUsdTotal < 3) {
      showToastMsg("Minimum withdrawal is $3", "error");
      return;
    }
    if (withdrawUsdTotal > usdBalance) {
      showToastMsg("Insufficient balance", "error");
      return;
    }
    if (!bankDetails.bankName || !bankDetails.accountName || !bankDetails.accountNumber) {
      showToastMsg("Please fill in all bank details", "error");
      return;
    }
    openModal("withdraw");
  };

  // ─── WITHDRAWAL SUBMIT (ON MODAL CONFIRMATION) ───────────────────
  const confirmWithdrawal = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API}/wallet/withdraw.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          amount: withdrawUsdTotal,
          bank_name: bankDetails.bankName,
          account_name: bankDetails.accountName,
          account_number: bankDetails.accountNumber,
        }),
      });
      const data = await res.json();
      
      if (data?.success) {
        showToastMsg(data.message, "success");
        setWithdrawAmount("");
        setBankDetails({ bankName: "", accountName: "", accountNumber: "" });
        closeModal();
        setActiveTab("history");
        // Trigger balance update
        fetch(`${API}/wallet/index.php?user_id=${user?.id}`)
          .then((r) => r.json())
          .then((d) => {
            if (d?.success && d?.wallet) {
              updateUser({
                usd_balance: parseFloat(d.wallet.usd_balance),
                usdBalance: parseFloat(d.wallet.usd_balance),
                coins: parseInt(d.wallet.coins),
              });
            }
          });
      } else {
        showToastMsg(data?.message || "Withdrawal failed", "error");
        closeModal();
      }
    } catch (error) {
      showToastMsg("Withdrawal failed", "error");
      closeModal();
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── STYLING OBJECTS ─────────────────────────────────────────────
  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: 14,
    border: `1.5px solid ${tk.cardBorder}`,
    background: darkMode ? 'rgba(255,255,255,0.04)' : '#F7F8FC',
    color: tk.text,
    WebkitTextFillColor: tk.text,
    colorScheme: darkMode ? 'dark' : 'light',
    fontSize: 14,
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s, background-color 0.2s',
  };

  const selectStyle = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: 14,
    border: `1.5px solid ${tk.cardBorder}`,
    background: darkMode ? 'rgba(255,255,255,0.06)' : '#F7F8FC',
    color: tk.text,
    WebkitTextFillColor: tk.text,
    colorScheme: darkMode ? 'dark' : 'light',
    fontSize: 14,
    outline: 'none',
    fontFamily: 'inherit',
    cursor: 'pointer',
    appearance: 'none',
    WebkitAppearance: 'none',
  };

  const backdropStyle = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.65)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    zIndex: 1000,
    opacity: modalAnimate ? 1 : 0,
    transition: 'opacity 0.25s ease-out',
    paddingTop: '60px',
    boxSizing: 'border-box',
  };

  const modalStyle = {
    background: '#ffffff',
    borderRadius: 30,
    width: '90%',
    maxWidth: 400,
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    transform: modalAnimate ? 'translateY(0)' : 'translateY(-100px)',
    opacity: modalAnimate ? 1 : 0,
    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  };

  return (
    <div style={{ background: tk.bg, minHeight: '100vh', paddingBottom: 40 }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        background: tk.bg,
        borderBottom: `1px solid ${tk.cardBorder}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {onBack && (
            <button onClick={onBack} style={{
              width: 38, height: 38, borderRadius: '50%',
              background: tk.card, border: `1.5px solid ${tk.cardBorder}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
              <ArrowLeft size={18} color={tk.text} />
            </button>
          )}
          <span style={{ fontSize: 18, fontWeight: 800, color: tk.text, letterSpacing: '-.03em' }}>Wallet</span>
        </div>
        <button onClick={() => setDarkMode(!darkMode)} style={{
          width: 38, height: 38, borderRadius: '50%',
          background: tk.card, border: `1.5px solid ${tk.cardBorder}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
          {darkMode ? <Sun size={15} color={C.orange} /> : <Moon size={15} color={C.navy} />}
        </button>
      </div>

      <div style={{ padding: '0 16px', maxWidth: 600, margin: '0 auto' }}>
        {/* Balance Card */}
        <div style={{
          margin: '20px 0',
          borderRadius: 24,
          background: 'linear-gradient(135deg, #001F54 0%, #003B8E 100%)',
          padding: '24px 20px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 12px 24px -10px rgba(0,31,84,0.4)',
        }}>
          <div style={{ position: 'absolute', top: -50, right: -50, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,111,0,0.1)' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Total Balance</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginTop: 6 }}>
                  ${usdBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </div>
              </div>
              <div style={{
                background: 'rgba(255,111,0,0.2)',
                borderRadius: 30,
                padding: '4px 14px',
                border: '1px solid rgba(255,111,0,0.3)',
              }}>
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
            { id: 'deposit', label: 'Deposit', icon: ArrowDownToLine },
            { id: 'withdraw', label: 'Withdraw', icon: ArrowUpFromLine },
            { id: 'history', label: 'History', icon: History },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '12px 0',
                borderRadius: 14,
                background: activeTab === tab.id ? C.orange : tk.card,
                border: `1.5px solid ${activeTab === tab.id ? C.orange : tk.cardBorder}`,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all 0.2s ease',
              }}
            >
              <tab.icon size={16} color={activeTab === tab.id ? '#fff' : C.orange} />
              <span style={{ fontSize: 13, fontWeight: 700, color: activeTab === tab.id ? '#fff' : tk.text }}>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* DEPOSIT TAB */}
        {activeTab === 'deposit' && (
          <div style={{ background: tk.card, borderRadius: 24, padding: 24, border: `1px solid ${tk.cardBorder}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: C.orange, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 20 }}>Paystack Deposit</div>

            {/* Currency Input Toggle */}
            <div style={{
              display: 'flex',
              background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 31, 84, 0.04)',
              borderRadius: 14,
              padding: 4,
              marginBottom: 20,
              border: `1.5px solid ${tk.cardBorder}`,
            }}>
              <button
                onClick={() => setDepositCurrency("USD")}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: 10,
                  background: depositCurrency === "USD" ? C.orange : 'transparent',
                  border: 'none',
                  color: depositCurrency === "USD" ? '#fff' : tk.text,
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                USD ($)
              </button>
              <button
                onClick={() => setDepositCurrency("NGN")}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: 10,
                  background: depositCurrency === "NGN" ? C.orange : 'transparent',
                  border: 'none',
                  color: depositCurrency === "NGN" ? '#fff' : tk.text,
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                NGN (₦)
              </button>
            </div>

            {/* Amount Input */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: tk.text, marginBottom: 8, display: 'block' }}>
                Amount to Deposit ({depositCurrency})
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: 15,
                  fontWeight: 700,
                  color: tk.text,
                  opacity: 0.6,
                }}>
                  {depositCurrency === "USD" ? "$" : "₦"}
                </span>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={e => setDepositAmount(e.target.value)}
                  placeholder="0.00"
                  style={{
                    ...inputStyle,
                    paddingLeft: 34,
                    fontSize: 15,
                    fontWeight: 700,
                  }}
                />
              </div>
            </div>

            {/* Conversion Preview */}
            {depAmountParsed > 0 && (
              <div style={{
                background: darkMode ? 'rgba(255, 255, 255, 0.03)' : '#F7F8FC',
                borderRadius: 14,
                padding: '12px 16px',
                border: `1.5px solid ${tk.cardBorder}`,
                fontSize: 13,
                fontWeight: 600,
                color: tk.text,
                marginBottom: 20,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span style={{ opacity: 0.7 }}>Converted Equivalent:</span>
                <span style={{ fontWeight: 800, color: C.orange }}>
                  {depositCurrency === "USD"
                    ? `₦${(depAmountParsed * liveRate).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
                    : `$${(depAmountParsed / liveRate).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
                </span>
              </div>
            )}

            {/* Paystack Email */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: tk.text, marginBottom: 8, display: 'block' }}>Email Address</label>
              <input
                type="email"
                value={paystackEmail}
                onChange={e => setPaystackEmail(e.target.value)}
                placeholder="your@email.com"
                style={inputStyle}
              />
            </div>

            {paystackSuccess && (
              <div style={{
                marginBottom: 16,
                padding: 12,
                borderRadius: 14,
                background: 'rgba(16,185,129,0.12)',
                textAlign: 'center',
                color: '#10b981',
                fontSize: 13,
                fontWeight: 700,
              }}>
                ✓ Deposit successful! Your wallet balance has been updated.
              </div>
            )}

            <button
              onClick={initiateDeposit}
              style={{
                width: '100%',
                padding: 14,
                borderRadius: 14,
                background: C.orange,
                color: '#fff',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 4px 14px rgba(255,111,0,0.3)',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <Send size={16} /> Proceed to Deposit
            </button>
          </div>
        )}

        {/* WITHDRAW TAB */}
        {activeTab === 'withdraw' && (
          <div style={{ background: tk.card, borderRadius: 24, padding: 24, border: `1px solid ${tk.cardBorder}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: C.orange, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 20 }}>Withdraw Funds</div>

            {/* Currency Input Toggle */}
            <div style={{
              display: 'flex',
              background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 31, 84, 0.04)',
              borderRadius: 14,
              padding: 4,
              marginBottom: 20,
              border: `1.5px solid ${tk.cardBorder}`,
            }}>
              <button
                onClick={() => setWithdrawCurrency("USD")}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: 10,
                  background: withdrawCurrency === "USD" ? C.orange : 'transparent',
                  border: 'none',
                  color: withdrawCurrency === "USD" ? '#fff' : tk.text,
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                USD ($)
              </button>
              <button
                onClick={() => setWithdrawCurrency("NGN")}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: 10,
                  background: withdrawCurrency === "NGN" ? C.orange : 'transparent',
                  border: 'none',
                  color: withdrawCurrency === "NGN" ? '#fff' : tk.text,
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                NGN (₦)
              </button>
            </div>

            {/* Amount Input */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: tk.text, marginBottom: 8, display: 'block' }}>
                Amount to Withdraw ({withdrawCurrency})
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: 15,
                  fontWeight: 700,
                  color: tk.text,
                  opacity: 0.6,
                }}>
                  {withdrawCurrency === "USD" ? "$" : "₦"}
                </span>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={e => setWithdrawAmount(e.target.value)}
                  placeholder="0.00"
                  style={{
                    ...inputStyle,
                    paddingLeft: 34,
                    fontSize: 15,
                    fontWeight: 700,
                  }}
                />
              </div>
            </div>

            {/* Conversion Preview */}
            {wdrAmountParsed > 0 && (
              <div style={{
                background: darkMode ? 'rgba(255, 255, 255, 0.03)' : '#F7F8FC',
                borderRadius: 14,
                padding: '12px 16px',
                border: `1.5px solid ${tk.cardBorder}`,
                fontSize: 13,
                fontWeight: 600,
                color: tk.text,
                marginBottom: 20,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span style={{ opacity: 0.7 }}>Converted Equivalent:</span>
                <span style={{ fontWeight: 800, color: C.orange }}>
                  {withdrawCurrency === "USD"
                    ? `₦${(wdrAmountParsed * liveRate).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
                    : `$${(wdrAmountParsed / liveRate).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
                </span>
              </div>
            )}

            {/* Bank Fields */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: tk.text, marginBottom: 8, display: 'block' }}>Bank Name</label>
              <div style={{ position: 'relative' }}>
                <select
                  value={bankDetails.bankName}
                  onChange={e => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                  style={selectStyle}
                >
                  <option value="">Select Bank</option>
                  <option value="Access Bank">Access Bank</option>
                  <option value="First Bank">First Bank</option>
                  <option value="GTBank">GTBank</option>
                  <option value="UBA">UBA</option>
                  <option value="Zenith Bank">Zenith Bank</option>
                  <option value="Kuda Bank">Kuda Bank</option>
                  <option value="Moniepoint">Moniepoint</option>
                  <option value="Opay">Opay</option>
                  <option value="Palmpay">Palmpay</option>
                </select>
                <div style={{
                  position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
                  pointerEvents: 'none', color: tk.text, opacity: 0.5, fontSize: 10
                }}>▼</div>
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: tk.text, marginBottom: 8, display: 'block' }}>Account Name</label>
              <input
                type="text"
                value={bankDetails.accountName}
                onChange={e => setBankDetails({ ...bankDetails, accountName: e.target.value })}
                placeholder="Your bank account name"
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: tk.text, marginBottom: 8, display: 'block' }}>Account Number</label>
              <input
                type="text"
                value={bankDetails.accountNumber}
                onChange={e => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                placeholder="10-digit account number"
                maxLength="10"
                style={inputStyle}
              />
            </div>

            <button
              onClick={initiateWithdrawal}
              style={{
                width: '100%',
                padding: 14,
                borderRadius: 14,
                background: C.orange,
                color: '#fff',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 4px 14px rgba(255,111,0,0.3)',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <Send size={16} /> Request Withdrawal
            </button>
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <div style={{ background: tk.card, borderRadius: 24, overflow: 'hidden', border: `1px solid ${tk.cardBorder}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <div style={{ padding: '20px', borderBottom: `1px solid ${tk.cardBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: tk.text }}>Transaction History</span>
              {loadingHistory && <span style={{ fontSize: 11, color: C.orange, fontWeight: 700 }}>Syncing...</span>}
            </div>
            
            {loadingHistory && transactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: tk.textMuted }}>
                <p style={{ fontSize: 13 }}>Loading transactions...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: tk.textMuted }}>
                <WalletIcon size={32} color={tk.textMuted} style={{ marginBottom: 8, opacity: 0.4 }} />
                <p style={{ fontSize: 13, fontWeight: 600 }}>No transactions found</p>
              </div>
            ) : (
              Array.isArray(transactions) && transactions.map((tx, index) => (
                <div 
                  key={tx.id} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '16px 20px',
                    borderBottom: index < transactions.length - 1 ? `1px solid ${tk.cardBorder}` : 'none',
                    background: darkMode ? 'rgba(255,255,255,0.01)' : 'transparent',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: tx.type === 'withdrawal' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {tx.type === 'withdrawal' && <ArrowUpFromLine size={18} color="#ef4444" />}
                      {tx.type === 'deposit' && <ArrowDownToLine size={18} color="#10B981" />}
                      {tx.type === 'task' && <Check size={18} color={C.orange} />}
                      {tx.type === 'referral' && <Users size={18} color={C.orange} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: tk.text,
                        textTransform: 'capitalize'
                      }}>
                        {tx.type}
                      </div>
                      {tx.reference && (
                        <div style={{
                          fontSize: 10,
                          color: tk.textMuted,
                          marginTop: 2,
                          fontFamily: 'monospace',
                        }}>
                          Ref: {tx.reference}
                        </div>
                      )}
                      <div style={{
                        fontSize: 11,
                        color: tk.textMuted,
                        marginTop: 2,
                      }}>
                        {tx.created_at ? new Date(tx.created_at).toLocaleString() : ''}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 16 }}>
                    <div style={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: tx.type === 'withdrawal' ? '#EF4444' : '#10B981'
                    }}>
                      {tx.type === 'withdrawal'
                        ? `-$${parseFloat(tx.amount).toFixed(2)}`
                        : `+$${parseFloat(tx.amount).toFixed(2)}`
                      }
                    </div>
                    {tx.status && (
                      <div style={{
                        fontSize: 10,
                        marginTop: 4,
                        color: tx.status === 'pending' ? '#F59E0B' :
                               tx.status === 'completed' ? '#10B981' :
                               '#EF4444',
                        fontWeight: 700,
                      }}>
                        {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* CONFIRMATION SLIDE-DOWN MODAL */}
      {showConfirmModal && confirmType === 'deposit' && (
        <div className="wallet-modal-overlay" style={backdropStyle} onClick={closeModal}>
          <div className="wallet-modal" style={modalStyle} onClick={e => e.stopPropagation()}>
            <div className="wallet-modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #F1F5F9', position: 'sticky', top: 0, background: '#fff', zIndex: 10 }}>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', color: '#64748B', fontWeight: 650, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>Back</button>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#001F54', margin: 0 }}>Wallet Funding</h3>
              <button onClick={() => setDarkMode(!darkMode)} style={{ background: 'none', border: 'none', color: '#64748B', fontWeight: 650, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>Theme</button>
            </div>

            <div className="wallet-summary-card" style={{ background: '#F1F5F9', borderRadius: 22, padding: 24, margin: '20px 24px 16px', textAlign: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>Amount to Pay</span>
              <h1 style={{ fontSize: 32, fontWeight: 900, color: '#001F54', margin: '8px 0', letterSpacing: '-0.02em' }}>₦{depositNairaTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h1>
              <small style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500, display: 'block' }}>Live Rate: ₦{liveRate.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} / $1</small>
            </div>

            <div className="wallet-details-card" style={{ background: '#fff', border: '1.5px solid #F1F5F9', borderRadius: 20, padding: '20px 20px 8px', margin: '0 24px 24px' }}>
              <h4 style={{ fontSize: 11, fontWeight: 800, color: '#FF6F00', letterSpacing: '0.08em', margin: '0 0 16px', textTransform: 'uppercase' }}>PAYMENT SUMMARY</h4>

              <div className="row" style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid #F1F5F9', marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: '#64748B', fontWeight: 550 }}>Payment Method</span>
                <strong style={{ fontSize: 13, fontWeight: 750, color: '#001F54' }}>Paystack</strong>
              </div>

              <div className="row" style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid #F1F5F9', marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: '#64748B', fontWeight: 550 }}>USD Amount</span>
                <strong style={{ fontSize: 13, fontWeight: 750, color: '#001F54' }}>${depositUsdTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong>
              </div>

              <div className="row" style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid #F1F5F9', marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: '#64748B', fontWeight: 550 }}>NGN Amount</span>
                <strong style={{ fontSize: 13, fontWeight: 750, color: '#001F54' }}>₦{depositNairaTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong>
              </div>

              <div className="row" style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid #F1F5F9', marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: '#64748B', fontWeight: 550 }}>Market Rate</span>
                <strong style={{ fontSize: 13, fontWeight: 750, color: '#001F54' }}>₦{liveRate.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong>
              </div>

              <div className="row" style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid #F1F5F9', marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: '#64748B', fontWeight: 550 }}>Transaction Fee</span>
                <strong style={{ fontSize: 13, fontWeight: 750, color: '#10B981' }}>₦0.00</strong>
              </div>

              <div className="row" style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 12 }}>
                <span style={{ fontSize: 13, color: '#64748B', fontWeight: 550 }}>Reference</span>
                <strong style={{ fontSize: 13, fontWeight: 750, color: '#001F54', fontFamily: 'monospace' }}>{depositRef}</strong>
              </div>
            </div>

            <div style={{ padding: '0 24px 24px' }}>
              <button className="wallet-cta" onClick={confirmPaystackDeposit} disabled={isSubmitting} style={{
                width: '100%', height: 56, borderRadius: 18, background: '#FF6F00', color: '#fff', border: 'none',
                fontWeight: 800, fontSize: 15, cursor: isSubmitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 8px 24px rgba(255,111,0,0.25)', transition: 'all 0.2s', opacity: isSubmitting ? 0.7 : 1,
                fontFamily: 'inherit'
              }}>
                {isSubmitting ? 'Processing...' : 'Continue to Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirmModal && confirmType === 'withdraw' && (
        <div className="wallet-modal-overlay" style={backdropStyle} onClick={closeModal}>
          <div className="wallet-modal" style={modalStyle} onClick={e => e.stopPropagation()}>
            <div className="wallet-modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #F1F5F9', position: 'sticky', top: 0, background: '#fff', zIndex: 10 }}>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', color: '#64748B', fontWeight: 650, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>Back</button>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#001F54', margin: 0 }}>Wallet Withdrawal</h3>
              <button onClick={() => setDarkMode(!darkMode)} style={{ background: 'none', border: 'none', color: '#64748B', fontWeight: 650, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>Theme</button>
            </div>

            <div className="wallet-summary-card" style={{ background: '#F1F5F9', borderRadius: 22, padding: 24, margin: '20px 24px 16px', textAlign: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>Amount to Receive</span>
              <h1 style={{ fontSize: 32, fontWeight: 900, color: '#001F54', margin: '8px 0', letterSpacing: '-0.02em' }}>₦{withdrawNairaTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h1>
              <small style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500, display: 'block' }}>Live Rate: ₦{liveRate.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} / $1</small>
            </div>

            <div className="wallet-details-card" style={{ background: '#fff', border: '1.5px solid #F1F5F9', borderRadius: 20, padding: '20px 20px 8px', margin: '0 24px 24px' }}>
              <h4 style={{ fontSize: 11, fontWeight: 800, color: '#FF6F00', letterSpacing: '0.08em', margin: '0 0 16px', textTransform: 'uppercase' }}>WITHDRAWAL SUMMARY</h4>

              <div className="row" style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid #F1F5F9', marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: '#64748B', fontWeight: 550 }}>USD Amount</span>
                <strong style={{ fontSize: 13, fontWeight: 750, color: '#001F54' }}>${withdrawUsdTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong>
              </div>

              <div className="row" style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid #F1F5F9', marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: '#64748B', fontWeight: 550 }}>NGN Amount</span>
                <strong style={{ fontSize: 13, fontWeight: 750, color: '#001F54' }}>₦{withdrawNairaTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong>
              </div>

              <div className="row" style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid #F1F5F9', marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: '#64748B', fontWeight: 550 }}>Market Rate</span>
                <strong style={{ fontSize: 13, fontWeight: 750, color: '#001F54' }}>₦{liveRate.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong>
              </div>

              <div className="row" style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid #F1F5F9', marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: '#64748B', fontWeight: 550 }}>Wallet Balance</span>
                <strong style={{ fontSize: 13, fontWeight: 750, color: '#001F54' }}>${usdBalance.toFixed(2)}</strong>
              </div>

              <div className="row" style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid #F1F5F9', marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: '#64748B', fontWeight: 550 }}>Transaction Fee</span>
                <strong style={{ fontSize: 13, fontWeight: 750, color: '#10B981' }}>₦0.00</strong>
              </div>

              <div className="row" style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 12 }}>
                <span style={{ fontSize: 13, color: '#64748B', fontWeight: 550 }}>Reference</span>
                <strong style={{ fontSize: 13, fontWeight: 750, color: '#001F54', fontFamily: 'monospace' }}>{withdrawRef}</strong>
              </div>
            </div>

            <div style={{ padding: '0 24px 24px' }}>
              <button className="wallet-cta" onClick={confirmWithdrawal} disabled={isSubmitting} style={{
                width: '100%', height: 56, borderRadius: 18, background: '#FF6F00', color: '#fff', border: 'none',
                fontWeight: 800, fontSize: 15, cursor: isSubmitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 8px 24px rgba(255,111,0,0.25)', transition: 'all 0.2s', opacity: isSubmitting ? 0.7 : 1,
                fontFamily: 'inherit'
              }}>
                {isSubmitting ? 'Processing...' : 'Confirm Withdrawal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: 30,
          left: '50%',
          transform: 'translateX(-50%)',
          background: toast.type === 'error' ? '#EF4444' : C.orange,
          color: '#fff',
          padding: '12px 24px',
          borderRadius: 50,
          fontSize: 13,
          fontWeight: 700,
          zIndex: 9999,
          boxShadow: `0 8px 24px ${toast.type === 'error' ? 'rgba(239,68,68,0.35)' : 'rgba(255,111,0,0.35)'}`,
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}