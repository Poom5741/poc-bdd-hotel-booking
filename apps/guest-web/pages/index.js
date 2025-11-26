// pages/index.js
export default function Home() {
    return (
        <main style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            background: "linear-gradient(135deg, #f5f7fa, #c3cfe2)"
        }}>
            <h1 style={{ fontFamily: "'Inter', sans-serif", fontSize: "2.5rem", color: "#333" }}>
                Guest Web Home
            </h1>
            <p style={{ fontFamily: "'Inter', sans-serif", color: "#555" }}>
                Welcome to the StayFlex guest portal.
            </p>
        </main>
    );
}
