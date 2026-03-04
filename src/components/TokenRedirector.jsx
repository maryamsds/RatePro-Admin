import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function TokenRedirector() {
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("accessToken");
        const user = params.get("user");
        const redirectTo = params.get("redirect") || "/app";

        console.log("[TokenRedirector] Received params — token:", token ? "present" : "missing", "user:", user ? "present" : "missing", "redirect:", redirectTo);

        if (token && user) {
            try {
                const parsedUser = JSON.parse(decodeURIComponent(user));

                // Save user WITH accessToken embedded (AuthContext reads accessToken from authUser)
                const userWithToken = { ...parsedUser, accessToken: token };
                localStorage.setItem("authUser", JSON.stringify(userWithToken));

                console.log("[TokenRedirector] Auth state saved, redirecting to:", redirectTo);
                navigate(redirectTo, { replace: true });
            } catch (err) {
                console.error("[TokenRedirector] Error parsing user:", err);
                navigate("/login", { replace: true });
            }
        } else {
            console.warn("[TokenRedirector] Missing token or user, redirecting to login");
            navigate("/login", { replace: true });
        }
    }, [navigate]);

    return null;
}

export default TokenRedirector;