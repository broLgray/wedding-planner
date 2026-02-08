"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchByToken, fetchWeddingProfile } from "@/lib/guests";

export default function InvitePage() {
    const { token } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (token) {
            loadInvitation();
        }
    }, [token]);

    async function loadInvitation() {
        setLoading(true);
        const household = await fetchByToken(token);
        if (household) {
            const profile = await fetchWeddingProfile(household.user_id);
            setData({ household, profile });
        } else {
            setError("We couldn't find your invitation. Please check the link.");
        }
        setLoading(false);
    }

    if (loading) return <div style={styles.container}><p style={styles.loading}>Opening your invitation...</p></div>;
    if (error) return <div style={styles.container}><div style={styles.card}><h1 style={styles.title}>Oops!</h1><p style={styles.text}>{error}</p></div></div>;

    const { household, profile } = data;
    const weddingDate = profile?.wedding_date ? new Date(profile.wedding_date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC'
    }) : "Date TBA";

    return (
        <div style={styles.container}>
            <div style={styles.inviteCard}>
                <div style={styles.borderInner}>
                    <p style={styles.subtitle}>You are cordially invited to the wedding of</p>
                    <h1 style={styles.names}>{profile?.partner_names || "The Happy Couple"}</h1>

                    <div style={styles.divider}>✨</div>

                    <p style={styles.date}>{weddingDate}</p>

                    <div style={styles.householdSection}>
                        <p style={styles.forText}>Specially prepared for</p>
                        <h2 style={styles.householdName}>{household.name}</h2>
                    </div>

                    <div style={styles.qrSection}>
                        <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(typeof window !== 'undefined' ? `${window.location.origin}/rsvp/${token}` : '')}`}
                            alt="RSVP QR Code"
                            style={styles.qrImage}
                        />
                        <p style={styles.qrHint}>Scan to RSVP</p>
                    </div>

                    <a href={`/rsvp/${token}`} style={styles.rsvpBtn}>
                        RSVP Online
                    </a>
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
    loading: { fontSize: "20px", color: "#a0917f", fontStyle: "italic" },
    inviteCard: {
        background: "#fff",
        padding: "15px",
        borderRadius: "4px",
        width: "100%",
        maxWidth: "450px",
        boxShadow: "0 10px 40px rgba(60,45,30,0.1)",
        border: "1px solid #efe8dc",
        textAlign: "center",
        animation: "fadeIn 1s ease-out",
    },
    borderInner: {
        border: "1px solid #d4c8ba",
        padding: "50px 30px",
        height: "100%",
    },
    subtitle: {
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "11px",
        letterSpacing: "3px",
        textTransform: "uppercase",
        color: "#a0917f",
        marginBottom: "20px",
    },
    names: {
        fontSize: "42px",
        fontWeight: 500,
        color: "#3d2e1f",
        margin: "0 0 20px 0",
        lineHeight: "1.1",
    },
    divider: {
        fontSize: "24px",
        color: "#d4c8ba",
        marginBottom: "20px",
    },
    date: {
        fontSize: "20px",
        color: "#6b5443",
        marginBottom: "40px",
        fontStyle: "italic",
    },
    householdSection: {
        marginBottom: "30px",
    },
    forText: {
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "10px",
        textTransform: "uppercase",
        letterSpacing: "1px",
        color: "#b5a898",
        margin: 0,
    },
    householdName: {
        fontSize: "24px",
        fontWeight: 400,
        color: "#4a3728",
        marginTop: "5px",
    },
    qrSection: {
        marginBottom: "30px",
        opacity: 0.8,
    },
    qrImage: {
        width: "120px",
        height: "120px",
        margin: "0 auto 10px",
        display: "block",
    },
    qrHint: {
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "10px",
        color: "#a0917f",
        textTransform: "uppercase",
    },
    rsvpBtn: {
        display: "inline-block",
        padding: "14px 40px",
        background: "#4a3728",
        color: "#fff",
        textDecoration: "none",
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "14px",
        fontWeight: 500,
        borderRadius: "2px",
        textTransform: "uppercase",
        letterSpacing: "1px",
        transition: "opacity 0.2s",
    },
    title: { fontSize: "32px", color: "#3d2e1f", marginBottom: "20px" },
    text: { fontSize: "18px", color: "#6b5443" },
};
