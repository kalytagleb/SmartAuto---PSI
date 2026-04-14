// Run: node seed.js
// Creates the first manager account if it doesn't exist yet.

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'src/.env') });

const { PrismaClient } = require('./generated/prisma/client');
const bcrypt = require('bcrypt');

const EMAIL    = 'manager@smartauto.com';
const PASSWORD = 'admin123';

async function main() {
    const prisma = new PrismaClient();

    try {
        const existing = await prisma.user.findUnique({ where: { email: EMAIL } });

        if (existing) {
            console.log(`Manager already exists: ${EMAIL}`);
            return;
        }

        const passwordHash = await bcrypt.hash(PASSWORD, 10);

        const user = await prisma.user.create({
            data: {
                email: EMAIL,
                fullName: 'Admin Manager',
                role: 'MANAGER',
                passwordHash,
                refreshTokenHash: 'placeholder',
            },
        });

        console.log('Manager created successfully!');
        console.log('  Email:   ', user.email);
        console.log('  Password:', PASSWORD);
        console.log('  Role:    ', user.role);
    } finally {
        await prisma.$disconnect();
    }
}

main().catch(e => {
    console.error('Error:', e.message);
    process.exit(1);
});
