const { faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');

/**
 * Seeder for User entities.
 * Creates internal staff (Superadmin, Admin, Staff) and specific client personas
 * for scenario-based testing, followed by mass filler data.
 */
const seedUsers = async () => {
    console.log('[02] Seeding Users (Realistic Personas)...');

    // Pre-calculate hash to avoid repetitive CPU cycles
    const salt = await bcrypt.genSalt(10);
    const defaultPassword = await bcrypt.hash('password123', salt);

    // --- 1. INTERNAL ORGANIZATION (Credia Finance Corp) ---
    // Using strict corporate email format: firstname.lastname@company.com
    const internalUsersData = [
        {
            name: 'Alexander Pierce',
            email: 'alexander.pierce@credia.finance',
            username: 'apierce',
            role: 'SUPERADMIN',
            status: 'ACTIVE',
            custom_id: 'EMP-001'
        },
        {
            name: 'Sarah Jenkins',
            email: 'sarah.jenkins@credia.finance',
            username: 'sjenkins',
            role: 'ADMIN',
            status: 'ACTIVE', // Main Finance Approver
            custom_id: 'EMP-002'
        },
        {
            name: 'Robert "Bob" Vance',
            email: 'robert.vance@credia.finance',
            username: 'rvance',
            role: 'ADMIN',
            status: 'SUSPENDED', // Scenario: Suspended Admin
            custom_id: 'EMP-003'
        },
        {
            name: 'Michael Chang',
            email: 'michael.chang@credia.finance',
            username: 'mchang',
            role: 'ADMIN',
            status: 'ACTIVE', // Auditor
            custom_id: 'EMP-004'
        },
        {
            name: 'Emily Blunt',
            email: 'emily.blunt@credia.finance',
            username: 'eblunt',
            role: 'STAFF',
            status: 'ACTIVE', // Senior Sales
            custom_id: 'EMP-005'
        },
        {
            name: 'David Wallace',
            email: 'david.wallace@credia.finance',
            username: 'dwallace',
            role: 'STAFF',
            status: 'ACTIVE', // Junior Sales
            custom_id: 'EMP-006'
        }
    ];

    const createdInternals = await User.insertMany(internalUsersData.map(u => ({
        ...u,
        password: defaultPassword
    })));

    // Reference for relationship mapping
    const mainStaff = createdInternals.find(u => u.email === 'emily.blunt@credia.finance');

    // --- 2. CLIENT PERSONAS (8 distinct scenarios) ---
    // Using common public email providers to simulate real customers
    const clientPersonasData = [
        {
            name: 'William Thacker',
            email: 'william.thacker88@gmail.com',
            username: 'wthacker',
            status: 'ACTIVE',
            scenario: 'CLOSED_LOAN' // Scenario 1
        },
        {
            name: 'Julia Roberts',
            email: 'julia.roberts@outlook.com',
            username: 'jroberts',
            status: 'ACTIVE',
            scenario: 'ACTIVE_SMOOTH' // Scenario 2
        },
        {
            name: 'Hugh Grant',
            email: 'hugh.grant@yahoo.com',
            username: 'hgrant',
            status: 'ACTIVE',
            scenario: 'ACTIVE_LATE' // Scenario 3
        },
        {
            name: 'Emma Watson',
            email: 'emma.watson@live.com',
            username: 'ewatson',
            status: 'ACTIVE',
            scenario: 'PENDING_APPROVAL' // Scenario 4
        },
        {
            name: 'Ryan Reynolds',
            email: 'ryan.reynolds@icloud.com',
            username: 'rreynolds',
            status: 'ACTIVE',
            scenario: 'REJECTED_APP' // Scenario 5
        },
        {
            name: 'Tom Holland',
            email: 'tom.holland@protonmail.com',
            username: 'tholland',
            status: 'ACTIVE',
            scenario: 'VOID_CONTRACT' // Scenario 6
        },
        {
            name: 'New Registered User',
            email: 'new.user.test@gmail.com',
            username: 'newuser001',
            status: 'UNVERIFIED',
            scenario: 'UNVERIFIED_ACCOUNT' // Scenario 7
        },
        {
            name: 'Suspicious Actor',
            email: 'fraud.alert.99@tempmail.com',
            username: 'badactor',
            status: 'SUSPENDED',
            scenario: 'SUSPENDED_ACCOUNT' // Scenario 8
        }
    ];

    const createdClients = await User.insertMany(clientPersonasData.map((u, i) => ({
        ...u,
        role: 'CLIENT',
        custom_id: `CLI-2026-${100 + i}`,
        password: defaultPassword,
        created_by: mainStaff._id
    })));

    // --- 3. FILLER DATA (Stress Testing) ---
    // Generate 25 additional clients for pagination testing
    const fillerClients = faker.helpers.multiple(() => {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const username = faker.internet.username({ firstName, lastName }).toLowerCase().replace(/[^a-z0-9]/g, '');

        return {
            custom_id: `CLI-FILL-${faker.string.alphanumeric(5).toUpperCase()}`,
            username: username,
            email: faker.internet.email({ firstName, lastName }),
            password: defaultPassword,
            name: `${firstName} ${lastName}`,
            role: 'CLIENT',
            status: 'ACTIVE',
            created_by: mainStaff._id
        };
    }, { count: 25 });

    const createdFillers = await User.insertMany(fillerClients);

    // Return structured map for consumption by other seeders
    return {
        admins: createdInternals.filter(u => u.role === 'ADMIN' || u.role === 'SUPERADMIN'),
        staff: createdInternals.filter(u => u.role === 'STAFF'),
        clients: createdClients,
        fillers: createdFillers
    };
};

module.exports = seedUsers;