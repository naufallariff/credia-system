const mongoose = require('mongoose');
const ModificationTicket = require('../models/ModificationTicket');
const Contract = require('../models/Contract');
const { generateId } = require('../utils/idGenerator');
const notificationService = require('./notificationService');

/**
 * Creates a new modification request ticket.
 * Enforces duplication check to prevent spamming requests for the same item.
 */
const createTicket = async (requesterId, targetModel, targetId, requestType, proposedData, reason) => {
    // 1. Duplication Check
    const existing = await ModificationTicket.findOne({
        target_id: targetId,
        status: 'PENDING'
    });
    
    if (existing) {
        throw { statusCode: 400, message: 'A pending request already exists for this item.' };
    }

    // 2. Snapshot Original Data (Audit Trail)
    let originalData = {};
    if (targetModel === 'CONTRACT') {
        originalData = await Contract.findById(targetId).lean();
        if (!originalData) throw { statusCode: 404, message: 'Target contract not found.' };
    }

    // 3. Create Ticket
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

    // 4. Notify Admins
    await notificationService.notifyRole(
        'ADMIN',
        'WARNING',
        'New Approval Request',
        `Ticket ${ticket.ticket_no}: ${requestType} request on ${targetModel}. Needs review.`,
        ticket.ticket_no
    );

    return ticket;
};

/**
 * Processes a ticket (Approve/Reject).
 * Uses MongoDB Transactions to ensure data consistency between Ticket and Target Entity.
 */
const processTicket = async (ticketId, adminId, action, adminNote) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const ticket = await ModificationTicket.findById(ticketId).session(session);
        if (!ticket) throw { statusCode: 404, message: 'Ticket not found' };
        if (ticket.status !== 'PENDING') throw { statusCode: 400, message: 'Ticket already processed' };

        // Update Ticket Meta
        ticket.approver_id = adminId;
        ticket.admin_note = adminNote;
        ticket.processed_at = new Date();

        if (action === 'REJECT') {
            ticket.status = 'REJECTED';
            await ticket.save({ session });
        } 
        else if (action === 'APPROVE') {
            // EXECUTION LOGIC (The "Robot Arm")
            if (ticket.target_model === 'CONTRACT') {
                const contract = await Contract.findById(ticket.target_id).session(session);
                
                if (!contract) throw { statusCode: 404, message: 'Target contract no longer exists' };

                if (ticket.request_type === 'UPDATE') {
                    Object.assign(contract, ticket.proposed_data);
                } else if (ticket.request_type === 'VOID') {
                    contract.status = 'VOID';
                    contract.void_reason = ticket.reason;
                } else if (ticket.request_type === 'ACTIVATE') {
                    contract.status = 'ACTIVE';
                    contract.contract_no = generateId('CONTRACT');
                    contract.approved_by = adminId;
                }
                
                await contract.save({ session });
            }
            
            ticket.status = 'APPROVED';
            await ticket.save({ session });
        } else {
            throw { statusCode: 400, message: 'Invalid action type' };
        }

        await session.commitTransaction();
        session.endSession();

        // Notify Requester (Non-blocking, outside transaction)
        const alertType = action === 'APPROVE' ? 'SUCCESS' : 'ERROR';
        notificationService.sendNotification(
            ticket.requester_id,
            alertType,
            `Request ${action}D`,
            `Your request ${ticket.ticket_no} has been ${action.toLowerCase()}d. Note: ${adminNote || '-'}`
        ).catch(console.error);

        return ticket;

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

module.exports = { createTicket, processTicket };