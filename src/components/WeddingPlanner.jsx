"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "./AuthProvider";
import { savePlannerData, loadPlannerData, deletePlannerData } from "@/lib/planner-data";
import { getSupabase } from "@/lib/supabase";
import {
  fetchHouseholds,
  createHousehold,
  updateHousehold,
  deleteHousehold,
  addGuest,
  updateGuest,
  removeGuest,
  migrateGuests,
  syncWeddingProfile
} from "@/lib/guests";


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
  {
    id: "h1",
    name: "Initial Family Group",
    category: "Family",
    guests: [],
  },
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
  const [guests, setGuests] = useState([]); // Now using household/guest table format
  const [households, setHouseholds] = useState([]);
  const [cateringPrice, setCateringPrice] = useState(150);
  const [notes, setNotes] = useState([]);
  const [quickNote, setQuickNote] = useState("");
  const [activeMenu, setActiveMenu] = useState(null);
  const [guestSearch, setGuestSearch] = useState("");
  const [copyingLink, setCopyingLink] = useState(null);
  const [dbError, setDbError] = useState(null);


  // Modals
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddPhase, setShowAddPhase] = useState(false);
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [showAddGuest, setShowAddGuest] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showQRCode, setShowQRCode] = useState(null); // stores token for QR
  const [selectedPhase, setSelectedPhase] = useState("");

  const [newTaskText, setNewTaskText] = useState("");
  const [newPhaseName, setNewPhaseName] = useState("");
  const [newBudgetName, setNewBudgetName] = useState("");
  const [newBudgetIcon, setNewBudgetIcon] = useState("📋");
  const [newBudgetAlloc, setNewBudgetAlloc] = useState("");
  const [newGuestName, setNewGuestName] = useState("");
  const [saveError, setSaveError] = useState(false);
  const saveTimeout = useRef(null);
  const lastKnownData = useRef(null);

  const hydrateStates = useCallback((data) => {
    if (!data) return;

    // Prevent loop: only update if data actually changed
    const dataStr = JSON.stringify(data);
    if (lastKnownData.current === dataStr) return;
    lastKnownData.current = dataStr;

    if (data.weddingDate) setWeddingDate(data.weddingDate);
    if (data.partnerNames) setPartnerNames(data.partnerNames);
    if (data.totalBudget) setTotalBudget(data.totalBudget);
    if (data.budgetCategories) setBudgetCategories(data.budgetCategories);
    if (data.timeline) setTimeline(data.timeline);

    // Migration: If guest data exists in user_data, migrate to separate tables
    if (data.guests && data.guests.length > 0) {
      migrateGuests(data.guests).then(async (success) => {
        if (success) {
          // Clear guests from user_data after migration
          const currentData = await loadPlannerData();
          if (currentData && currentData.guests) {
            delete currentData.guests;
            await savePlannerData(currentData);
          }
          // Refresh households
          const hData = await fetchHouseholds();
          setHouseholds(hData);
        } else {
          console.error("Migration failed - guest data preserved in legacy format");
        }
      });
    }

    if (data.cateringPrice) setCateringPrice(data.cateringPrice);

    if (data.notes !== undefined) {
      if (typeof data.notes === "string") {
        setNotes([{ id: uid(), text: data.notes, date: new Date().toLocaleDateString() }]);
      } else {
        setNotes(data.notes);
      }
    }
  }, []);

  // Load on mount and setup Realtime
  useEffect(() => {
    let channel;

    (async () => {
      // 1. Initial Load (Main Data)
      const data = await loadPlannerData();
      if (data) hydrateStates(data);

      // 2. Load Guests from separate tables
      const hData = await fetchHouseholds();
      setHouseholds(hData);

      setLoaded(true);

      // 4. Proactively sync public profile if data exists
      if (data && data.partnerNames) {
        syncWeddingProfile(data.partnerNames, data.weddingDate);
      }

      // 3. Setup Realtime subscription for planner data
      const supabase = getSupabase();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        channel = supabase
          .channel('realtime_planner_all')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'user_data', filter: `user_id=eq.${user.id}` },
            (payload) => { if (payload.new && payload.new.data) hydrateStates(payload.new.data); }
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'households', filter: `user_id=eq.${user.id}` },
            async () => {
              const updatedHouseholds = await fetchHouseholds();
              setHouseholds(updatedHouseholds);
            }
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'guests' },
            async () => {
              const updatedHouseholds = await fetchHouseholds();
              setHouseholds(updatedHouseholds);
            }
          )
          .subscribe();
      }
    })();


    return () => {
      if (channel) {
        getSupabase().removeChannel(channel);
      }
    };
  }, [hydrateStates]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (e.target.closest(".guest-menu-btn") || e.target.closest(".note-menu-btn")) return;
      setActiveMenu(null);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Build the data object for saving
  const buildSavePayload = useCallback(
    () => ({
      weddingDate,
      partnerNames,
      totalBudget,
      budgetCategories,
      timeline,
      // guests is now stored in separate tables
      cateringPrice,
      notes,
    }),
    [weddingDate, partnerNames, totalBudget, budgetCategories, timeline, cateringPrice, notes]

  );

  // Auto-save with debounce
  useEffect(() => {
    if (!loaded) return;

    // Check if we already saved this exact payload
    const currentPayload = buildSavePayload();
    const payloadStr = JSON.stringify(currentPayload);
    if (lastKnownData.current === payloadStr) return;

    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      const result = await savePlannerData(currentPayload);
      if (result.success) {
        lastKnownData.current = payloadStr; // Mark as known
        setSaveError(false);
        // Also sync public profile
        syncWeddingProfile(partnerNames, weddingDate);
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
  const totalGuests = households.reduce((a, h) => a + (h.guests?.length || 0), 0);
  const totalInvitations = households.length;
  const attendingGuests = households.reduce((a, h) =>
    a + (h.guests?.filter(g => g.rsvp_status === 'attending').length || 0), 0
  );

  const filteredHouseholds = households.filter(h => {
    const search = guestSearch.toLowerCase().trim();
    if (!search) return true;
    const householdMatches = h.name.toLowerCase().includes(search);
    const guestMatches = h.guests?.some(g => g.name.toLowerCase().includes(search));
    return householdMatches || guestMatches;
  });

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

  const addGuestCategory = async () => {
    if (!newGuestName.trim()) return;
    const result = await createHousehold(newGuestName.trim(), "Other", [{ name: "" }]);
    if (result) {
      const hData = await fetchHouseholds();
      setHouseholds(hData);
      setDbError(null);
    } else {
      setDbError("Database error. Please check if your Supabase tables are set up correctly.");
    }
    setNewGuestName("");
    setShowAddGuest(false);
  };


  const addIndividualGuest = async (householdId) => {
    const result = await addGuest(householdId);
    if (result) {
      const hData = await fetchHouseholds();
      setHouseholds(hData);
    }
  };

  const updateIndividualGuest = async (householdId, guestId, updates, localOnly = false) => {
    // 1. Optimistic Update
    setHouseholds(prev => prev.map(h =>
      h.id === householdId
        ? { ...h, guests: h.guests.map(g => g.id === guestId ? { ...g, ...updates } : g) }
        : h
    ));

    if (localOnly) return;

    // 2. Sync to DB
    const result = await updateGuest(guestId, updates);
    if (result) {
      // Optional: re-fetch if you want to ensure total sync, 
      // but for name changes it's often not needed if local update is correct.
      // const hData = await fetchHouseholds();
      // setHouseholds(hData);
    }
  };

  const removeIndividualGuest = async (householdId, guestId) => {
    const result = await removeGuest(guestId);
    if (result) {
      const hData = await fetchHouseholds();
      setHouseholds(hData);
    }
  };

  const updateHouseholdDetails = async (householdId, updates, localOnly = false) => {
    setHouseholds(prev => prev.map(h => h.id === householdId ? { ...h, ...updates } : h));
    if (localOnly) return;
    const result = await updateHousehold(householdId, updates);
    if (!result) {
      setDbError("Failed to update household. Please check your connection.");
    }
  };

  const deleteGuestCategory = async (hId) => {
    if (!confirm("Are you sure you want to delete this group?")) return;
    const result = await deleteHousehold(hId);
    if (result) {
      const hData = await fetchHouseholds();
      setHouseholds(hData);
    }
  };

  const copyRSVPLink = (token) => {
    const link = `${window.location.origin}/rsvp/${token}`;
    navigator.clipboard.writeText(link);
    setCopyingLink(token);
    setTimeout(() => setCopyingLink(null), 2000);
  };


  const resetAll = async () => {
    await deletePlannerData();
    setWeddingDate("");
    setPartnerNames("");
    setTotalBudget(17500);
    setBudgetCategories(DEFAULT_BUDGET_CATEGORIES);
    setTimeline(DEFAULT_TIMELINE);
    setGuests(DEFAULT_GUESTS);
    setCateringPrice(150);
    setNotes([]);
    setQuickNote("");
    setShowSettings(false);
  };

  const syncProfile = useCallback(async () => {
    if (!partnerNames) return;
    const success = await syncWeddingProfile(partnerNames, weddingDate);
    if (!success) {
      console.warn("Public profile sync failed. This is expected if the 'wedding_profiles' table hasn't been created in Supabase yet.");
    }
  }, [partnerNames, weddingDate]);

  const addNote = (text) => {
    if (!text?.trim()) return;
    const newNote = {
      id: uid(),
      text: text.trim(),
      date: new Date().toLocaleDateString(),
    };
    setNotes((prev) => [newNote, ...prev]);
  };

  const updateNote = (id, newText) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, text: newText } : n))
    );
  };

  const deleteNote = (id) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const tabs = [
    { id: "overview", label: "Home" },
    { id: "timeline", label: "Tasks" },
    { id: "budget", label: "Budget" },
    { id: "guests", label: "Guests" },
    { id: "notes", label: "Notes" },
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
        .status-toast {
          position: fixed;
          bottom: 0;
          left: 0;
          width: 100%;
          z-index: 999;
          padding: 8px 16px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          text-align: center;
        }
        @media (min-width: 768px) {
          .status-toast {
            bottom: 24px;
            right: 24px;
            left: auto;
            width: auto;
            border-radius: 8px;
            min-width: 120px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
        }
        * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
        input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; }
        input[type="number"] { -moz-appearance: textfield; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(140,110,85,0.2); border-radius: 4px; }
      `}</style>

      {/* Saved / Error Indicator */}
      {saveError && (
        <div
          className="status-toast"
          style={{
            background: "#c0705b",
            color: "#faf5ef",
            animationIterationCount: "infinite", // Stay visible on error
          }}
        >
          ⚠ Save failed, will retry
        </div>
      )}

      {dbError && (
        <div
          className="status-toast"
          style={{
            background: "#c0705b",
            color: "#faf5ef",
            animation: "fadeIn 0.3s ease",
          }}
        >
          {dbError}
          <button
            onClick={() => setDbError(null)}
            style={{
              marginLeft: "10px",
              background: "transparent",
              border: "none",
              color: "#fff",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >✕</button>
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
            { label: "Invitations", value: totalInvitations || "0" },
            { label: "Guests", value: totalGuests || "0" },
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

            {/* Quick Notes */}
            <div style={card}>
              <p style={sectionLabel}>Quick Note</p>
              <textarea
                value={quickNote}
                onChange={(e) => setQuickNote(e.target.value)}
                placeholder="Vendor contacts, ceremony ideas, song drafts..."
                style={{
                  ...inputStyle,
                  minHeight: "80px",
                  resize: "none",
                  marginBottom: "12px",
                  lineHeight: "1.6",
                }}
              />
              <button
                onClick={() => {
                  if (quickNote.trim()) {
                    addNote(quickNote);
                    setQuickNote("");
                  }
                }}
                disabled={!quickNote.trim()}
                style={{
                  ...btnPrimary,
                  background: quickNote.trim() ? "#4a3728" : "#efe8dc",
                  color: quickNote.trim() ? "#faf5ef" : "#a0917f",
                  transition: "all 0.3s",
                }}
              >
                Save to Notes Tab
              </button>
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
            <div
              style={{
                ...card,
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                textAlign: "center",
                gap: "20px",
              }}
            >
              <div>
                <div style={{ fontSize: "36px", fontWeight: 300 }}>
                  {totalGuests}
                </div>
                <p style={sectionLabel}>Total Guests</p>
              </div>
              <div>
                <div style={{ fontSize: "36px", fontWeight: 300 }}>
                  {totalInvitations}
                </div>
                <p style={sectionLabel}>Invitations</p>
              </div>
              <div>
                <div style={{ fontSize: "36px", fontWeight: 300, color: "#7da07d" }}>
                  {attendingGuests}
                </div>
                <p style={sectionLabel}>Attending</p>
              </div>


              <div style={{ gridColumn: "span 2", borderTop: "1px solid #efe8dc", paddingTop: "12px" }}>
                {totalGuests > 0 && (
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#a0917f",
                      fontFamily: "'DM Sans', sans-serif",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <span>Est. catering (~${cateringPrice}/pp):</span>
                    <span style={{ fontWeight: 600, color: "#4a3728" }}>
                      ${(totalGuests * cateringPrice).toLocaleString()}
                    </span>
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    marginTop: "8px",
                    fontSize: "12px",
                    color: "#b5a898",
                  }}
                >
                  <span>Catering price: $</span>
                  <input
                    type="number"
                    value={cateringPrice}
                    onChange={(e) => setCateringPrice(Number(e.target.value))}
                    style={{
                      width: "50px",
                      padding: "2px",
                      border: "none",
                      borderBottom: "1px solid #d4c8ba",
                      textAlign: "center",
                      fontFamily: "inherit",
                      fontSize: "inherit",
                      background: "transparent",
                      color: "#4a3728",
                      outline: "none",
                    }}
                  />
                </div>
              </div>
            </div>

            <div style={{ ...card, padding: "12px", marginBottom: "16px" }}>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#b5a898" }}>🔍</span>
                <input
                  type="text"
                  placeholder="Search guests or households..."
                  value={guestSearch}
                  onChange={(e) => setGuestSearch(e.target.value)}
                  style={{
                    ...inputStyle,
                    margin: 0,
                    paddingLeft: "36px",
                    background: "#fff",
                    borderColor: "rgba(140,110,85,0.15)",
                  }}
                />
              </div>
            </div>

            {filteredHouseholds.map((h) => (
              <div key={h.id} style={{ ...card, padding: "18px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <input
                    type="text"
                    value={h.name}
                    onChange={(e) => updateHouseholdDetails(h.id, { name: e.target.value }, true)}
                    onBlur={(e) => {
                      updateHouseholdDetails(h.id, { name: e.target.value }, false);
                      e.target.style.borderBottom = "transparent";
                    }}
                    placeholder="Household Name (e.g. The Smiths)"
                    style={{
                      fontSize: "18px",
                      fontWeight: 500,
                      border: "none",
                      background: "transparent",
                      color: "#3d2e1f",
                      fontFamily: "'Cormorant Garamond', serif",
                      width: "70%",
                      outline: "none",
                      borderBottom: "1px dashed transparent",
                    }}
                    onFocus={(e) => (e.target.style.borderBottom = "1px dashed #d4c8ba")}
                  />
                  <div style={{ position: "relative" }}>
                    <button
                      className="guest-menu-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenu(activeMenu === h.id ? null : h.id);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#d4c8ba",
                        cursor: "pointer",
                        fontSize: "18px",
                        padding: "4px",
                      }}
                    >
                      •••
                    </button>
                    {activeMenu === h.id && (
                      <div
                        style={{
                          position: "absolute",
                          top: "100%",
                          right: 0,
                          background: "#fff",
                          boxShadow: "0 2px 10px rgba(60,45,30,0.1)",
                          borderRadius: "8px",
                          padding: "4px",
                          zIndex: 10,
                          minWidth: "140px",
                        }}
                      >
                        <button
                          onClick={() => copyRSVPLink(h.rsvp_token)}
                          style={{
                            display: "block",
                            width: "100%",
                            padding: "8px 12px",
                            textAlign: "left",
                            background: "transparent",
                            border: "none",
                            color: "#4a3728",
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: "13px",
                            cursor: "pointer",
                            borderBottom: "1px solid #f0e6da"
                          }}
                        >
                          {copyingLink === h.rsvp_token ? "✓ Link Copied" : "Copy RSVP Link"}
                        </button>
                        <button
                          onClick={() => setShowQRCode(h.rsvp_token)}
                          style={{
                            display: "block",
                            width: "100%",
                            padding: "8px 12px",
                            textAlign: "left",
                            background: "transparent",
                            border: "none",
                            color: "#4a3728",
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: "13px",
                            cursor: "pointer",
                            borderBottom: "1px solid #f0e6da"
                          }}
                        >
                          Show QR Code
                        </button>
                        <button
                          onClick={() => deleteGuestCategory(h.id)}
                          style={{
                            display: "block",
                            width: "100%",
                            padding: "8px 12px",
                            textAlign: "left",
                            background: "transparent",
                            border: "none",
                            color: "#c0705b",
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: "13px",
                            cursor: "pointer",
                          }}
                        >
                          Delete Household
                        </button>

                      </div>
                    )}
                  </div>
                </div>


                {/* Tracking Row */}
                <div
                  style={{
                    display: "flex",
                    gap: "24px",
                    marginBottom: "16px",
                    paddingBottom: "12px",
                    borderBottom: "1px solid rgba(140,110,85,0.1)",
                  }}
                >
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#7a6a5a", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                    <input
                      type="checkbox"
                      checked={!!h.invitation_sent}
                      onChange={(e) => updateHouseholdDetails(h.id, { invitation_sent: e.target.checked })}
                      style={{ cursor: "pointer", accentColor: "#4a3728" }}
                    />
                    Invitation Sent
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#7a6a5a", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                    <input
                      type="checkbox"
                      checked={!!h.thank_you_sent}
                      onChange={(e) => updateHouseholdDetails(h.id, { thank_you_sent: e.target.checked })}
                      style={{ cursor: "pointer", accentColor: "#4a3728" }}
                    />
                    Thank You Sent
                  </label>

                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {h.guests.map((g) => (
                    <div
                      key={g.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        background: "#faf5ef",
                        padding: "8px 12px",
                        borderRadius: "8px",
                      }}
                    >
                      <input
                        type="text"
                        value={g.name}
                        onChange={(e) => updateIndividualGuest(h.id, g.id, { name: e.target.value }, true)}
                        onBlur={(e) => updateIndividualGuest(h.id, g.id, { name: e.target.value }, false)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            // First, ensure the current name is saved to DB
                            updateIndividualGuest(h.id, g.id, { name: e.target.value }, false);
                            // Then add the new guest
                            addIndividualGuest(h.id);
                          }
                        }}
                        autoFocus={!g.name} // Autofocus if name is empty (newly added)
                        placeholder="Guest"
                        style={{
                          flex: 1,
                          border: "none",
                          background: "transparent",
                          fontFamily: "'Cormorant Garamond', serif",
                          fontSize: "16px",
                          color: "#3d2e1f",
                          outline: "none",
                        }}
                      />
                      <select
                        value={g.rsvp_status || 'pending'}
                        onChange={(e) => updateIndividualGuest(h.id, g.id, { rsvp_status: e.target.value })}
                        style={{
                          fontSize: "10px",
                          fontFamily: "'DM Sans', sans-serif",
                          textTransform: "uppercase",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          border: "1px solid transparent",
                          background:
                            g.rsvp_status === 'attending' ? '#e7f3e7' :
                              g.rsvp_status === 'declined' ? '#fdeced' : '#f0e6da',
                          color:
                            g.rsvp_status === 'attending' ? '#2d5e2d' :
                              g.rsvp_status === 'declined' ? '#a33b3b' : '#a0917f',
                          cursor: "pointer",
                          outline: "none",
                        }}
                      >
                        <option value="pending">Pending</option>
                        <option value="attending">Attending</option>
                        <option value="declined">Declined</option>
                      </select>
                      <button
                        onClick={() => removeIndividualGuest(h.id, g.id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#d4c8ba",
                          cursor: "pointer",
                          fontSize: "14px",
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addIndividualGuest(h.id)}
                    style={{
                      ...addBtnStyle,
                      marginTop: "4px",
                      padding: "6px",
                      fontSize: "12px",
                      border: "1px dashed rgba(140,110,85,0.15)",
                    }}
                  >
                    + Add Guest
                  </button>
                </div>
              </div>
            ))}


            <button
              onClick={() => setShowAddGuest(true)}
              style={addBtnStyle}
            >
              + Create Household
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
            </div>
          </div>
        )}

        {/* ═══ NOTES ═══ */}
        {activeTab === "notes" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ ...card, padding: "12px" }}>
              <button
                onClick={() => addNote("New note...")}
                style={{
                  ...addBtnStyle,
                  marginTop: 0,
                  background: "#fff",
                  borderColor: "rgba(140,110,85,0.15)",
                }}
              >
                + Create new note
              </button>
            </div>

            {notes.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 20px",
                  color: "#a0917f",
                }}
              >
                <div style={{ fontSize: "32px", marginBottom: "12px" }}>📝</div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px" }}>
                  Your notes will appear here.
                </p>
              </div>
            ) : (
              notes.map((note) => (
                <div key={note.id} style={{ ...card, position: "relative" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "8px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "10px",
                        fontFamily: "'DM Sans', sans-serif",
                        color: "#b5a898",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {note.date}
                    </span>
                    <div style={{ position: "relative" }}>
                      <button
                        className="note-menu-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenu(activeMenu === note.id ? null : note.id);
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#d4c8ba",
                          cursor: "pointer",
                          fontSize: "18px",
                          lineHeight: 1,
                        }}
                      >
                        •••
                      </button>
                      {activeMenu === note.id && (
                        <div
                          style={{
                            position: "absolute",
                            top: "100%",
                            right: 0,
                            background: "#fff",
                            boxShadow: "0 2px 10px rgba(60,45,30,0.1)",
                            borderRadius: "8px",
                            padding: "4px",
                            zIndex: 10,
                            minWidth: "120px",
                          }}
                        >
                          <button
                            onClick={() => deleteNote(note.id)}
                            style={{
                              display: "block",
                              width: "100%",
                              padding: "8px 12px",
                              textAlign: "left",
                              background: "transparent",
                              border: "none",
                              color: "#c0705b",
                              fontFamily: "'DM Sans', sans-serif",
                              fontSize: "13px",
                              cursor: "pointer",
                            }}
                          >
                            Delete Note
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <textarea
                    value={note.text}
                    onChange={(e) => updateNote(note.id, e.target.value)}
                    placeholder="Write something..."
                    style={{
                      width: "100%",
                      minHeight: "60px",
                      border: "none",
                      background: "transparent",
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "17px",
                      lineHeight: "1.5",
                      color: "#3d2e1f",
                      outline: "none",
                      resize: "vertical",
                    }}
                  />
                </div>
              ))
            )}
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

        <div style={{ marginTop: "20px" }}>
          <button
            onClick={syncProfile}
            style={{
              ...btnPrimary,
              background: "#7da07d",
              marginBottom: "10px"
            }}
          >
            🔄 Sync Public Invitation Data
          </button>
          <p style={{ fontSize: "11px", color: "#a0917f", fontStyle: "italic", textAlign: "center" }}>
            Updates the names and date shown on your digital invitations.
          </p>
        </div>

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
      {/* QR Code Modal */}
      <Modal
        isOpen={!!showQRCode}
        onClose={() => setShowQRCode(null)}
        title="RSVP & Invitation"
      >
        <div style={{ textAlign: "center", padding: "10px 0" }}>
          <p style={{ ...sectionLabel, marginBottom: "20px" }}>Share this with your guests</p>

          <div id="qr-container" style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "16px",
            display: "inline-block",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            marginBottom: "24px"
          }}>
            <img
              id="qr-image"
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(typeof window !== 'undefined' ? `${window.location.origin}/rsvp/${showQRCode}` : '')}`}
              alt="QR Code"
              style={{ display: "block", width: "200px", height: "200px" }}
              crossOrigin="anonymous"
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <button
              onClick={async () => {
                const response = await fetch(`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(window.location.origin + '/rsvp/' + showQRCode)}`);
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `RSVP-QR-${showQRCode}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }}
              style={{ ...btnPrimary, margin: 0 }}
            >
              📥 Download QR Code
            </button>

            <button
              onClick={() => {
                const link = `${window.location.origin}/invite/${showQRCode}`;
                navigator.clipboard.writeText(link);
                setCopyingLink("invite-" + showQRCode);
                setTimeout(() => setCopyingLink(null), 2000);
              }}
              style={{ ...btnPrimary, background: "#fdf8f2", color: "#4a3728", border: "1px solid #d4c8ba", margin: 0 }}
            >
              {copyingLink === "invite-" + showQRCode ? "✅ Link Copied!" : "💌 Copy Invitation Link"}
            </button>

            <button
              onClick={async () => {
                const shareData = {
                  title: 'Wedding Invitation',
                  text: `You are cordially invited to or wedding! Please RSVP here:`,
                  url: `${window.location.origin}/invite/${showQRCode}`
                };
                if (navigator.share) {
                  try {
                    await navigator.share(shareData);
                  } catch (err) {
                    console.log('Share failed', err);
                  }
                } else {
                  copyRSVPLink(showQRCode);
                }
              }}
              style={{ ...btnPrimary, background: "transparent", border: "1px solid #efe8dc", color: "#a0917f", margin: 0 }}
            >
              📱 Share via...
            </button>
          </div>

          <p style={{
            marginTop: "24px",
            fontSize: "13px",
            color: "#b5a898",
            fontFamily: "'DM Sans', sans-serif",
            lineHeight: "1.5"
          }}>
            Download the QR to print on paper invites,<br />or share the digital link directly with guests.
          </p>
        </div>
      </Modal>

    </div >

  );
}
