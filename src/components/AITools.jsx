import { Wand2, Search } from "lucide-react";
import { useState } from "react";

export function AITools({ project, setProject }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState("");
  const [loading, setLoading] = useState(false);

  async function generateCopy() {
    setLoading(true);
    setResults("");

    try {
      const r = await fetch("http://localhost:3001/api/ai-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: project.business.name,
          businessType: project.business.type,
          services: project.services
        })
      });

      const data = await r.json();
      setResults(data.text || data.error || "No hubo respuesta.");
    } catch {
      setResults("El backend no está corriendo. Usa npm run dev:full o configura server/.env.");
    } finally {
      setLoading(false);
    }
  }

  async function searchWeb() {
    if (!query.trim()) return;
    setLoading(true);
    setResults("");

    try {
      const r = await fetch(`http://localhost:3001/api/search?q=${encodeURIComponent(query)}`);
      const data = await r.json();

      if (data.error) {
        setResults(data.error);
      } else {
        setResults(data.results.map((item, i) => `${i + 1}. ${item.title}\n${item.snippet}\n${item.link}`).join("\n\n"));
      }
    } catch {
      setResults("El backend no está corriendo o falta SERPAPI_KEY.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panelSection">
      <h3>IA y búsqueda real opcional</h3>
      <p className="hint">
        Esto requiere backend Node y API keys. El builder funciona sin esto.
      </p>

      <div className="actions">
        <button onClick={generateCopy} className="btn secondary"><Wand2 size={16} /> Generar textos IA</button>
      </div>

      <label>
        Buscar información real
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ejemplo: talleres mecánicos Louisville KY" />
      </label>

      <button onClick={searchWeb} className="btn secondary"><Search size={16} /> Buscar</button>

      {loading && <p className="hint">Procesando...</p>}
      {results && <pre className="aiResults">{results}</pre>}
    </section>
  );
}
