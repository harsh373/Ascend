import { useEffect, useState, type JSX } from "react";
import { useUser } from "@clerk/clerk-react";
import { getUserProfile } from "../api/userApi";
import { useNavigate } from "react-router-dom";

export default function AuthGate({ children }: { children: JSX.Element }) {
  const { user } = useUser();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

   useEffect(() => {
  const check = async () => {
    if (!user) return;

    try {
      const res = await getUserProfile(user.id);

      console.log("AUTHGATE RESPONSE:", res.data);

      if (!res.data.onboarded) {
        console.log("REDIRECTING TO ONBOARDING");
        navigate("/onboarding", { replace: true });
        return;
      }

      console.log("ALLOWING HOME");
      setReady(true);
    } catch (err) {
      console.error("AUTHGATE ERROR:", err);
      navigate("/onboarding", { replace: true });
    }
  };

  check();
}, [user, navigate]);


  if (!ready) return null;

  return children;
}
