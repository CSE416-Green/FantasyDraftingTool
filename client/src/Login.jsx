import { useState } from "react";
import axios from "axios";
import './css/login.css'
export default function Login({ onLogin }) {
    const [isRegistering, setIsRegistering] = useState(false);
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        password: "",
    });
    const [error, setError] = useState("");

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        try {
        if (isRegistering) {
            await axios.post("/user/register", form);
            setIsRegistering(false);
        } else {
            const res = await axios.post("/user/login", {
            email: form.email,
            password: form.password,
            });
            localStorage.setItem("token", res.data.token);
            onLogin?.(res.data.user);
        }
        } catch (err) {
        setError(err.response?.data?.message || "Something went wrong");
        }
    }

    return (
        <div className="login-page">
        <h1 className="login-title">Fantasy Baseball Draft Kit</h1>
        <div className="login-wrap">
            <h2 className="login-header">{isRegistering ? "Register" : "Login"}</h2>
            <div className="login-body">
            <form onSubmit={handleSubmit}>
                {isRegistering && (
                <>
                    <div className="login-field">
                    <label>First Name:</label>
                    <input className="login-input" name="firstName" value={form.firstName} onChange={handleChange} />
                    </div>
                    <div className="login-field">
                    <label>Last Name:</label>
                    <input className="login-input" name="lastName" value={form.lastName} onChange={handleChange} />
                    </div>
                    <div className="login-field">
                    <label>Username:</label>
                    <input className="login-input" name="username" value={form.username} onChange={handleChange} />
                    </div>
                </>
                )}
                <div className="login-field">
                <label>Email:</label>
                <input className="login-input" type="email" name="email" value={form.email} onChange={handleChange} />
                </div>
                <div className="login-field">
                <label>Password:</label>
                <input className="login-input" type="password" name="password" value={form.password} onChange={handleChange} />
                </div>
                {error && <p className="login-error">{error}</p>}
                <div className="login-buttons">
                <button className="form-buttom" type="submit">
                    {isRegistering ? "Register" : "Login"}
                </button>
                </div>
                <div className="login-toggle">
                {isRegistering ? "Already have an account? " : "Don't have an account? "}
                <span onClick={() => setIsRegistering(!isRegistering)}>
                    {isRegistering ? "Login" : "Register"}
                </span>
                </div>
            </form>
            </div>
        </div>
        </div>
    );
}