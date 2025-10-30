import { useNavigate } from "react-router-dom";

function TokenRedirector() {
    const navigate = useNavigate();

    // useEffect(() => {
    //     const params = new URLSearchParams(window.location.search);
    //     const token = params.get("token");
    //     const user = params.get("user");

    //     if (token && user) {
    //         localStorage.setItem("token", token);
    //         localStorage.setItem("authUser", user);
    //         navigate("/app"); // 👈 navigate inside router context
    //     } else {
    //         navigate("/login");
    //     }
    // }, [navigate]);
    // useEffect(() => {
    //     const params = new URLSearchParams(window.location.search);
    //     const token = params.get("token");
    //     const user = JSON.parse(decodeURIComponent(params.get("user")));

    //     if (token && user) {
    //         localStorage.setItem("authUser", JSON.stringify(user));
    //         localStorage.setItem("token", token);
    //         navigate("/app");
    //     }
    // }, []);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("accessToken");
        const user = params.get("user");

        if (token && user) {
            try {
                const parsedUser = JSON.parse(decodeURIComponent(user));

                // ✅ Save to localStorage
                localStorage.setItem("authUser", JSON.stringify(parsedUser));
                // localStorage.setItem("token", token);

                // ✅ Redirect to dashboard
                navigate("/app");
            } catch (err) {
                console.error("Error parsing user:", err);
                navigate("/login");
            }
        } else {
            navigate("/login"); // fallback
        }
    }, [navigate]);

    return null;
}

export default TokenRedirector;