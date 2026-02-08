"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "./AuthProvider";
import { savePlannerData, loadPlannerData, deletePlannerData } from "@/lib/planner-data";

// ─── Default Data ──────────────────────────────────────────────
const DEFAULT_BUDGET_CATEGORIES = [
  { id: "b1", name: "Venue & Rentals", percent: 30, icon: "🏛️", spent: 0, isDefault: true },
  { id: "b2", name: "Catering & Bar", percent: 25, icon: "🍽️", spent: 0, isDefault: true },
  { id: "b3", name: "Photography & Video", percent: 12, icon: "📸", spent: 0, isDefault: true },
  { id: "b4", name: "Flowers & Decor", percent: 8, icon: "💐", spent: 0, isDefault: true },
  { id: "b5", name: "Music & Entertainment", percent: 5, icon: "🎵", spent: 0, isDefault: true },
  { id: "b6", name: "Attire & Beauty", percent: 7, icon: "👗", spent: 0, isDefault: true },
  { id: "b7", name: "Invitations & Paper", percent: 3, icon: "💌", spent: 0, isDefault: true },
  { id: "b8", name: "Officiant & License", percent: 2, icon: "📜", spent: 0, isDefault: true },
  { id: "b9", name: "Transportation", percent: 3, icon: "🚗", spent: 0, isDefault: true },
  { id: "b10", name: "Contingency Fund", percent: 5, icon: "🛟", spent: 0, isDefault: true },
];

const DEFAULT_TIMELINE = [
  {
    id: "p1",
    phase: "Right Now (5-6 Months Out)",
    color: "#c0705b",
    isDefault: true,
    tasks: [
      { id: "t1", text: "Set overall budget & priorities", done: false },
      { id: "t2", text: "Create guest list (aim for final count)", done: false },
      { id: "t3", text: "Book venue", done: false },
      { id: "t4", text: "Book officiant", done: false },
      { id: "t5", text: "Book photographer & videographer", done: false },
      { id: "t6", text: "Book caterer / plan menu", done: false },
      { id: "t7", text: "Choose wedding party", done: false },
    ],
  },
  {
    id: "p2",
    phase: "3-4 Months Out",
    color: "#c99a6b",
    isDefault: true,
    tasks: [
      { id: "t8", text: "Send Save-the-Dates", done: false },
      { id: "t9", text: "Book DJ / musician / entertainment", done: false },
      { id: "t10", text: "Order wedding attire & begin alterations", done: false },
      { id: "t11", text: "Book florist & plan arrangements", done: false },
      { id: "t12", text: "Plan ceremony details & vows", done: false },
      { id: "t13", text: "Arrange transportation", done: false },
      { id: "t14", text: "Book hotel room block for guests", done: false },
    ],
  },
  {
    id: "p3",
    phase: "6-8 Weeks Out",
    color: "#b5a36b",
    isDefault: true,
    tasks: [
      { id: "t15", text: "Send formal invitations", done: false },
      { id: "t16", text: "Order wedding cake / desserts", done: false },
      { id: "t17", text: "Plan rehearsal dinner", done: false },
      { id: "t18", text: "Purchase wedding bands", done: false },
      { id: "t19", text: "Apply for marriage license", done: false },
      { id: "t20", text: "Create day-of timeline for vendors", done: false },
    ],
  },
  {
    id: "p4",
    phase: "2-4 Weeks Out",
    color: "#7da07d",
    isDefault: true,
    tasks: [
      { id: "t21", text: "Confirm all vendor details & final payments", done: false },
      { id: "t22", text: "Final dress/suit fitting", done: false },
      { id: "t23", text: "Finalize seating chart", done: false },
      { id: "t24", text: "Prepare welcome bags", done: false },
      { id: "t25", text: "Write toasts / personal vows", done: false },
    ],
  },
  {
    id: "p5",
    phase: "Final Week",
    color: "#6b8ea0",
    isDefault: true,
    tasks: [
      { id: "t26", text: "Wedding rehearsal & rehearsal dinner", done: false },
      { id: "t27", text: "Delegate day-of tasks to wedding party", done: false },
      { id: "t28", text: "Pack for honeymoon", done: false },
      { id: "t29", text: "Confirm final guest count with caterer", done: false },
      { id: "t30", text: "Relax & enjoy - you've got this! ✨", done: false },
    ],
  },
];

