const ticketService = require('../services/ticketService');
const ModificationTicket = require('../models/ModificationTicket');
const { sendResponse } = require('../utils/response');

const createRequest = async (req, res, next) => {
    try {
        const { targetModel, targetId, requestType, proposedData, reason } = req.body;
        const ticket = await ticketService.createTicket(
            req.user.id, targetModel, targetId, requestType, proposedData, reason
        );
        sendResponse(res, 201, true, 'Ticket created', ticket);
    } catch (error) {
        next(error);
    }
};

const approveRequest = async (req, res, next) => {
    try {
        const { ticketId } = req.params;
        const { action, note } = req.body;

        // Security Check
        if (req.user.role === 'STAFF') {
            return sendResponse(res, 403, false, 'Staff cannot approve tickets');
        }

        const result = await ticketService.processTicket(
            ticketId, req.user.id, action, note
        );

        sendResponse(res, 200, true, `Ticket ${action} successful`, result);
    } catch (error) {
        next(error);
    }
};

const getTickets = async (req, res, next) => {
    try {
        const filter = req.user.role === 'STAFF' ? { requester_id: req.user.id } : {};
        const tickets = await ModificationTicket.find(filter)
            .populate('requester_id', 'name custom_id')
            .sort({ createdAt: -1 })
            .lean();

        sendResponse(res, 200, true, 'Tickets retrieved', tickets);
    } catch (error) {
        next(error);
    }
};

module.exports = { createRequest, approveRequest, getTickets };