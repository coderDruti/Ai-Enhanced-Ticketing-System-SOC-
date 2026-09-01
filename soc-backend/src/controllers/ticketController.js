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
            },
            include:{
                author: {
                    select:{
                        id:true,
                        email:true,
                        role:true,
                    }
                }
            }
        });

        req.io.emit("ticket_created", ticket);

        res.status(201).json({message: 'Ticket created successfully', ticket});
    } catch (error) {
        console.error("Error creating ticket:", error);
        res.status(500).json({message: 'Server error. Failed to create ticket'});
    }
};

// ----2. Get All Tickets----
const getAllTickets = async (req, res) =>{
    try{
        const userId = req.user.userId;
        const userRole = req.user.role;

        let tickets;
        if(userRole === 'ADMIN'){
            tickets = await prisma.ticket.findMany({
                include:{
                    author: {
                        select:{
                            id: true,
                            email: true,
                            role: true,
                        }
                    }
                },
                orderBy:{createdAt: "desc"}       
            });
        }
        else{
            tickets = await prisma.ticket.findMany({
                where: {authorId:userId},
                orderBy:{createdAt:"desc"},
                include:{
                    author:{
                        select:{
                            id: true,
                            email:true,
                            role:true,
                        }
                    }
                }
            });
        }

        res.status(200).json(tickets);
    }catch(error){
        console.error("Error fetching tickets:", error);
        res.status(500).json({message: 'Server error. Failed to fetch tickets'});
    }
};

//3. UPDATE A TICKET
const updateTicket = async (req, res)=>{
    try{
        const ticketId = parseInt(req.params.id);
        const {title, description, severity} = req.body;
        const userId = req.user.userId;
        const userRole = req.user.role;

        //get original ticket
        const existingTicket = await prisma.ticket.findUnique({
            where: {id:ticketId}
        });

        if(!existingTicket) return res.status(404).json({message: "Ticket not found"});
        
        if (existingTicket.authorId !== userId && userRole !== 'ADMIN'){
            return res.status(403).json({message: "Unauthorized. You can only update your own tickets"});
        }

        const updatedTicket = await prisma.ticket.update({
            where:{id:ticketId},
            data: {title, description, severity},
            include:{
                author:{
                    select:{
                        id: true,
                        email:true,
                        role:true,
                    }
                }
            }
        });

        req.io.emit("ticket_updated", updatedTicket);

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

        req.io.emit("ticket_deleted", parseInt(id));
        
        res.status(200).json({message: "Ticket deleted successfully"});
    }
    catch(error){
        console.error("Error deleting ticket:", error);
        res.status(500).json({message: 'Server error. Failed to delete ticket'});
    }
};

const updateTicketStatus = async (req, res) => {
    try {
        const ticketId = parseInt(req.params.id);
        const { status } = req.body;

        const updatedTicket = await prisma.ticket.update({
            where:{id:ticketId},
            data:{status},
            include:{
                author:{
                    select:{
                        id: true,
                        email:true,
                        role:true,
                    }
                }
            }
        });

        req.io.emit("ticket_updated", updatedTicket);

        res.status(200).json({message: "Ticket status updated successfully", ticket:updatedTicket});
    } catch (error) {
        console.error("Error updating ticket:",error);
        res.status(500).json({message: 'Server error. Failed to update ticket status'});
    }
};

module.exports={createTicket, getAllTickets, updateTicket, deleteTicket, updateTicketStatus}