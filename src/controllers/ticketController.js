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

//3. UPDATE A TICKET
const updateTicket = async (req, res)=>{
    try{
        const {id} = req.params;
        const {title, description, status} = req.body;
        const updatedTicket = await prisma.ticket.update({
            where:{id: parseInt(id)},
            data: {title, description, status}
        });

        res.status(200).json({message: "Ticket updated successfully", ticket:updatedTicket});
    }
    catch(error){
        console.error("Error updating ticket:", error);
        res.status(500).json({message: 'Server error. Failed to update ticket'});
    }
};

//4. DELETE A TICKET
const deleteTicket = async (req, res)=>{
    try{
        const {id} = req.params;
        await prisma.ticket.delete({
            where:{id: parseInt(id)}
        });
        res.status(200).json({message: "Ticket deleted successfully"});
    }
    catch(error){
        console.error("Error deleting ticket:", error);
        res.status(500).json({message: 'Server error. Failed to delete ticket'});
    }
};

module.exports={createTicket, getAllTickets, updateTicket, deleteTicket}