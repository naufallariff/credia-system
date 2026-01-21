const { faker } = require('@faker-js/faker');
// Note: We do NOT import bcrypt here. We let the User Model handle security to ensure consistency.
const User = require('../../models/User');

/**
 * Seeder for User entities.
 * Uses parallel User.create() execution to ensure Mongoose pre-save hooks (hashing) 
 * are triggered correctly while maintaining high performance.
 */
const seedUsers = async () => {
    console.log('[02] Seeding Users (Parallel Execution with Hooks)...');

    // Default password (Plain text, Model will hash it)
    const defaultPassword = 'password123';

    // --- 1. INTERNAL ORGANIZATION ---
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
            status: 'ACTIVE',
            custom_id: 'EMP-002'
        },
        {
            name: 'Robert "Bob" Vance',
            email: 'robert.vance@credia.finance',
            username: 'rvance',
            role: 'ADMIN',
            status: 'SUSPENDED',
            custom_id: 'EMP-003'
        },
        {
            name: 'Michael Chang',
            email: 'michael.chang@credia.finance',
            username: 'mchang',
            role: 'ADMIN',
            status: 'ACTIVE',
            custom_id: 'EMP-004'
        },
        {
            name: 'Emily Blunt',
            email: 'emily.blunt@credia.finance',
            username: 'eblunt',
            role: 'STAFF',
            status: 'ACTIVE',
            custom_id: 'EMP-005'
        },
        {
            name: 'David Wallace',
            email: 'david.wallace@credia.finance',
            username: 'dwallace',
            role: 'STAFF',
            status: 'ACTIVE',
            custom_id: 'EMP-006'
        }
    ];

    // Execute in parallel for performance
    const createdInternals = await Promise.all(internalUsersData.map(u =>
        User.create({ ...u, password: defaultPassword })
    ));

    const mainStaff = createdInternals.find(u => u.email === 'emily.blunt@credia.finance');

    // --- 2. CLIENT PERSONAS ---
    const clientPersonasData = [
        {
            name: 'William Thacker',
            email: 'william.thacker88@gmail.com',
            username: 'wthacker',
            status: 'ACTIVE'
        },
        {
            name: 'Julia Roberts',
            email: 'julia.roberts@outlook.com',
            username: 'jroberts',
            status: 'ACTIVE'
        },
        {
            name: 'Hugh Grant',
            email: 'hugh.grant@yahoo.com',
            username: 'hgrant',
            status: 'ACTIVE'
        },
        {
            name: 'Emma Watson',
            email: 'emma.watson@live.com',
            username: 'ewatson',
            status: 'ACTIVE'
        },
        {
            name: 'Ryan Reynolds',
            email: 'ryan.reynolds@icloud.com',
            username: 'rreynolds',
            status: 'ACTIVE'
        },
        {
            name: 'Tom Holland',
            email: 'tom.holland@protonmail.com',
            username: 'tholland',
            status: 'ACTIVE'
        },
        {
            name: 'New Registered User',
            email: 'new.user.test@gmail.com',
            username: 'newuser001',
            status: 'UNVERIFIED'
        },
        {
            name: 'Suspicious Actor',
            email: 'fraud.alert.99@tempmail.com',
            username: 'badactor',
            status: 'SUSPENDED'
        }
    ];

    const createdClients = await Promise.all(clientPersonasData.map((u, i) =>
        User.create({
            ...u,
            role: 'CLIENT',
            custom_id: `CLI-2026-${100 + i}`,
            password: defaultPassword,
            created_by: mainStaff._id
        })
    ));

    // --- 3. FILLER DATA ---
    const fillerData = faker.helpers.multiple(() => {
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

    const createdFillers = await Promise.all(fillerData.map(u => User.create(u)));

    return {
        admins: createdInternals.filter(u => u.role === 'ADMIN' || u.role === 'SUPERADMIN'),
        staff: createdInternals.filter(u => u.role === 'STAFF'),
        clients: createdClients,
        fillers: createdFillers
    };
};

module.exports = seedUsers;