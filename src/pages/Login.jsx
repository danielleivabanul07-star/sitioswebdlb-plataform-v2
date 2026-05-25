import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {

    e.preventDefault();

    try {

      const res = await api.post("/auth/login", {
        email,
        password
      });

      localStorage.setItem(
        "token",
        res.data.token
      );

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

      alert(message);
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
          "linear-gradient(rgba(0,0,0,0.75), rgba(0,0,0,0.85)), url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1600&auto=format&fit=crop')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: "20px"
      }}
    >

      <form
        onSubmit={handleLogin}
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "rgba(10,10,10,0.92)",
          border: "1px solid #facc15",
          borderRadius: "24px",
          padding: "40px 30px",
          backdropFilter: "blur(10px)",
          boxShadow: "0 0 40px rgba(0,0,0,0.5)"
        }}
      >

        <div
          style={{
            textAlign: "center",
            marginBottom: "35px"
          }}
        >

          <h1
            style={{
              color: "#facc15",
              fontSize: "42px",
              marginBottom: "10px",
              fontWeight: "800"
            }}
          >
            SitiosWebDLB
          </h1>

          <p
            style={{
              color: "#ccc",
              fontSize: "15px",
              lineHeight: "1.5"
            }}
          >
            Panel profesional de clientes y administración
          </p>

        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px"
          }}
        >

          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            style={{
              padding: "16px",
              borderRadius: "14px",
              border: "1px solid #333",
              background: "#111",
              color: "#fff",
              fontSize: "16px",
              outline: "none"
            }}
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            style={{
              padding: "16px",
              borderRadius: "14px",
              border: "1px solid #333",
              background: "#111",
              color: "#fff",
              fontSize: "16px",
              outline: "none"
            }}
          />

          <button
            type="submit"
            style={{
              background: "#facc15",
              color: "#000",
              border: "none",
              padding: "16px",
              borderRadius: "14px",
              fontSize: "18px",
              fontWeight: "700",
              cursor: "pointer",
              transition: "0.3s"
            }}
          >
            Entrar al panel
          </button>

        </div>

      </form>

    </div>
  );
}