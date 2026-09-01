import { createContext, useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';

// Create the Context
const TicketContext = createContext();

export const TicketProvider = ({ children }) => {
  const [tickets, setTickets] = useState([]);
  const [socket, setSocket] = useState(null);

  // 1. Initial Load: Fetch existing tickets via REST
  useEffect(() => {
    const fetchTickets = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch('http://localhost:3000/api/tickets', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) setTickets(data);
      } catch (err) {
        console.error("Failed to fetch initial tickets:", err);
      }
    };
    fetchTickets();
  }, []); // Empty array ensures this REST call only happens once

  // 2. Real-Time Connection: Setup Socket.io Listeners
  useEffect(() => {
    // Connect to the Express server
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    // Listen for events broadcasted by the Express controllers
    newSocket.on('ticket_created', (newTicket) => {
      // Add the new ticket to the top of the array
      setTickets((prevTickets) => [newTicket, ...prevTickets]);
    });

    newSocket.on('ticket_updated', (updatedTicket) => {
      // Find the old ticket and swap it with the fresh data
      setTickets((prevTickets) => 
        prevTickets.map(ticket => ticket.id === updatedTicket.id ? updatedTicket : ticket)
      );
    });

    newSocket.on('ticket_deleted', (deletedTicketId) => {
      // Filter the deleted ticket out of the array
      setTickets((prevTickets) => prevTickets.filter(ticket => ticket.id !== deletedTicketId));
    });

    // Cleanup the connection when the user logs out or leaves
    return () => newSocket.close();
  }, []);

  return (
    <TicketContext.Provider value={{ tickets, setTickets, socket }}>
      {children}
    </TicketContext.Provider>
  );
};

// Custom hook to make consuming the context easier
export const useTickets = () => useContext(TicketContext);