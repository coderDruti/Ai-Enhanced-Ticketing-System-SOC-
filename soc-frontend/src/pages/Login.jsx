import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();
    
    const handleSubmit = async(e)=>{
        e.preventDefault();
        setError('');

        try{
           console.log("Preparing to send :", {email, password});
           const res = await fetch("http://localhost:3000/api/auth/login", {
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({email,password}),
           });
           const data = await res.json();

           if(!res.ok){
            throw new Error(data.message ?? "Login failed");
           }
           // Success! Save the JWT to the browser's local storage
           localStorage.setItem("token", data.token);
           navigate("/");
        }
        catch(err){
            console.error(err.message);
            setError(err.message);
        }
    }

    const handleReset = ()=>{
        setEmail("");
        setPassword("");
        setError("");
    }

  return (
    <div>
        <form onSubmit={handleSubmit}>
        {error && <h1 style={{ color:"red" }}>{error}</h1>}
        <label htmlFor="email">Email</label>
        <input type="email" id="email" name="email" value={email}
        onChange={(e)=>setEmail(e.target.value)}
        required />
        <label htmlFor="password">Password</label>
        <input type="password" id="password" name="password" value={password}
        onChange={(e)=>setPassword(e.target.value)}
        required />
        <button type="submit">Login</button>
        <button type="reset" onClick={handleReset}>Reset Form</button>
      </form>
      <p>
        Need an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
};

export default Login;