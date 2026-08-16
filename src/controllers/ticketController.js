const prisma = require("../db");

// ----1. Create a Ticket----
const createTicket = async (req, res) => {
    try {
        const {title, description} = req.body;

        // The userId is securely provided by our verifyToken middleware!
        const authorId = req.user.userId;

        const ticket = await prisma.ticket.create({
            data: {
                title, 
                description, 
                authorId // Foreign key linking this ticket to the specific User
            }
        });

        res.status(201).json({message: 'Ticket created successfully', ticket});
    } catch (error) {
        console.error("Error creating ticket:", error);
        res.status(500).json({message: 'Server error. Failed to create ticket'});
    }
};

// ----2. Get All Tickets----
const getAllTickets = async (req, res) =>{
    try{
        const tickets = await prisma.ticket.findMany({
            include:{
                author: {
                    select:{
                        id: true,
                        email: true,
                        role: true,
                    }
                }
            },
            orderBy:{
                createdAt: "desc" // Newest Tickets first
            }       
        });

        res.status(200).json(tickets);
    }catch(error){
        console.error("Error fetching tickets:", error);
        res.status(500).json({message: 'Server error. Failed to fetch tickets'});
    }
};

module.exports={createTicket, getAllTickets}