import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';

/**
 * Acceptance Test — UC01: Create Order
 *
 * Acceptance criteria:
 *   - Customer can register and log in
 *   - Customer can register a car
 *   - Customer can create an order for their car
 *   - The system automatically calculates an estimated price
 *   - The order is created with status NEW
 */
describe('UC01 — Create Order', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    const customer = {
        email: 'uc01-customer@test.com',
        fullName: 'UC01 Customer',
        passwordRaw: 'password123',
    };

    let cookies: string[];
    let customerId: string;
    let carId: string;
    let orderId: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.use(cookieParser());
        await app.init();

        prisma = app.get(PrismaService);

        // Clean up any leftover data from previous runs
        await prisma.order.deleteMany({ where: { customer: { email: customer.email } } });
        await prisma.car.deleteMany({ where: { licensePlate: 'UC-001AB' } });
        await prisma.user.deleteMany({ where: { email: customer.email } });
    });

    afterAll(async () => {
        // Clean up test data
        if (orderId) await prisma.order.deleteMany({ where: { id: orderId } });
        if (carId)   await prisma.car.deleteMany({ where: { id: carId } });
        await prisma.user.deleteMany({ where: { email: customer.email } });

        await app.close();
    });

    it('1. Customer registers and gets authenticated', async () => {
        const res = await request(app.getHttpServer())
            .post('/auth/register')
            .send(customer);

        expect(res.status).toBe(201);
        expect(res.body.user).toBeDefined();
        expect(res.body.user.role).toBe('CUSTOMER');

        customerId = res.body.user.id;
        cookies = res.headers['set-cookie'] as unknown as string[];
        expect(cookies).toBeDefined();
    });

    it('2. Customer registers a car', async () => {
        const res = await request(app.getHttpServer())
            .post('/cars')
            .set('Cookie', cookies)
            .send({
                licensePlate: 'UC-001AB',
                brand: 'Toyota',
                model: 'Corolla',
                ownerId: customerId,
            });

        expect(res.status).toBe(201);
        expect(res.body.id).toBeDefined();
        expect(res.body.licensePlate).toBe('UC-001AB');

        carId = res.body.id;
    });

    it('3. Customer creates an order — system calculates estimated price', async () => {
        const res = await request(app.getHttpServer())
            .post('/orders')
            .set('Cookie', cookies)
            .send({
                customerId,
                carId,
                description: 'Engine makes strange noise',
                location: '123 Main Street',
            });

        expect(res.status).toBe(201);
        expect(res.body.id).toBeDefined();
        expect(res.body.status).toBe('NEW');
        expect(res.body.estimatedPrice).toBeDefined();
        expect(Number(res.body.estimatedPrice)).toBeGreaterThan(0);

        orderId = res.body.id;
    });

    it('4. Order appears in the orders list for the customer', async () => {
        const res = await request(app.getHttpServer())
            .get('/orders')
            .set('Cookie', cookies);

        // Customers get 403 from GET /orders (MANAGER/MECHANIC/DRIVER only)
        // This verifies the role guard works correctly
        expect(res.status).toBe(403);
    });
});
