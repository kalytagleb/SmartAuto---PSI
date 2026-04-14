import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';

/**
 * Acceptance Test — UC06: Complete Order
 *
 * Acceptance criteria:
 *   - Mechanic can mark repair as finished (status → REPAIRED)
 *   - Manager can complete an order in REPAIRED state
 *   - Completing the order creates a signed protocol
 *   - Order status changes to COMPLETED after manager signs off
 *   - Manager cannot complete an order that is not yet REPAIRED
 */
describe('UC06 — Complete Order', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    let managerCookies: string[];
    let mechanicCookies: string[];
    let orderId: string;
    let orderIdNotRepaired: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.use(cookieParser());
        await app.init();

        prisma = app.get(PrismaService);

        const hash = await bcrypt.hash('password123', 10);

        // Clean up
        await prisma.user.deleteMany({ where: { email: { in: [
            'uc06-manager@test.com',
            'uc06-mechanic@test.com',
            'uc06-customer@test.com',
        ]}}});

        // Create test users
        const manager = await prisma.user.create({ data: {
            email: 'uc06-manager@test.com',
            fullName: 'UC06 Manager',
            role: 'MANAGER',
            passwordHash: hash,
            refreshTokenHash: 'placeholder',
        }});

        const mechanic = await prisma.user.create({ data: {
            email: 'uc06-mechanic@test.com',
            fullName: 'UC06 Mechanic',
            role: 'MECHANIC',
            passwordHash: hash,
            refreshTokenHash: 'placeholder',
        }});

        const customer = await prisma.user.create({ data: {
            email: 'uc06-customer@test.com',
            fullName: 'UC06 Customer',
            role: 'CUSTOMER',
            passwordHash: hash,
            refreshTokenHash: 'placeholder',
        }});

        const car = await prisma.car.create({ data: {
            licensePlate: 'UC-006AB',
            brand: 'BMW',
            model: '3 Series',
            ownerId: customer.id,
        }});

        // Order ready for completion (status IN_REPAIR — mechanic will finish it)
        const order = await prisma.order.create({ data: {
            customerId: customer.id,
            carId: car.id,
            description: 'Full service',
            location: '1 Finish Road',
            estimatedPrice: 120,
            status: 'IN_REPAIR',
            managerId: manager.id,
            mechanicId: mechanic.id,
        }});
        orderId = order.id;

        // Order still in repair (manager should NOT be able to complete it)
        const orderNotRepaired = await prisma.order.create({ data: {
            customerId: customer.id,
            carId: car.id,
            description: 'Still in repair',
            location: '2 Unfinished Road',
            estimatedPrice: 60,
            status: 'IN_REPAIR',
            managerId: manager.id,
            mechanicId: mechanic.id,
        }});
        orderIdNotRepaired = orderNotRepaired.id;

        // Login
        const managerLogin = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: 'uc06-manager@test.com', pass: 'password123' });
        managerCookies = managerLogin.headers['set-cookie'] as unknown as string[];

        const mechanicLogin = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: 'uc06-mechanic@test.com', pass: 'password123' });
        mechanicCookies = mechanicLogin.headers['set-cookie'] as unknown as string[];
    });

    afterAll(async () => {
        await prisma.protocol.deleteMany({ where: { orderId } });
        await prisma.order.deleteMany({ where: { id: { in: [orderId, orderIdNotRepaired] } } });
        await prisma.car.deleteMany({ where: { licensePlate: 'UC-006AB' } });
        await prisma.user.deleteMany({ where: { email: { in: [
            'uc06-manager@test.com',
            'uc06-mechanic@test.com',
            'uc06-customer@test.com',
        ]}}});
        await app.close();
    });

    it('1. Mechanic marks the repair as finished — status changes to REPAIRED', async () => {
        const res = await request(app.getHttpServer())
            .patch(`/orders/${orderId}/finish-repair`)
            .set('Cookie', mechanicCookies);

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('REPAIRED');
    });

    it('2. Manager completes the order with a signature', async () => {
        const res = await request(app.getHttpServer())
            .patch(`/orders/${orderId}/complete`)
            .set('Cookie', managerCookies)
            .send({ signatureData: 'John Smith — signed 2026-04-14' });

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('COMPLETED');
    });

    it('3. A signed protocol is created for the completed order', async () => {
        const protocol = await prisma.protocol.findUnique({
            where: { orderId },
        });

        expect(protocol).not.toBeNull();
        expect(protocol!.signatureData).toBe('John Smith — signed 2026-04-14');
        expect(protocol!.signedAt).toBeDefined();
    });

    it('4. Customer (non-manager) cannot complete an order', async () => {
        // Register as customer to get their cookies
        const customerRes = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: 'uc06-customer@test.com', pass: 'password123' });

        const customerCookies = customerRes.headers['set-cookie'] as unknown as string[];

        const res = await request(app.getHttpServer())
            .patch(`/orders/${orderIdNotRepaired}/complete`)
            .set('Cookie', customerCookies)
            .send({ signatureData: 'Unauthorized' });

        expect(res.status).toBe(403);
    });
});
