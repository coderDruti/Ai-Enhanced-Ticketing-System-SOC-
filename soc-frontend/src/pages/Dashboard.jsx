import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {jwtDecode} from "jwt-decode";

const Dashboard = () => {

  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    severity: ''
  });

  // States for the "Create New Ticket" card
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('LOW');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const decodedPayload = jwtDecode(token);
          setUserRole(decodedPayload.role);
        }

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

  const handleDeleteTicket = async (ticketId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/tickets/${ticketId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete ticket');
      }

      // Success! Remove the ticket from the UI array instantly
      setTickets(tickets.filter(ticket => ticket.id !== ticketId));
    } catch (err) {
      setError(err.message);
    }
  };

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

  // Helper function to update a ticket in the array
  const handleStatusChange = async (ticketId, newStatus) => {
    try{
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({status: newStatus})
      });

      const data = await response.json();
      if(!response.ok) throw new Error(data.error || "Failed to update ticket status");
      setTickets(tickets.map(ticket =>
      ticket.id === ticketId ? data.ticket : ticket
    ));
    }
    catch(err){
      setError(err.message);
    }
  };

  const handleEditClick = async (ticketId) => {
    try{
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      if(!res.ok) throw new Error(data.error || "Failed to update ticket");
      setTickets(tickets.map(ticket =>
        ticket.id === ticketId ? data.ticket : ticket
      ));
      setEditingId(null);
    }catch(error){
      setError(error.message);
    }
  };

  const startEditing = (ticket)=>{
    setEditingId(ticket.id);
    setEditForm({
      title: ticket.title,
      description: ticket.description,
      severity: ticket.severity
    });
  };

  return (
    <>
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

      {tickets.map((ticket) => (
        <div key={ticket.id}>
    
          {/* Admin Delete Button */}
          {userRole === 'ADMIN' && (
            <button onClick={() => handleDeleteTicket(ticket.id)}>Delete</button>
          )}

          {/* Toggle between Edit Form and View Mode */}
          {editingId === ticket.id ? (
            <div>
              <input type="text" value={editForm.title} onChange={(e) => setEditForm({...editForm, title: e.target.value})}/>
              <textarea value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})}/>
              <select value={editForm.severity} onChange={(e) => setEditForm({...editForm, severity: e.target.value})}>
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
              </select>
              <div>
                <button onClick={() => handleSaveEdit(ticket.id)}>Save</button>
                <button onClick={() => setEditingId(null)}>Cancel</button>
              </div>
            </div>
          ) : (
            <>
              {/* The standard view */}
              <div>
                <h3>{ticket.title}</h3>
                <button onClick={() => startEditing(ticket)}>Edit</button>
              </div>
              <p>{ticket.description}</p>
              
              <div>
                <p><strong>Severity:</strong> {ticket.severity}</p>
                <p><strong>Author:</strong> {ticket.author?.email || 'Unknown'}</p>
              </div>
            </>
          )}
        </div>
))}
    </>
  );
};

export default Dashboard;