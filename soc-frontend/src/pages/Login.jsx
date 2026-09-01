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
            throw new Error(data.error || "Login failed");
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
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h1>
        {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-2 rounded border border-red-200">{error}</p>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-sm font-semibold text-gray-600">Email</label>
              <input type="email" id="email" name="email" value={email}
              onChange={(e)=>setEmail(e.target.value)}
              required className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="text-sm font-semibold text-gray-600">Password</label>
              <input type="password" id="password" name="password" value={password}
              onChange={(e)=>setPassword(e.target.value)}
              required 
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            </div>
            
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors mt-2 cursor-pointer">Login</button>
          <button type="reset" onClick={handleReset} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded transition-colors mt-2 cursor-pointer">Reset Form</button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-6">
          Need an account? <Link to="/register" className="text-blue-500 hover:underline">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;