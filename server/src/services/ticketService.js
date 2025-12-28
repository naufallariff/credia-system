const ModificationTicket = require('../models/ModificationTicket');
const Contract = require('../models/Contract');
const { generateId } = require('../utils/idGenerator');
const notificationService = require('./notificationService')

// 1. Staff creates a request
const createTicket = async (requesterId, targetModel, targetId, requestType, proposedData, reason) => {
    // Check if there is already a pending ticket for this item
    const existing = await ModificationTicket.findOne({
        target_id: targetId,
        status: 'PENDING'
    });
    
    if (existing) {
        throw { statusCode: 400, message: 'A pending request already exists for this item.' };
    }

    let originalData = {};
    if (targetModel === 'CONTRACT') {
        originalData = await Contract.findById(targetId).lean();
    }

    const ticket = await ModificationTicket.create({
        ticket_no: generateId('TICKET'),
        requester_id: requesterId,
        target_model: targetModel,
        target_id: targetId,
        request_type: requestType,
        original_data: originalData,
        proposed_data: proposedData,
        reason: reason,
        status: 'PENDING'
    });

    await notificationService.notifyRole(
        'ADMIN',
        'WARNING',
        'New Approval Request',
        `Ticket ${ticket.ticket_no}: ${requestType} request on ${targetModel}. Needs review.`,
        ticket.ticket_no
    );

    return ticket;
};

// 2. Admin Approves/Rejects
const processTicket = async (ticketId, adminId, action, adminNote) => {
    const ticket = await ModificationTicket.findById(ticketId);
    if (!ticket) throw { statusCode: 404, message: 'Ticket not found' };
    if (ticket.status !== 'PENDING') throw { statusCode: 400, message: 'Ticket already processed' };

    ticket.approver_id = adminId;
    ticket.admin_note = adminNote;
    ticket.processed_at = new Date();

    if (action === 'REJECT') {
        ticket.status = 'REJECTED';
        await ticket.save();
        return ticket;
    }

    // EXECUTION LOGIC (The "Robot Arm")
    if (action === 'APPROVE') {
        if (ticket.target_model === 'CONTRACT') {
            const contract = await Contract.findById(ticket.target_id);
            
            if (ticket.request_type === 'UPDATE') {
                // Merge changes
                Object.assign(contract, ticket.proposed_data);
            } else if (ticket.request_type === 'VOID') {
                contract.status = 'VOID';
                contract.void_reason = ticket.reason;
            } else if (ticket.request_type === 'ACTIVATE') {
                contract.status = 'ACTIVE';
                contract.contract_no = generateId('CONTRACT'); // Generate Official ID on Activation
                contract.approved_by = adminId;
            }
            
            await contract.save();
        }
        
        ticket.status = 'APPROVED';
        await ticket.save();
    }

    const alertType = action === 'APPROVE' ? 'SUCCESS' : 'ERROR';
    await notificationService.sendNotification(
        ticket.requester_id,
        alertType,
        `Request ${action}D`,
        `Your request ${ticket.ticket_no} has been ${action.toLowerCase()}d. Note: ${adminNote || '-'}`
    );

    return ticket;
};

module.exports = { createTicket, processTicket };