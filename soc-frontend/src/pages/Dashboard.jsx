import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const Dashboard = () => {

  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState('');

  // States for the "Create New Ticket" card
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('LOW');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const token = localStorage.getItem('token');

        const res = await fetch('http://localhost:3000/api/tickets', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        console.log(res);
        const data = await res.json();

        if(!res.ok) throw new Error(data.error || "Failed to fetch tickets");

        setTickets(data); // Saves PostgreSQL's data into React's memory
      } catch (error) {
        setError(error.message);
      }
    };
    fetchTickets();
  }, []); //The empty array tells React that this runs once on load

  const handleLogout = () => {
      // 1. Destroy the keycard
      localStorage.removeItem('token');
      
      // 2. Instantly kick the user back to the login screen
      navigate('/login');
    };

  const handleCreateTicket = async (e)=>{
    e.preventDefault();
    // Resets the error message
    setError('');

    try{
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({title, description})
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to create ticket");

      setTickets([data.ticket, ...tickets]);
      
      // Clears the input boxes
      setTitle('');
      setDescription('');
      

    }
    catch(error){
      setError(error.message);
    }

  }

  return (
    <div>
      <h2>Ticket Dashboard</h2>
      {/* <p>This is the secure zone where all the database records will be displayed.</p> */}
      <button onClick={handleLogout}>Logout</button>
      {error && <p style={{color: "red"}}>{error}</p>}

      {/* Create Ticket Card */}
      <div>
        <h3>Create a New Ticket</h3>
        <form onSubmit={handleCreateTicket}>
          <input
          type="text"
          placeholder="Ticket Title"
          value={title}
          onChange={(e)=>setTitle(e.target.value)}
          required
          />
          <input
          type="text"
          placeholder="Ticket Description"
          value={description}
          onChange={(e)=>setDescription(e.target.value)}
          />
          <select value={severity}
          onChange={(e)=>setSeverity(e.target.value)}
          >
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
          <button type="submit">Create Ticket</button>
        </form>
      </div>

      {tickets.length === 0?(<p>No Tickets found in the Database</p>): (
        tickets.map((ticket)=>(
          <div key={ticket.id}>
            <h3>{ticket.title}</h3>
            <p>{ticket.description}</p>
            <p>Severity: {ticket.severity}</p>
            <p>Status: {ticket.status}</p>
            <p>Author: {ticket.author?.email || "Unknown"}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default Dashboard;