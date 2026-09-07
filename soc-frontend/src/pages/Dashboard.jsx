import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {jwtDecode} from "jwt-decode";
import { useTickets } from '../context/TicketContext';

const Dashboard = () => {

  const {tickets, setTickets} = useTickets();
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
  const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const decodedPayload = jwtDecode(token);
        setUserRole(decodedPayload.role);

        // Fetch the baseline data on mount
        const res = await fetch('http://localhost:3000/api/tickets', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await res.json();
        if(!res.ok) throw new Error(data.error || "Failed to fetch tickets");
        
        // Populate the UI with historical records
        setTickets(data); 
      }
    } catch (error) {
      setError(error.message);
    }
  };

  fetchInitialData();
}, [setTickets]);

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
        body: JSON.stringify({title, description, severity})
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to create ticket");

      // Clears the input boxes
      setTitle('');
      setDescription('');
      setSeverity('LOW');

    }
    catch(error){
      setError(error.message);
    }

  }

  // Helper function to update a ticket in the array
  const handleUpdateStatus = async (ticketId, newStatus) => {
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
      if(!response.ok) throw new Error(data.message || "Failed to update ticket status");
    }
    catch(err){
      setError(err.message);
    }
  };

  const handleSaveEdit = async (ticketId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update ticket');

      // The WebSocket context will hear the update and refresh the data automatically.
      // We only need to exit edit mode!
      setEditingId(null); 
    } catch (err) {
      setError(err.message);
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
    <div className="p-5 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800">Ticket Dashboard</h2>
      {/* <p>This is the secure zone where all the database records will be displayed.</p> */}
      <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow transition-colors">Logout</button>
      {error && <p style={{color: "red"}}>{error}</p>}

      {/* Create Ticket Card */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">Create a New Ticket</h3>
        <form onSubmit={handleCreateTicket} className="flex flex-col gap-4">
          <input
          type="text"
          placeholder="Ticket Title"
          value={title}
          onChange={(e)=>setTitle(e.target.value)}
          required
          className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
          type="text"
          placeholder="Ticket Description"
          value={description}
          onChange={(e)=>setDescription(e.target.value)}
          className="border border-gray-300 rounded px-4 py-2 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select value={severity}
          onChange={(e)=>setSeverity(e.target.value)}
          className="border border-gray-300 rounded px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">Create Ticket</button>
        </form>
      </div>
      <div className="flex flex-col gap-4">
        {tickets.map((ticket) => (
        <div key={ticket.id} className="bg-white border border-gray-200 p-5 rounded-lg shadow-sm relative hover:shadow-md transition-shadow">
    
          {/* Admin Delete Button */}
          {userRole === 'ADMIN' && (
            <button onClick={() => handleDeleteTicket(ticket.id)} className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded transition-colors">Delete</button>
          )}

          {/* Toggle between Edit Form and View Mode */}
          {editingId === ticket.id ? (
            <div className="flex flex-col gap-3 w-4/5">
              <input type="text" value={editForm.title} onChange={(e) => setEditForm({...editForm, title: e.target.value})} className="border border-gray-300 rounded px-3 py-1"/>
              <textarea value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})} className="border border-gray-300 rounded px-3 py-1 min-h-[60px]"/>
              <select value={editForm.severity} onChange={(e) => setEditForm({...editForm, severity: e.target.value})} className="border border-gray-300 rounded px-3 py-1 w-32">
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
              <div className="flex gap-2 mt-2">
                <button onClick={() => handleSaveEdit(ticket.id)} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded">Save</button>
                <button onClick={() => setEditingId(null)} className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              {/* The standard view */}
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-gray-800 m-0">{ticket.title}</h3>
                <button onClick={() => startEditing(ticket)} className="text-sm text-blue-500 hover:text-blue-700 underline">Edit</button>
              </div>
              <p className="text-gray-600 mb-4">{ticket.description}</p>
              
              <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                <span className="bg-blue-50 text-blue-800 px-2 py-1 rounded border border-blue-200">
                <strong className="mr-1">Status:</strong>
                <select 
                  value={ticket.status} 
                  onChange={(e) => handleUpdateStatus(ticket.id, e.target.value)}
                  className="bg-transparent font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="OPEN">OPEN</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                </select>
                </span>
                <span className="bg-orange-50 text-orange-800 px-2 py-1 rounded border border-orange-200">
                  <strong>Severity:</strong> {ticket.severity}
                </span>
                <span className="bg-gray-50 text-gray-800 px-2 py-1 rounded border border-gray-200">
                  <strong>Author:</strong> {ticket.author?.email || 'Unknown'}
                </span>
              </div>
            </>
          )}
        </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;