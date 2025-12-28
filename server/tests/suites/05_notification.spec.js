const axios = require('axios');
const runner = require('../lib/TestRunner');

const API_URL = 'http://localhost:5000/api';

const run = async () => {
    runner.group('Notification System & Alerts');

    // 1. Trigger an Event (Staff creates ticket) -> Expect Admin Notification
    await runner.test('Trigger: System generates notification on Event', async () => {
        // Staff creates a dummy ticket
        const ticketRes = await axios.post(`${API_URL}/tickets`, {
            targetModel: 'CONTRACT',
            targetId: global.PENDING_CONTRACT_ID, // reused from previous suite
            requestType: 'EDIT_DATA',
            reason: 'Testing Alerts',
            proposedData: {}
        }, { headers: { Authorization: `Bearer ${global.STAFF_TOKEN}` } });
        
        global.TEST_TICKET_ID = ticketRes.data.data._id;
        global.TEST_TICKET_NO = ticketRes.data.data.ticket_no;
    });

    // 2. Admin checks notifications
    await runner.test('Delivery: Admin receives broadcast notification', async () => {
        const res = await axios.get(`${API_URL}/notifications`, {
            headers: { Authorization: `Bearer ${global.ADMIN_TOKEN}` }
        });

        runner.assertStatus(res, 200);
        
        const notifications = res.data.data.list;
        const alert = notifications.find(n => n.message.includes(global.TEST_TICKET_NO));
        
        runner.assertTruthy(alert, 'Notification for new ticket found');
        runner.assertEquals(alert.type, 'WARNING', 'Alert Level');
        runner.assertEquals(alert.is_read, false, 'Read Status');
        
        global.NOTIF_ID = alert._id;
    });

    // 3. Mark as Read
    await runner.test('Action: Mark notification as read', async () => {
        const res = await axios.put(`${API_URL}/notifications/${global.NOTIF_ID}/read`, {}, {
            headers: { Authorization: `Bearer ${global.ADMIN_TOKEN}` }
        });
        runner.assertStatus(res, 200);
    });
};

module.exports = run;