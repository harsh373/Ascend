import { useEffect, useState, type JSX } from "react";
import { useUser } from "@clerk/clerk-react";
import { getUserProfile } from "../api/userApi";
import { useNavigate } from "react-router-dom";

export default function OnboardingGuard({ children }: { children: JSX.Element }) {
  const { user } = useUser();
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const check = async () => {
      if (!user) return;

      const res = await getUserProfile(user.id);

      if (res.data.onboarded) {
        navigate("/");
      } else {
        setAllowed(true);
      }
    };

    check();
  }, [user]);

  if (!allowed) return null;

  return children;
}
