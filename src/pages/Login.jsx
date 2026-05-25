import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setErrorMessage("");

    try {
      const res = await api.post("/auth/login", {
        email,
        password
      });

      localStorage.setItem("token", res.data.token);

      localStorage.setItem(
        "user",
        JSON.stringify(res.data.user)
      );

      if (res.data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/cliente");
      }

    } catch (error) {
      console.log("LOGIN ERROR COMPLETO:", error);
      console.log("RESPUESTA:", error.response);
      console.log("API URL:", import.meta.env.VITE_API_URL);

      const message =
        error.response?.data?.error ||
        error.message ||
        "Error iniciando sesión";

      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background:
          "radial-gradient(circle at top, rgba(250,204,21,0.18), transparent 35%), linear-gradient(rgba(0,0,0,0.80), rgba(0,0,0,0.92)), url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1600&auto=format&fit=crop')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: "20px"
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          width: "100%",
          maxWidth: "430px",
          background: "rgba(10,10,10,0.94)",
          border: "1px solid rgba(250,204,21,0.75)",
          borderRadius: "26px",
          padding: "40px 30px",
          WebkitBackdropFilter: "blur(10px)",
          backdropFilter: "blur(10px)",
          boxShadow:
            "0 0 45px rgba(0,0,0,0.65), 0 0 35px rgba(250,204,21,0.10)"
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "32px"
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              margin: "0 auto 18px",
              borderRadius: "22px",
              background:
                "linear-gradient(135deg, #facc15, #fff3a3)",
              color: "#000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              fontWeight: "900",
              boxShadow: "0 15px 35px rgba(250,204,21,0.22)"
            }}
          >
            DLB
          </div>

          <h1
            style={{
              color: "#facc15",
              fontSize: "40px",
              marginBottom: "10px",
              fontWeight: "900",
              letterSpacing: "-1px"
            }}
          >
            SitiosWebDLB
          </h1>

          <p
            style={{
              color: "#d1d5db",
              fontSize: "15px",
              lineHeight: "1.5",
              margin: 0
            }}
          >
            Panel profesional de clientes y administración
          </p>
        </div>

        {errorMessage && (
          <div
            style={{
              background: "rgba(239,68,68,0.12)",
              color: "#fecaca",
              border: "1px solid rgba(239,68,68,0.45)",
              borderRadius: "14px",
              padding: "13px",
              marginBottom: "18px",
              fontSize: "14px",
              fontWeight: "700"
            }}
          >
            {errorMessage}
          </div>
        )}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px"
          }}
        >
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            autoComplete="email"
            required
            onChange={(e) =>
              setEmail(e.target.value)
            }
            style={{
              padding: "16px",
              borderRadius: "14px",
              border: "1px solid rgba(255,255,255,0.14)",
              background: "#111827",
              color: "#fff",
              fontSize: "16px",
              outline: "none"
            }}
          />

          <div
            style={{
              position: "relative"
            }}
          >
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              value={password}
              autoComplete="current-password"
              required
              onChange={(e) =>
                setPassword(e.target.value)
              }
              style={{
                width: "100%",
                padding: "16px 52px 16px 16px",
                borderRadius: "14px",
                border: "1px solid rgba(255,255,255,0.14)",
                background: "#111827",
                color: "#fff",
                fontSize: "16px",
                outline: "none"
              }}
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword((prev) => !prev)
              }
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                color: "#facc15",
                border: "none",
                cursor: "pointer",
                fontSize: "18px",
                padding: "8px"
              }}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? "#9ca3af" : "#facc15",
              color: "#000",
              border: "none",
              padding: "16px",
              borderRadius: "14px",
              fontSize: "18px",
              fontWeight: "900",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.85 : 1,
              marginTop: "4px"
            }}
          >
            {loading ? "Entrando..." : "Entrar al panel"}
          </button>
        </div>

        <p
          style={{
            textAlign: "center",
            color: "#9ca3af",
            fontSize: "12px",
            marginTop: "24px",
            marginBottom: 0
          }}
        >
          Acceso privado para clientes y administración.
        </p>
      </form>
    </div>
  );
}