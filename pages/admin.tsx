import { useEffect } from "react";

export default function AdminRedirect() {
  useEffect(() => {
    // Redirige al panel estático de Decap en /public/admin/index.html
    if (typeof window !== "undefined") {
      window.location.replace("/admin/index.html");
    }
  }, []);

  return (
    <div style={{padding: 24, fontFamily: "system-ui, sans-serif"}}>
      Redirigiendo al panel de administración…
    </div>
  );
}
