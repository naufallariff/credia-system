const axios = require('axios');
const runner = require('../lib/TestRunner');

const API_URL = 'http://localhost:5000/api';

const run = async () => {
    runner.group('07. Real-time Notification & Alerts');

    // Context from previous runs
    const staffToken = runner.getContext('STAFF_TOKEN');
    const adminToken = runner.getContext('ADMIN_TOKEN');
    const clientToken = runner.getContext('CLIENT_TOKEN');

    let ticketNo;
    let notificationId;

    // 1. TRIGGER EVENT
    runner.doc(
        'Trigger: System Event Generation',
        'When Staff creates a Ticket, System must broadcast a notification to Admins.'
    );
    await runner.test('Setup: Staff triggers an alert (Create Ticket)', async () => {
        const res = await axios.post(`${API_URL}/tickets`, {
            targetModel: 'CONTRACT',
            targetId: runner.getContext('ACTIVE_CONTRACT_ID'), 
            
            // FIX: Gunakan Enum yang VALID (UPDATE)
            requestType: 'UPDATE', 
            
            reason: 'Testing Notification Delivery',
            proposedData: { note: "Test change" }
        }, { headers: { Authorization: `Bearer ${staffToken}` } });

        runner.assertStatus(res, 201);
        ticketNo = res.data.data.ticket_no;
        
        // Simpan ID tiket agar test berikutnya aman
        runner.setContext('TEST_TICKET_ID', res.data.data._id); 
        
        runner.assertTruthy(ticketNo, 'Ticket Number generated');
    });

    // 2. DELIVERY CHECK (ADMIN)
    runner.doc(
        'Delivery: Role-Based Broadcasting',
        'Admin must receive a WARNING notification containing the specific Ticket Number.'
    );
    await runner.test('Verification: Admin receives the alert', async () => {
        const res = await axios.get(`${API_URL}/notifications`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });

        runner.assertStatus(res, 200);

        const list = res.data.data.list;
        // Search for the specific notification
        const targetNotif = list.find(n => n.message && n.message.includes(ticketNo));

        if (!targetNotif) {
            throw new Error(`Notification for Ticket ${ticketNo} not found in Admin inbox`);
        }

        runner.assertEquals(targetNotif.type, 'WARNING', 'Alert Level');
        runner.assertEquals(targetNotif.is_read, false, 'Initial Read Status');

        notificationId = targetNotif._id;
    });

    // 3. ACTION: MARK AS READ
    runner.doc(
        'Action: State Change (Mark as Read)',
        'When user clicks a notification, system must update status to is_read: true.'
    );
    await runner.test('Success: Admin marks notification as read', async () => {
        const res = await axios.patch(`${API_URL}/notifications/${notificationId}/read`, {}, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });

        runner.assertStatus(res, 200);

        // Verify update
        const checkRes = await axios.get(`${API_URL}/notifications`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        const updatedNotif = checkRes.data.data.list.find(n => n._id === notificationId);
        runner.assertEquals(updatedNotif.is_read, true, 'Updated Read Status');
    });

    // 4. PRIVACY / ISOLATION
    runner.doc(
        'Privacy: Data Isolation',
        'Clients MUST NOT receive internal operational notifications intended for Admins.'
    );
    await runner.test('Security: Client does not see Admin alerts', async () => {
        const res = await axios.get(`${API_URL}/notifications`, {
            headers: { Authorization: `Bearer ${clientToken}` }
        });

        const list = res.data.data.list;
        const leakedNotif = list.find(n => n.message && n.message.includes(ticketNo));

        if (leakedNotif) {
            throw new Error('Critical: Client received internal Admin notification!');
        }

        runner.assertStatus(res, 200);
    });

    // 5. BULK ACTION
    runner.doc(
        'Usability: Bulk Update (Mark All Read)',
        'User should be able to clear all unread badges in one action.'
    );
    await runner.test('Success: Mark ALL notifications as read', async () => {
        const res = await axios.patch(`${API_URL}/notifications/read-all`, {}, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });

        runner.assertStatus(res, 200);

        // Verify count is 0
        const checkRes = await axios.get(`${API_URL}/notifications`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        runner.assertEquals(checkRes.data.data.unread_count, 0, 'Unread Count');
    });
};

module.exports = run;