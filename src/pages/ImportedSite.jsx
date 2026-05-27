import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function ImportedSite() {
  const { clientId } = useParams();

  const [html, setHtml] = useState("");

  useEffect(() => {
    async function loadSite() {
      try {
        const response = await fetch(
          `https://xkehxgpzolkhjmjjscxr.supabase.co/storage/v1/object/public/imported-sites/${clientId}/index.html`
        );

        const text = await response.text();

        setHtml(text);
      } catch (error) {
        console.error(error);
      }
    }

    loadSite();
  }, [clientId]);

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        background: "#000"
      }}
    >
      <iframe
        title="Imported Site"
        srcDoc={html}
        style={{
          width: "100%",
          height: "100%",
          border: "none"
        }}
      />
    </div>
  );
}