"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { findHouseholdsByName } from "@/lib/guests";

export default function RSVPLookup() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    useEffect(() => {
        const delaySearch = setTimeout(async () => {
            const trimmed = searchTerm.trim();
            if (trimmed.length >= 2) {
                setLoading(true);
                const households = await findHouseholdsByName(trimmed);
                setResults(households);
                setLoading(false);
                setSearched(true);
            } else {
                setResults([]);
                setSearched(false);
            }
        }, 400);

        return () => clearTimeout(delaySearch);
    }, [searchTerm]);

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>Find Your Invitation</h1>
                <p style={styles.text}>
                    If you're responding for you and a guest (or your family),
                    you'll be able to RSVP for your entire group.
                </p>

                <div style={styles.searchWrapper}>
                    <input
                        type="text"
                        placeholder="Full Name"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={styles.input}
                        autoFocus
                    />
                </div>

                <div style={styles.resultsArea}>
                    {loading && <p style={styles.statusText}>Searching...</p>}

                    {!loading && searched && results.length === 0 && (
                        <p style={styles.statusText}>No invitations found. Try a different name.</p>
                    )}

                    {!loading && results.length > 0 && (
                        <div style={styles.resultsList}>
                            {results.map((h) => (
                                <button
                                    key={h.id}
                                    onClick={() => router.push(`/rsvp/${h.rsvp_token}`)}
                                    style={styles.resultItem}
                                >
                                    <div style={styles.resultContent}>
                                        <span style={styles.householdName}>{h.name}</span>
                                        <span style={styles.weddingDetail}>Celebrating with {h.couple}</span>
                                        <span style={styles.guestPreview}>
                                            Guests: {h.guests.map(g => g.name).join(", ")}
                                        </span>
                                    </div>
                                    <span style={styles.arrow}>→</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div style={styles.footer}>
                    <p style={styles.footerText}>
                        Can't find your name? Please contact the couple directly.
                    </p>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        background: "#fdf8f4",
        fontFamily: "'Cormorant Garamond', serif",
    },
    card: {
        background: "#fff",
        padding: "50px 40px",
        borderRadius: "4px",
        width: "100%",
        maxWidth: "600px",
        boxShadow: "0 10px 40px rgba(60,45,30,0.05)",
        border: "1px solid #efe8dc",
        textAlign: "center",
        animation: "fadeIn 0.8s ease-out",
    },
    title: {
        fontSize: "36px",
        fontWeight: 500,
        color: "#3d2e1f",
        marginBottom: "20px",
    },
    text: {
        fontSize: "18px",
        lineHeight: "1.6",
        color: "#6b5443",
        marginBottom: "40px",
        fontStyle: "italic",
    },
    searchWrapper: {
        marginBottom: "30px",
    },
    input: {
        width: "100%",
        padding: "16px 20px",
        fontSize: "20px",
        fontFamily: "inherit",
        border: "1px solid #d4c8ba",
        borderRadius: "2px",
        outline: "none",
        color: "#3d2e1f",
        background: "#fdf8f2",
        textAlign: "center",
        transition: "border-color 0.2s",
    },
    resultsArea: {
        minHeight: "100px",
        marginBottom: "30px",
    },
    statusText: {
        fontSize: "16px",
        color: "#a0917f",
        fontStyle: "italic",
    },
    resultsList: {
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        textAlign: "left",
    },
    resultItem: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "20px",
        background: "#fdf8f4",
        border: "1px solid #efe8dc",
        borderRadius: "4px",
        cursor: "pointer",
        transition: "all 0.2s",
        textDecoration: "none",
        width: "100%",
    },
    resultContent: {
        display: "flex",
        flexDirection: "column",
        gap: "4px",
    },
    householdName: {
        fontSize: "20px",
        fontWeight: 600,
        color: "#4a3728",
    },
    weddingDetail: {
        fontSize: "14px",
        color: "#7da07d",
        fontWeight: "500",
        fontFamily: "'DM Sans', sans-serif",
    },
    guestPreview: {
        fontSize: "13px",
        color: "#a0917f",
        fontFamily: "'DM Sans', sans-serif",
    },
    arrow: {
        fontSize: "20px",
        color: "#d4c8ba",
    },
    footer: {
        borderTop: "1px solid #f0e6da",
        paddingTop: "30px",
    },
    footerText: {
        fontSize: "14px",
        color: "#b5a898",
        fontFamily: "'DM Sans', sans-serif",
    },
};
