import { useEffect } from "react";
import { useNavigate } from "react-router";

const AuthRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/user", {
          credentials: "include",
        });
        const user = await res.json();

        if (user && user._id) {
          if (user.status === "admin") {
            navigate("/dashboard");
          } else {
            navigate("/");
          }
        } else {
          navigate("/sign-in");
        }
      } catch (err) {
        console.error("Error during auth redirect", err);
        navigate("/sign-in");
      }
    };

    fetchUser();
  }, [navigate]);

  return <p>Redirecting...</p>;
};

export default AuthRedirect;
