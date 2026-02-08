"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchByToken, submitRSVP } from "@/lib/guests";

export default function RSVPPage() {
    const { token } = useParams();
    const [household, setHousehold] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (token) {
            loadData();
        }
    }, [token]);

    async function loadData() {
        setLoading(true);
        const data = await fetchByToken(token);
        if (data) {
            setHousehold(data);
        } else {
            setError("We couldn't find your invitation. Please check the link and try again.");
        }
        setLoading(false);
    }

    const handleGuestUpdate = (guestId, field, value) => {
        setHousehold(prev => ({
            ...prev,
            guests: prev.guests.map(g =>
                g.id === guestId ? { ...g, [field]: value } : g
            )
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const success = await submitRSVP(household.id, household.guests);
        if (success) {
            setSubmitted(true);
        } else {
            alert("Something went wrong. Please try again.");
        }
        setSubmitting(false);
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <p style={styles.loading}>Finding your invitation...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <h1 style={styles.title}>Oops!</h1>
                    <p style={styles.text}>{error}</p>
                </div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={styles.successIcon}>✨</div>
                    <h1 style={styles.title}>Thank You!</h1>
                    <p style={styles.text}>Your RSVP has been received. We can't wait to celebrate with you!</p>
                    <button
                        onClick={() => setSubmitted(false)}
                        style={styles.btnSecondary}
                    >
                        Edit RSVP
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <p style={styles.label}>Reservation for</p>
                <h1 style={styles.title}>{household.name}</h1>

                <form onSubmit={handleSubmit} style={styles.form}>
                    {household.guests.map((guest, index) => (
                        <div key={guest.id} style={styles.guestSection}>
                            <h3 style={styles.guestName}>{guest.name}</h3>

                            <div style={styles.radioGroup}>
                                <label style={styles.radioLabel}>
                                    <input
                                        type="radio"
                                        name={`rsvp-${guest.id}`}
                                        value="attending"
                                        checked={guest.rsvp_status === "attending"}
                                        onChange={() => handleGuestUpdate(guest.id, "rsvp_status", "attending")}
                                        required
                                    />
                                    <span>Joyfully Accepts</span>
                                </label>
                                <label style={styles.radioLabel}>
                                    <input
                                        type="radio"
                                        name={`rsvp-${guest.id}`}
                                        value="declined"
                                        checked={guest.rsvp_status === "declined"}
                                        onChange={() => handleGuestUpdate(guest.id, "rsvp_status", "declined")}
                                        required
                                    />
                                    <span>Regretfully Declines</span>
                                </label>
                            </div>

                            {guest.rsvp_status === "attending" && (
                                <div style={styles.inputGroup}>
                                    <label style={styles.smallLabel}>Dietary Requirements / Notes</label>
                                    <textarea
                                        value={guest.dietary_requirements || ""}
                                        onChange={(e) => handleGuestUpdate(guest.id, "dietary_requirements", e.target.value)}
                                        placeholder="e.g. Vegetarian, Gluten Free, etc."
                                        style={styles.textarea}
                                    />
                                </div>
                            )}

                            {index < household.guests.length - 1 && <hr style={styles.divider} />}
                        </div>
                    ))}

                    <button
                        type="submit"
                        disabled={submitting}
                        style={submitting ? styles.btnDisabled : styles.btnPrimary}
                    >
                        {submitting ? "Sending..." : "Submit RSVP"}
                    </button>
                </form>
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
        background: "#f5f0e8",
        fontFamily: "'Cormorant Garamond', serif",
    },
    loading: {
        fontSize: "20px",
        color: "#a0917f",
        fontStyle: "italic",
    },
    card: {
        background: "#fff",
        padding: "40px 30px",
        borderRadius: "20px",
        width: "100%",
        maxWidth: "500px",
        boxShadow: "0 10px 30px rgba(60,45,30,0.08)",
        textAlign: "center",
        animation: "fadeIn 0.6s ease-out",
    },
    label: {
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "12px",
        letterSpacing: "3px",
        textTransform: "uppercase",
        color: "#a0917f",
        marginBottom: "8px",
    },
    title: {
        fontSize: "32px",
        fontWeight: 500,
        color: "#3d2e1f",
        marginBottom: "30px",
    },
    text: {
        fontSize: "18px",
        lineHeight: "1.6",
        color: "#6b5443",
        marginBottom: "24px",
    },
    form: {
        textAlign: "left",
    },
    guestSection: {
        marginBottom: "24px",
    },
    guestName: {
        fontSize: "22px",
        fontWeight: 600,
        color: "#3d2e1f",
        marginBottom: "16px",
    },
    radioGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        marginBottom: "16px",
    },
    radioLabel: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        fontSize: "18px",
        color: "#4a3728",
        cursor: "pointer",
    },
    inputGroup: {
        marginTop: "16px",
    },
    smallLabel: {
        display: "block",
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "11px",
        textTransform: "uppercase",
        letterSpacing: "1px",
        color: "#a0917f",
        marginBottom: "6px",
    },
    textarea: {
        width: "100%",
        padding: "12px",
        borderRadius: "10px",
        border: "1px solid rgba(140,110,85,0.15)",
        background: "#fdf8f2",
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: "16px",
        minHeight: "80px",
        resize: "vertical",
        outline: "none",
    },
    divider: {
        border: "none",
        borderTop: "1px solid #f0e6da",
        margin: "24px 0",
    },
    btnPrimary: {
        width: "100%",
        padding: "16px",
        borderRadius: "12px",
        border: "none",
        background: "#4a3728",
        color: "#faf5ef",
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "16px",
        fontWeight: 600,
        cursor: "pointer",
        marginTop: "10px",
        transition: "background 0.2s",
    },
    btnSecondary: {
        padding: "10px 20px",
        borderRadius: "8px",
        border: "1px solid #d4c8ba",
        background: "transparent",
        color: "#a0917f",
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "14px",
        cursor: "pointer",
    },
    btnDisabled: {
        width: "100%",
        padding: "16px",
        borderRadius: "12px",
        border: "none",
        background: "#a0917f",
        color: "#faf5ef",
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "16px",
        fontWeight: 600,
        cursor: "not-allowed",
        marginTop: "10px",
    },
    successIcon: {
        fontSize: "48px",
        marginBottom: "20px",
    }
};