const DEFAULT_GUESTS = [
  { id: "g1", name: "Family (Side A)", count: 0 },
  { id: "g2", name: "Family (Side B)", count: 0 },
  { id: "g3", name: "Friends", count: 0 },
  { id: "g4", name: "Work / Community", count: 0 },
  { id: "g5", name: "Church / Ministry", count: 0 },
  { id: "g6", name: "Plus-Ones & Kids", count: 0 },
];

const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

// ─── Modal Component ───────────────────────────────────────────
function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(40,30,22,0.55)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#faf5ef",
          borderRadius: "20px 20px 0 0",
          width: "100%",
          maxWidth: "500px",
          maxHeight: "80vh",
          padding: "24px 20px 32px",
          overflowY: "auto",
          animation: "slideUp 0.3s ease",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "4px",
            background: "#d4c8ba",
            borderRadius: "4px",
            margin: "0 auto 16px",
          }}
        />
        <h3
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "22px",
            fontWeight: 600,
            color: "#3d2e1f",
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          {title}
        </h3>
        {children}
      </div>
    </div>
  );
}

// ─── Main App ──────────────────────────────────────────────────
export default function WeddingPlanner() {
  const { user, signOut } = useAuth();

  const [loaded, setLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [weddingDate, setWeddingDate] = useState("");
  const [partnerNames, setPartnerNames] = useState("");
  const [totalBudget, setTotalBudget] = useState(17500);
  const [budgetCategories, setBudgetCategories] = useState(
    DEFAULT_BUDGET_CATEGORIES
  );
  const [timeline, setTimeline] = useState(DEFAULT_TIMELINE);
  const [guests, setGuests] = useState(DEFAULT_GUESTS);
  const [notes, setNotes] = useState("");

  // Modals
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddPhase, setShowAddPhase] = useState(false);
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [showAddGuest, setShowAddGuest] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState("");
  const [newTaskText, setNewTaskText] = useState("");
  const [newPhaseName, setNewPhaseName] = useState("");
  const [newBudgetName, setNewBudgetName] = useState("");
  const [newBudgetIcon, setNewBudgetIcon] = useState("📋");
  const [newBudgetAlloc, setNewBudgetAlloc] = useState("");
  const [newGuestName, setNewGuestName] = useState("");
  const [showSaved, setShowSaved] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const saveTimeout = useRef(null);

  // Load on mount
  useEffect(() => {
    (async () => {
      const data = await loadPlannerData();
      if (data) {
        if (data.weddingDate) setWeddingDate(data.weddingDate);
        if (data.partnerNames) setPartnerNames(data.partnerNames);
        if (data.totalBudget) setTotalBudget(data.totalBudget);
        if (data.budgetCategories) setBudgetCategories(data.budgetCategories);
        if (data.timeline) setTimeline(data.timeline);
        if (data.guests) setGuests(data.guests);
        if (data.notes !== undefined) setNotes(data.notes);
      }
      setLoaded(true);
    })();
  }, []);

  // Build the data object for saving
  const buildSavePayload = useCallback(
    () => ({
      weddingDate,
      partnerNames,
      totalBudget,
      budgetCategories,
      timeline,
      guests,
      notes,
    }),
    [weddingDate, partnerNames, totalBudget, budgetCategories, timeline, guests, notes]
  );

  // Auto-save with debounce
  useEffect(() => {
    if (!loaded) return;
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      const result = await savePlannerData(buildSavePayload());
      if (result.success) {
        setSaveError(false);
        setShowSaved(true);
        setTimeout(() => setShowSaved(false), 1500);
      } else {
        setSaveError(true);
        setTimeout(() => setSaveError(false), 3000);
      }
    }, 1200);
    return () => clearTimeout(saveTimeout.current);
  }, [buildSavePayload, loaded]);

  // Calculations
  const totalSpent = budgetCategories.reduce((a, c) => a + (c.spent || 0), 0);
  const totalTasks = timeline.reduce((a, p) => a + p.tasks.length, 0);
  const completedTasks = timeline.reduce(
    (a, p) => a + p.tasks.filter((t) => t.done).length,
    0
  );
  const totalGuests = guests.reduce((a, g) => a + g.count, 0);
  const progress =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const daysUntil = weddingDate
    ? Math.max(
      0,
      Math.ceil(
        (new Date(weddingDate + "T00:00:00") - new Date()) / 86400000
      )
    )
    : null;

  // Handlers
  const toggleTask = (phaseId, taskId) => {
    setTimeline((prev) =>
      prev.map((p) =>
        p.id === phaseId
          ? {
            ...p,
            tasks: p.tasks.map((t) =>
              t.id === taskId ? { ...t, done: !t.done } : t
            ),
          }
          : p
      )
    );
  };

  const deleteTask = (phaseId, taskId) => {
    setTimeline((prev) =>
      prev.map((p) =>
        p.id === phaseId
          ? { ...p, tasks: p.tasks.filter((t) => t.id !== taskId) }
          : p
      )
    );
  };

  const addTask = () => {
    if (!newTaskText.trim() || !selectedPhase) return;
    setTimeline((prev) =>
      prev.map((p) =>
        p.id === selectedPhase
          ? {
            ...p,
            tasks: [
              ...p.tasks,
              { id: uid(), text: newTaskText.trim(), done: false },
            ],
          }
          : p
      )
    );
    setNewTaskText("");
    setShowAddTask(false);
  };

  const addPhase = () => {
    if (!newPhaseName.trim()) return;
    const colors = [
      "#c0705b",
      "#c99a6b",
      "#b5a36b",
      "#7da07d",
      "#6b8ea0",
      "#9b7db5",
      "#b57d8e",
    ];
    setTimeline((prev) => [
      ...prev,
      {
        id: uid(),
        phase: newPhaseName.trim(),
        color: colors[prev.length % colors.length],
        isDefault: false,
        tasks: [],
      },
    ]);
    setNewPhaseName("");
    setShowAddPhase(false);
  };

  const deletePhase = (phaseId) => {
    setTimeline((prev) => prev.filter((p) => p.id !== phaseId));
  };

  const addBudgetCategory = () => {
    if (!newBudgetName.trim()) return;
    setBudgetCategories((prev) => [
      ...prev,
      {
        id: uid(),
        name: newBudgetName.trim(),
        icon: newBudgetIcon,
        percent: Number(newBudgetAlloc) || 0,
        spent: 0,
        isDefault: false,
      },
    ]);
    setNewBudgetName("");
    setNewBudgetIcon("📋");
    setNewBudgetAlloc("");
    setShowAddBudget(false);
  };

  const deleteBudgetCategory = (catId) => {
    setBudgetCategories((prev) => prev.filter((c) => c.id !== catId));
  };

  const updateBudgetSpent = (catId, value) => {
    setBudgetCategories((prev) =>
      prev.map((c) =>
        c.id === catId ? { ...c, spent: Number(value) || 0 } : c
      )
    );
  };

  const addGuestCategory = () => {
    if (!newGuestName.trim()) return;
    setGuests((prev) => [
      ...prev,
      { id: uid(), name: newGuestName.trim(), count: 0 },
    ]);
    setNewGuestName("");
    setShowAddGuest(false);
  };

  const deleteGuestCategory = (gId) => {
    setGuests((prev) => prev.filter((g) => g.id !== gId));
  };

  const updateGuestCount = (gId, delta) => {
    setGuests((prev) =>
      prev.map((g) =>
        g.id === gId ? { ...g, count: Math.max(0, g.count + delta) } : g
      )
    );
  };

  const resetAll = async () => {
    await deletePlannerData();
    setWeddingDate("");
    setPartnerNames("");
    setTotalBudget(17500);
    setBudgetCategories(DEFAULT_BUDGET_CATEGORIES);
    setTimeline(DEFAULT_TIMELINE);
    setGuests(DEFAULT_GUESTS);
    setNotes("");
    setShowSettings(false);
  };

  const tabs = [
    { id: "overview", label: "Home", icon: "◈" },
    { id: "timeline", label: "Tasks", icon: "◇" },
    { id: "budget", label: "Budget", icon: "◆" },
    { id: "guests", label: "Guests", icon: "◉" },
  ];

  // ─── Shared Styles ────────────────────────────────────────────
  const card = {
    background: "#fff",
    borderRadius: "14px",
    padding: "20px",
    marginBottom: "14px",
    boxShadow: "0 1px 8px rgba(60,45,30,0.05)",
  };
  const sectionLabel = {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "10px",
    letterSpacing: "2.5px",
    textTransform: "uppercase",
    color: "#a0917f",
    marginBottom: "12px",
    fontWeight: 500,
  };
  const btnPrimary = {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "14px",
    fontWeight: 600,
    padding: "12px 24px",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    background: "#4a3728",
    color: "#faf5ef",
    width: "100%",
    marginTop: "8px",
  };
  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    border: "1px solid rgba(140,110,85,0.15)",
    borderRadius: "10px",
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: "16px",
    color: "#3d2e1f",
    background: "#fdf8f2",
    outline: "none",
    boxSizing: "border-box",
    marginBottom: "12px",
  };
  const addBtnStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    padding: "12px",
    borderRadius: "12px",
    border: "2px dashed rgba(140,110,85,0.2)",
    background: "transparent",
    color: "#a0917f",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "13px",
    fontWeight: 500,
    cursor: "pointer",
    width: "100%",
    marginTop: "8px",
    letterSpacing: "0.5px",
  };

  if (!loaded) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#faf5ef",
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "18px",
          color: "#a0917f",
        }}
      >
        Loading your plans...
      </div>
    );
  }

  return (
    <div
      style={{
        fontFamily: "'Cormorant Garamond', serif",
        background: "#f5f0e8",
        minHeight: "100vh",
        color: "#3d2e1f",
        paddingBottom: "80px",
      }}
    >
      <style>{`
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes savedPulse { 0%,100% { opacity: 0; transform: translateY(4px); } 20%,80% { opacity: 1; transform: translateY(0); } }
        * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
        input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; }
        input[type="number"] { -moz-appearance: textfield; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(140,110,85,0.2); border-radius: 4px; }
      `}</style>

      {/* Saved / Error Indicator */}
      {showSaved && (
        <div
          style={{
            position: "fixed",
            top: "12px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 999,
            background: "#4a3728",
            color: "#faf5ef",
            padding: "6px 16px",
            borderRadius: "20px",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "12px",
            fontWeight: 500,
            animation: "savedPulse 1.5s ease",
            boxShadow: "0 4px 16px rgba(40,30,20,0.2)",
          }}
        >
          ✓ Saved
        </div>
      )}
      {saveError && (
        <div
          style={{
            position: "fixed",
            top: "12px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 999,
            background: "#c0705b",
            color: "#faf5ef",
            padding: "6px 16px",
            borderRadius: "20px",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "12px",
            fontWeight: 500,
            boxShadow: "0 4px 16px rgba(40,30,20,0.2)",
          }}
        >
          ⚠ Save failed, will retry
        </div>
      )}

      {/* ─── Header ──────────────────────────────────────────── */}
      <div
        style={{
          background:
            "linear-gradient(155deg, #4a3728 0%, #6b5443 50%, #8a7261 100%)",
          padding: "28px 20px 24px",
          textAlign: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at 30% 20%, rgba(255,220,180,0.08) 0%, transparent 60%)",
          }}
        />
        <button
          onClick={() => setShowSettings(true)}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "rgba(255,245,230,0.12)",
            border: "none",
            borderRadius: "50%",
            width: "34px",
            height: "34px",
            color: "rgba(255,245,230,0.7)",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          ⚙
        </button>

        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "10px",
            letterSpacing: "3px",
            textTransform: "uppercase",
            color: "rgba(255,245,230,0.5)",
            marginBottom: "6px",
          }}
        >
          Celebration Planner
        </p>
        <h1
          style={{
            fontSize: partnerNames ? "28px" : "32px",
            fontWeight: 300,
            color: "#faf5ef",
            margin: "0 0 4px",
            letterSpacing: "0.5px",
          }}
        >
          {partnerNames || "Your Wedding"}
        </h1>
        {daysUntil !== null ? (
          <p
            style={{
              color: "rgba(255,245,230,0.7)",
              fontSize: "15px",
              fontWeight: 300,
            }}
          >
            {daysUntil === 0 ? "Today's the day! 🎉" : `${daysUntil} days to go`}
          </p>
        ) : (
          <p
            style={{
              color: "rgba(255,245,230,0.45)",
              fontSize: "13px",
              fontWeight: 300,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Set your date in settings ⚙
          </p>
        )}

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "8px",
            marginTop: "18px",
          }}
        >
          {[
            { label: "Progress", value: `${progress}%` },
            { label: "Spent", value: `$${(totalSpent / 1000).toFixed(1)}k` },
            { label: "Guests", value: totalGuests || "0" },
            { label: "Done", value: `${completedTasks}/${totalTasks}` },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: "rgba(255,245,230,0.07)",
                borderRadius: "10px",
                padding: "10px 4px",
              }}
            >
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: 600,
                  color: "#faf5ef",
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "9px",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  color: "rgba(255,245,230,0.45)",
                  marginTop: "2px",
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Tab Navigation ──────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "2px",
          padding: "10px 12px",
          background: "rgba(250,245,239,0.9)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(140,110,85,0.08)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "11px",
              letterSpacing: "1px",
              textTransform: "uppercase",
              padding: "8px 16px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.25s ease",
              background: activeTab === tab.id ? "#4a3728" : "transparent",
              color: activeTab === tab.id ? "#faf5ef" : "#a0917f",
              fontWeight: activeTab === tab.id ? 600 : 400,
            }}
          >
            <span style={{ marginRight: "4px", fontSize: "10px" }}>
              {tab.icon}
            </span>{" "}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Content ─────────────────────────────────────────── */}
      <div
        style={{ maxWidth: "560px", margin: "0 auto", padding: "18px 14px 0" }}
      >
        {/* ═══ OVERVIEW ═══ */}
        {activeTab === "overview" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            {/* Progress */}
            <div style={card}>
              <p style={sectionLabel}>Overall Progress</p>
              <div
                style={{
                  height: "8px",
                  background: "#efe8dc",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${progress}%`,
                    background: "linear-gradient(90deg, #4a3728, #a08872)",
                    borderRadius: "8px",
                    transition: "width 0.5s ease",
                  }}
                />
              </div>
              <p
                style={{
                  fontSize: "13px",
                  color: "#a0917f",
                  marginTop: "6px",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {completedTasks} of {totalTasks} tasks complete
              </p>
            </div>

            {/* Budget Overview */}
            <div style={card}>
              <p style={sectionLabel}>Budget Snapshot</p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <span style={{ fontSize: "26px", fontWeight: 600 }}>
                  ${totalSpent.toLocaleString()}
                </span>
                <span
                  style={{
                    fontSize: "14px",
                    color: "#a0917f",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  of ${totalBudget.toLocaleString()}
                </span>
              </div>
              <div
                style={{
                  height: "6px",
                  background: "#efe8dc",
                  borderRadius: "6px",
                  overflow: "hidden",
                  marginTop: "10px",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${Math.min(100, (totalSpent / totalBudget) * 100)}%`,
                    background:
                      totalSpent > totalBudget
                        ? "#c0705b"
                        : "linear-gradient(90deg, #4a3728, #a08872)",
                    borderRadius: "6px",
                    transition: "width 0.5s",
                  }}
                />
              </div>
              {totalSpent > totalBudget && (
                <p
                  style={{
                    fontSize: "12px",
                    color: "#c0705b",
                    marginTop: "6px",
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 600,
                  }}
                >
                  ⚠ Over budget by ${(totalSpent - totalBudget).toLocaleString()}
                </p>
              )}
            </div>

            {/* Next Tasks */}
            <div style={card}>
              <p style={sectionLabel}>Next Up</p>
              {timeline
                .flatMap((p) =>
                  p.tasks
                    .filter((t) => !t.done)
                    .map((t) => ({ ...t, phaseId: p.id }))
                )
                .slice(0, 5)
                .map((t) => (
                  <div
                    key={t.id}
                    style={{
                      padding: "10px 0",
                      borderBottom: "1px solid rgba(140,110,85,0.06)",
                      fontSize: "15px",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={false}
                      onChange={() => toggleTask(t.phaseId, t.id)}
                      style={{
                        width: "17px",
                        height: "17px",
                        accentColor: "#4a3728",
                        cursor: "pointer",
                        flexShrink: 0,
                      }}
                    />
                    {t.text}
                  </div>
                ))}
              {completedTasks === totalTasks && totalTasks > 0 && (
                <p
                  style={{
                    textAlign: "center",
                    fontSize: "16px",
                    padding: "16px 0",
                    color: "#7da07d",
                  }}
                >
                  ✨ All tasks complete - you're ready!
                </p>
              )}
            </div>

            {/* Notes */}
            <div style={card}>
              <p style={sectionLabel}>Quick Notes</p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Vendor contacts, color palette, song ideas, vow drafts..."
                style={{
                  ...inputStyle,
                  minHeight: "100px",
                  resize: "vertical",
                  marginBottom: 0,
                  lineHeight: "1.6",
                }}
              />
            </div>
          </div>
        )}

        {/* ═══ TIMELINE ═══ */}
        {activeTab === "timeline" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            {timeline.map((phase) => {
              const phaseDone = phase.tasks.filter((t) => t.done).length;
              return (
                <div
                  key={phase.id}
                  style={{
                    ...card,
                    borderLeft: `3px solid ${phase.color}`,
                    paddingLeft: "18px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "10px",
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: "12px",
                          letterSpacing: "1px",
                          textTransform: "uppercase",
                          color: phase.color,
                          fontWeight: 600,
                          margin: 0,
                        }}
                      >
                        {phase.phase}
                      </h3>
                      <span
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: "11px",
                          color: "#b5a898",
                        }}
                      >
                        {phaseDone}/{phase.tasks.length} done
                      </span>
                    </div>
                    {!phase.isDefault && (
                      <button
                        onClick={() => deletePhase(phase.id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#c0917f",
                          cursor: "pointer",
                          fontSize: "18px",
                          padding: "4px",
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                  {phase.tasks.map((task) => (
                    <div
                      key={task.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "8px 0",
                        borderBottom: "1px solid rgba(140,110,85,0.05)",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={task.done}
                        onChange={() => toggleTask(phase.id, task.id)}
                        style={{
                          width: "17px",
                          height: "17px",
                          accentColor: "#4a3728",
                          cursor: "pointer",
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          flex: 1,
                          fontSize: "15px",
                          color: task.done ? "#c4b8a8" : "#3d2e1f",
                          textDecoration: task.done ? "line-through" : "none",
                          transition: "all 0.2s",
                        }}
                      >
                        {task.text}
                      </span>
                      <button
                        onClick={() => deleteTask(phase.id, task.id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#d4c8ba",
                          cursor: "pointer",
                          fontSize: "16px",
                          padding: "2px 6px",
                          opacity: 0.5,
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      setSelectedPhase(phase.id);
                      setShowAddTask(true);
                    }}
                    style={{
                      ...addBtnStyle,
                      marginTop: "10px",
                      padding: "8px",
                      fontSize: "12px",
                      border: "1px dashed rgba(140,110,85,0.15)",
                    }}
                  >
                    + Add task
                  </button>
                </div>
              );
            })}
            <button onClick={() => setShowAddPhase(true)} style={addBtnStyle}>
              + Add new phase
            </button>
          </div>
        )}

        {/* ═══ BUDGET ═══ */}
        {activeTab === "budget" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={card}>
              <p style={sectionLabel}>Total Budget</p>
              <div
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <span
                  style={{ fontSize: "22px", fontWeight: 500, color: "#a0917f" }}
                >
                  $
                </span>
                <input
                  type="number"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(Number(e.target.value))}
                  style={{
                    fontSize: "26px",
                    fontWeight: 600,
                    fontFamily: "'Cormorant Garamond', serif",
                    border: "none",
                    borderBottom: "2px solid #d4c8ba",
                    background: "transparent",
                    width: "160px",
                    outline: "none",
                    color: "#3d2e1f",
                  }}
                />
              </div>
              <div
                style={{
                  height: "6px",
                  background: "#efe8dc",
                  borderRadius: "6px",
                  overflow: "hidden",
                  marginTop: "14px",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${Math.min(100, (totalSpent / totalBudget) * 100)}%`,
                    background:
                      totalSpent > totalBudget
                        ? "#c0705b"
                        : "linear-gradient(90deg, #4a3728, #a08872)",
                    borderRadius: "6px",
                    transition: "width 0.4s",
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "12px",
                  color: "#a0917f",
                  marginTop: "6px",
                }}
              >
                <span>${totalSpent.toLocaleString()} spent</span>
                <span>
                  ${Math.max(0, totalBudget - totalSpent).toLocaleString()} left
                </span>
              </div>
            </div>

            {budgetCategories.map((cat) => {
              const allocated =
                cat.percent > 0
                  ? Math.round(totalBudget * (cat.percent / 100))
                  : 0;
              const pct =
                allocated > 0
                  ? Math.min(100, ((cat.spent || 0) / allocated) * 100)
                  : cat.spent > 0
                    ? 100
                    : 0;
              return (
                <div
                  key={cat.id}
                  style={{ ...card, padding: "16px 18px", marginBottom: "10px" }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    <span style={{ fontSize: "15px" }}>
                      {cat.icon} {cat.name}
                    </span>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      {allocated > 0 && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: "10px",
                            color: "#b5a898",
                            letterSpacing: "0.5px",
                          }}
                        >
                          <span>alloc: $</span>
                          <input
                            type="number"
                            value={allocated}
                            onChange={(e) => {
                              const newAmount = Number(e.target.value);
                              const newPercent = (newAmount / totalBudget) * 100;
                              setBudgetCategories((prev) =>
                                prev.map((c) =>
                                  c.id === cat.id
                                    ? { ...c, percent: newPercent }
                                    : c
                                )
                              );
                            }}
                            style={{
                              width: "50px",
                              border: "none",
                              borderBottom: "1px solid rgba(140,110,85,0.2)",
                              background: "transparent",
                              fontFamily: "inherit",
                              fontSize: "inherit",
                              color: "inherit",
                              outline: "none",
                              padding: "0",
                              textAlign: "left",
                            }}
                          />
                        </div>
                      )}
                      {!cat.isDefault && (
                        <button
                          onClick={() => deleteBudgetCategory(cat.id)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#c0917f",
                            cursor: "pointer",
                            fontSize: "16px",
                            padding: "2px",
                          }}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span style={{ fontSize: "13px", color: "#a0917f" }}>$</span>
                    <input
                      type="number"
                      value={cat.spent || ""}
                      placeholder="0"
                      onChange={(e) => updateBudgetSpent(cat.id, e.target.value)}
                      style={{
                        width: "100px",
                        padding: "7px 10px",
                        border: "1px solid rgba(140,110,85,0.12)",
                        borderRadius: "8px",
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: "16px",
                        background: "#fdf8f2",
                        outline: "none",
                        color: "#3d2e1f",
                      }}
                    />
                    <div
                      style={{
                        flex: 1,
                        height: "5px",
                        background: "#efe8dc",
                        borderRadius: "5px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${pct}%`,
                          background:
                            pct > 100
                              ? "#c0705b"
                              : pct > 80
                                ? "#c99a6b"
                                : "#4a3728",
                          borderRadius: "5px",
                          transition: "width 0.3s",
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
            <button
              onClick={() => setShowAddBudget(true)}
              style={addBtnStyle}
            >
              + Add budget category
            </button>
          </div>
        )}

        {/* ═══ GUESTS ═══ */}
        {activeTab === "guests" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ ...card, textAlign: "center" }}>
              <div style={{ fontSize: "48px", fontWeight: 300 }}>
                {totalGuests}
              </div>
              <p style={sectionLabel}>Total Guests</p>
              {totalGuests > 0 && (
                <p
                  style={{
                    fontSize: "13px",
                    color: "#a0917f",
                    fontFamily: "'DM Sans', sans-serif",
                    marginTop: "4px",
                  }}
                >
                  Est. catering: ~${(totalGuests * 45).toLocaleString()}
                  -${(totalGuests * 75).toLocaleString()}
                </p>
              )}
            </div>

            {guests.map((g) => (
              <div
                key={g.id}
                style={{
                  ...card,
                  padding: "14px 18px",
                  marginBottom: "10px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span style={{ fontSize: "15px" }}>{g.name}</span>
                  {!DEFAULT_GUESTS.find((dg) => dg.id === g.id) && (
                    <button
                      onClick={() => deleteGuestCategory(g.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#d4c8ba",
                        cursor: "pointer",
                        fontSize: "14px",
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <button
                    onClick={() => updateGuestCount(g.id, -1)}
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      border: "1px solid rgba(140,110,85,0.15)",
                      background: "#fdf8f2",
                      cursor: "pointer",
                      fontSize: "16px",
                      color: "#4a3728",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    -
                  </button>
                  <span
                    style={{
                      fontSize: "20px",
                      fontWeight: 600,
                      minWidth: "32px",
                      textAlign: "center",
                    }}
                  >
                    {g.count}
                  </span>
                  <button
                    onClick={() => updateGuestCount(g.id, 1)}
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      border: "1px solid rgba(140,110,85,0.15)",
                      background: "#fdf8f2",
                      cursor: "pointer",
                      fontSize: "16px",
                      color: "#4a3728",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={() => setShowAddGuest(true)}
              style={addBtnStyle}
            >
              + Add guest category
            </button>

            <div
              style={{
                background: "rgba(74,55,40,0.04)",
                borderRadius: "12px",
                padding: "14px 16px",
                marginTop: "16px",
                fontSize: "13px",
                color: "#a0917f",
                lineHeight: "1.6",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              💡 <strong>Tip:</strong> Plan for about 75-80% of invited guests
              to actually attend. Budget catering for confirmed RSVPs + 5%.
            </div>
          </div>
        )}
      </div>

      {/* ─── MODALS ──────────────────────────────────────────── */}

      {/* Add Task */}
      <Modal
        isOpen={showAddTask}
        onClose={() => setShowAddTask(false)}
        title="Add Task"
      >
        <input
          type="text"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          placeholder="What needs to be done?"
          style={inputStyle}
          autoFocus
          onKeyDown={(e) => e.key === "Enter" && addTask()}
        />
        <button onClick={addTask} style={btnPrimary}>
          Add Task
        </button>
      </Modal>

      {/* Add Phase */}
      <Modal
        isOpen={showAddPhase}
        onClose={() => setShowAddPhase(false)}
        title="Add Timeline Phase"
      >
        <input
          type="text"
          value={newPhaseName}
          onChange={(e) => setNewPhaseName(e.target.value)}
          placeholder='e.g. "Honeymoon Planning" or "DIY Projects"'
          style={inputStyle}
          autoFocus
          onKeyDown={(e) => e.key === "Enter" && addPhase()}
        />
        <button onClick={addPhase} style={btnPrimary}>
          Add Phase
        </button>
      </Modal>

      {/* Add Budget Category */}
      <Modal
        isOpen={showAddBudget}
        onClose={() => setShowAddBudget(false)}
        title="Add Budget Category"
      >
        <input
          type="text"
          value={newBudgetName}
          onChange={(e) => setNewBudgetName(e.target.value)}
          placeholder='e.g. "Wedding Favors" or "Photo Booth"'
          style={inputStyle}
          autoFocus
        />
        <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
          <div style={{ flex: 1 }}>
            <p style={{ ...sectionLabel, marginBottom: "6px" }}>Icon</p>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {[
                "📋",
                "🎁",
                "🎪",
                "💍",
                "🕯️",
                "🧁",
                "🎀",
                "✈️",
                "💅",
                "🏨",
              ].map((e) => (
                <button
                  key={e}
                  onClick={() => setNewBudgetIcon(e)}
                  style={{
                    fontSize: "20px",
                    padding: "6px",
                    border:
                      newBudgetIcon === e
                        ? "2px solid #4a3728"
                        : "1px solid rgba(140,110,85,0.12)",
                    borderRadius: "8px",
                    background:
                      newBudgetIcon === e ? "#efe8dc" : "#fdf8f2",
                    cursor: "pointer",
                  }}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        </div>
        <p style={{ ...sectionLabel, marginBottom: "6px" }}>
          Budget Allocation %{" "}
          <span style={{ fontWeight: 300 }}>(optional)</span>
        </p>
        <input
          type="number"
          value={newBudgetAlloc}
          onChange={(e) => setNewBudgetAlloc(e.target.value)}
          placeholder="e.g. 5"
          style={{ ...inputStyle, width: "120px" }}
        />
        <button onClick={addBudgetCategory} style={btnPrimary}>
          Add Category
        </button>
      </Modal>

      {/* Add Guest Category */}
      <Modal
        isOpen={showAddGuest}
        onClose={() => setShowAddGuest(false)}
        title="Add Guest Group"
      >
        <input
          type="text"
          value={newGuestName}
          onChange={(e) => setNewGuestName(e.target.value)}
          placeholder='e.g. "Neighbors" or "College Friends"'
          style={inputStyle}
          autoFocus
          onKeyDown={(e) => e.key === "Enter" && addGuestCategory()}
        />
        <button onClick={addGuestCategory} style={btnPrimary}>
          Add Group
        </button>
      </Modal>

      {/* Settings */}
      <Modal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="Settings"
      >
        <p style={{ ...sectionLabel, marginBottom: "6px" }}>Partner Names</p>
        <input
          type="text"
          value={partnerNames}
          onChange={(e) => setPartnerNames(e.target.value)}
          placeholder='e.g. "Sarah & James"'
          style={inputStyle}
        />
        <p style={{ ...sectionLabel, marginBottom: "6px" }}>Wedding Date</p>
        <input
          type="date"
          value={weddingDate}
          onChange={(e) => setWeddingDate(e.target.value)}
          style={inputStyle}
        />

        {/* Account info */}
        <div
          style={{
            marginTop: "16px",
            padding: "14px",
            background: "rgba(74,55,40,0.04)",
            borderRadius: "10px",
          }}
        >
          <p style={{ ...sectionLabel, marginBottom: "4px" }}>Signed in as</p>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "13px",
              color: "#6b5443",
              margin: 0,
            }}
          >
            {user?.email || "Unknown"}
          </p>
        </div>

        <div style={{ height: "20px" }} />

        <button
          onClick={signOut}
          style={{
            ...btnPrimary,
            background: "transparent",
            color: "#6b5443",
            border: "1px solid rgba(107,84,67,0.25)",
            marginBottom: "8px",
          }}
        >
          Sign Out
        </button>

        <button
          onClick={resetAll}
          style={{
            ...btnPrimary,
            background: "transparent",
            color: "#c0705b",
            border: "1px solid rgba(192,112,91,0.3)",
          }}
        >
          Reset All Data
        </button>
      </Modal>
    </div>
  );
}
