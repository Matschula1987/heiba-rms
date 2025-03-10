import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default function Home() {
  // Prüfen Sie, ob der Benutzer authentifiziert ist
  const cookieStore = cookies();
  const authToken = cookieStore.get("auth_token"); // Passen Sie den Namen des Auth-Cookies an
  
  if (!authToken) {
    // Wenn nicht authentifiziert, zur Login-Seite weiterleiten
    redirect("/login");
  }
  
  // Wenn authentifiziert, zur Dashboard-Seite weiterleiten
  redirect("/dashboard");
}
