import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { ShieldCheck } from "lucide-react";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
        const res = await api.post("/auth/login", formData);
        const userData = res.data.data;

        // Security: Store minimal user info
        sessionStorage.setItem("user", JSON.stringify(userData));
        navigate("/");
        } catch (err) {
        console.error(err);
        const msg =
            err.response?.data?.message ||
            "Authentication failed. Please check your credentials.";
        setError(msg);
        } finally {
        setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex w-full font-sans">
        {/* Brand Section (Left) */}
        <div className="hidden lg:flex w-1/2 bg-credia-950 relative overflow-hidden flex-col justify-between p-16">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-credia-800/40 via-transparent to-transparent opacity-50"></div>

            <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-credia-600 rounded-xl shadow-glow">
                <ShieldCheck className="text-white" size={28} />
                </div>
                <span className="text-2xl font-bold text-white tracking-tight">
                Credia System
                </span>
            </div>
            <h2 className="text-4xl font-bold text-white leading-tight mb-4">
                Secure Financial <br /> Management Engine.
            </h2>
            <p className="text-credia-200 text-lg max-w-md">
                Enterprise-grade loan lifecycle management with real-time analytics
                and banking-standard security.
            </p>
            </div>

            <div className="relative z-10 text-credia-400 text-xs tracking-widest uppercase">
            © 2025 Credia System Inc.
            </div>
        </div>

        {/* Form Section (Right) */}
        <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8">
            <div className="w-full max-w-md">
            <div className="mb-10">
                <h3 className="text-2xl font-bold text-slate-900">Sign In</h3>
                <p className="text-slate-500 mt-2">Access your secure dashboard.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                label="Username"
                name="username"
                placeholder="Enter your system ID"
                value={formData.username}
                onChange={handleChange}
                error={error && " "} // Visual indicator only on input, message below
                disabled={loading}
                autoFocus
                />

                <Input
                label="Password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                />

                {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
                    {error}
                </div>
                )}

                <div className="pt-2">
                <Button
                    type="submit"
                    className="w-full justify-center py-3"
                    isLoading={loading}
                >
                    Authenticate Access
                </Button>
                </div>
            </form>

            <div className="mt-8 text-center">
                <p className="text-xs text-slate-400">
                Authorized personnel only. All activities are monitored.
                </p>
            </div>
            </div>
        </div>
        </div>
    );
};

export default Login;
