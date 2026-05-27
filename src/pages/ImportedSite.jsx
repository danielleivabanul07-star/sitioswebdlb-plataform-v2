import { useParams } from "react-router-dom";

export default function ImportedSite() {
  const { clientId } = useParams();

  const siteUrl = `https://sitioswebdlb-api.onrender.com/imported-sites/${clientId}/index.html`;

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        background: "#000"
      }}
    >
      <iframe
        src={siteUrl}
        title="Imported Site"
        style={{
          width: "100%",
          height: "100%",
          border: "none"
        }}
      />
    </div>
  );
}