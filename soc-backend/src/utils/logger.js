const prisma = require("../db");

const createAuditLog = async (ticketId, userId, action, previousState = null, newState = null) => {
    try {
        await prisma.auditLog.create({
            data: {
                ticketId,
                userId, 
                action,
                // Prisma automatically handles standard JavaScript objects as JSON
                previousState, 
                newState
            }
        });
    } catch (error) {
        console.error(`[Audit Log Error] Ticket ${ticketId}:`, error.message);
    }
};

module.exports = { createAuditLog };