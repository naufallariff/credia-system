const ticketService = require('../services/ticketService');
const ModificationTicket = require('../models/ModificationTicket');
const { successResponse, errorResponse } = require('../utils/response');
const { logActivity } = require('../services/logService');

/**
 * Create Request Ticket
 * Generates a new modification request for sensitive data changes.
 */
const createRequest = async (req, res, next) => {
    try {
        const { targetModel, targetId, requestType, proposedData, reason } = req.body;

        const ticket = await ticketService.createTicket(
            req.user.id, targetModel, targetId, requestType, proposedData, reason
        );

        // LOGGING: TICKET CREATION
        logActivity(
            req,
            'CREATE_TICKET',
            `Created modification ticket [${requestType}] for ${targetModel}`,
            'ModificationTicket',
            ticket._id
        );

        return successResponse(res, 'Ticket created successfully', ticket, 201);
    } catch (error) {
        next(error);
    }
};

/**
 * Approve/Reject Ticket
 * Processes the ticket and applies changes if approved.
 */
const approveRequest = async (req, res, next) => {
    try {
        const { ticketId } = req.params;
        const { action, note } = req.body;

        // Security: Segregation of Duties (SoD)
        // Staff are typically Makers, not Approvers.
        if (req.user.role === 'STAFF') {
            return errorResponse(res, 'Staff role is not authorized to approve tickets', 403);
        }

        const result = await ticketService.processTicket(
            ticketId, req.user.id, action, note
        );

        // LOGGING: TICKET RESOLUTION
        logActivity(
            req,
            action, // 'APPROVE' or 'REJECT'
            `Ticket ${result.ticket_no} resolved. Action: ${action}`,
            'ModificationTicket',
            result._id
        );

        return successResponse(res, `Ticket ${action.toLowerCase()} successful`, result);
    } catch (error) {
        next(error);
    }
};

/**
 * Get Tickets
 * Retrieves ticket history based on user role scope.
 */
const getTickets = async (req, res, next) => {
    try {
        const filter = req.user.role === 'STAFF' ? { requester_id: req.user.id } : {};

        const tickets = await ModificationTicket.find(filter)
            .populate('requester_id', 'name custom_id')
            .sort({ createdAt: -1 })
            .lean();

        return successResponse(res, 'Tickets retrieved successfully', tickets);
    } catch (error) {
        next(error);
    }
};

module.exports = { createRequest, approveRequest, getTickets };