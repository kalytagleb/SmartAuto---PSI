import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';

/**
 * Acceptance Test — UC02: Assign Staff to Order
 *
 * Acceptance criteria:
 *   - Manager can view all orders
 *   - Manager can assign a mechanic and driver to an order
 *   - After assignment the order status changes to ACCEPTED
 *   - The assigned mechanic is linked to the order
 */
describe('UC02 — Assign Staff to Order', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    let managerCookies: string[];
    let managerId: string;
    let mechanicId: string;
    let driverId: string;
    let orderId: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.use(cookieParser());
        await app.init();

        prisma = app.get(PrismaService);

        const hash = await bcrypt.hash('password123', 10);

        // Clean up from previous runs
        await prisma.user.deleteMany({ where: { email: { in: [
            'uc02-manager@test.com',
            'uc02-mechanic@test.com',
            'uc02-driver@test.com',
            'uc02-customer@test.com',
        ]}}});

        // Create test users directly in DB (manager can't register via API)
        const manager = await prisma.user.create({ data: {
            email: 'uc02-manager@test.com',
            fullName: 'UC02 Manager',
            role: 'MANAGER',
            passwordHash: hash,
            refreshTokenHash: 'placeholder',
        }});
        managerId = manager.id;

        const mechanic = await prisma.user.create({ data: {
            email: 'uc02-mechanic@test.com',
            fullName: 'UC02 Mechanic',
            role: 'MECHANIC',
            passwordHash: hash,
            refreshTokenHash: 'placeholder',
        }});
        mechanicId = mechanic.id;

        const driver = await prisma.user.create({ data: {
            email: 'uc02-driver@test.com',
            fullName: 'UC02 Driver',
            role: 'DRIVER',
            passwordHash: hash,
            refreshTokenHash: 'placeholder',
        }});
        driverId = driver.id;

        // Create customer and order via API
        const customerRes = await prisma.user.create({ data: {
            email: 'uc02-customer@test.com',
            fullName: 'UC02 Customer',
            role: 'CUSTOMER',
            passwordHash: hash,
            refreshTokenHash: 'placeholder',
        }});

        const car = await prisma.car.create({ data: {
            licensePlate: 'UC-002AB',
            brand: 'Honda',
            model: 'Civic',
            ownerId: customerRes.id,
        }});

        const order = await prisma.order.create({ data: {
            customerId: customerRes.id,
            carId: car.id,
            description: 'Brakes need inspection',
            location: '456 Test Avenue',
            estimatedPrice: 80,
            status: 'NEW',
        }});
        orderId = order.id;

        // Login as manager
        const loginRes = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: 'uc02-manager@test.com', pass: 'password123' });

        managerCookies = loginRes.headers['set-cookie'] as unknown as string[];
    });

    afterAll(async () => {
        await prisma.order.deleteMany({ where: { id: orderId } });
        await prisma.car.deleteMany({ where: { licensePlate: 'UC-002AB' } });
        await prisma.user.deleteMany({ where: { email: { in: [
            'uc02-manager@test.com',
            'uc02-mechanic@test.com',
            'uc02-driver@test.com',
            'uc02-customer@test.com',
        ]}}});
        await app.close();
    });

    it('1. Manager can view all orders', async () => {
        const res = await request(app.getHttpServer())
            .get('/orders')
            .set('Cookie', managerCookies);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);

        const ourOrder = res.body.find((o: any) => o.id === orderId);
        expect(ourOrder).toBeDefined();
        expect(ourOrder.status).toBe('NEW');
    });

    it('2. Manager assigns mechanic and driver — order status becomes ACCEPTED', async () => {
        const res = await request(app.getHttpServer())
            .patch(`/orders/${orderId}/assign`)
            .set('Cookie', managerCookies)
            .send({
                managerId,
                mechanicId,
                driverId,
            });

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('ACCEPTED');
    });

    it('3. Order has the assigned mechanic linked', async () => {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { mechanic: true, driver: true, manager: true },
        });

        expect(order).not.toBeNull();
        expect(order!.mechanicId).toBe(mechanicId);
        expect(order!.driverId).toBe(driverId);
        expect(order!.managerId).toBe(managerId);
    });

    it('4. Unauthorized user cannot assign staff', async () => {
        const res = await request(app.getHttpServer())
            .patch(`/orders/${orderId}/assign`)
            .send({ mechanicId });
        // No cookies — should be 401

        expect(res.status).toBe(401);
    });
});
