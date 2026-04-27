import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';

/**
 * Acceptance Test — UC04: Add Part to Order
 *
 * Acceptance criteria:
 *   - Mechanic can add a part from the warehouse to an order
 *   - Part stock quantity is decremented after being added
 *   - Order status changes to IN_REPAIR
 *   - If part stock is insufficient, order status changes to WAITING_FOR_PARTS
 */
describe('UC04 — Add Part to Order', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    let mechanicCookies: string[];
    let orderId: string;
    let partId: string;
    let initialStock: number;

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
            'uc04-mechanic@test.com',
            'uc04-customer@test.com',
        ]}}});
        await prisma.part.deleteMany({ where: { name: 'UC04 Test Oil Filter' } });

        // Create mechanic
        const mechanic = await prisma.user.create({ data: {
            email: 'uc04-mechanic@test.com',
            fullName: 'UC04 Mechanic',
            role: 'MECHANIC',
            passwordHash: hash,
            refreshTokenHash: 'placeholder',
        }});

        // Create customer, car, order, assign mechanic
        const customer = await prisma.user.create({ data: {
            email: 'uc04-customer@test.com',
            fullName: 'UC04 Customer',
            role: 'CUSTOMER',
            passwordHash: hash,
            refreshTokenHash: 'placeholder',
        }});

        const car = await prisma.car.create({ data: {
            licensePlate: 'UC-004AB',
            brand: 'Ford',
            model: 'Focus',
            ownerId: customer.id,
        }});

        const order = await prisma.order.create({ data: {
            customerId: customer.id,
            carId: car.id,
            description: 'Oil change needed',
            location: '789 Repair Lane',
            estimatedPrice: 50,
            status: 'ACCEPTED',
            mechanicId: mechanic.id,
        }});
        orderId = order.id;

        // Create a part with known stock
        initialStock = 5;
        const part = await prisma.part.create({ data: {
            name: 'UC04 Test Oil Filter',
            stockQuantity: initialStock,
            price: 12.50,
        }});
        partId = part.id;

        // Login as mechanic
        const loginRes = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: 'uc04-mechanic@test.com', pass: 'password123' });

        mechanicCookies = loginRes.headers['set-cookie'] as unknown as string[];
    });

    afterAll(async () => {
        await prisma.orderPart.deleteMany({ where: { orderId } });
        await prisma.order.deleteMany({ where: { id: orderId } });
        await prisma.car.deleteMany({ where: { licensePlate: 'UC-004AB' } });
        await prisma.part.deleteMany({ where: { name: 'UC04 Test Oil Filter' } });
        await prisma.user.deleteMany({ where: { email: { in: [
            'uc04-mechanic@test.com',
            'uc04-customer@test.com',
        ]}}});
        await app.close();
    });

    it('1. Mechanic adds a part to the order', async () => {
        const res = await request(app.getHttpServer())
            .patch(`/orders/${orderId}/add-part`)
            .set('Cookie', mechanicCookies)
            .send({ partId, quantity: 1 });

        expect(res.status).toBe(200);
    });

    it('2. Order status changes to IN_REPAIR after adding a part', async () => {
        const order = await prisma.order.findUnique({ where: { id: orderId } });

        expect(order!.status).toBe('IN_REPAIR');
    });

    it('3. Part stock quantity is decremented', async () => {
        const part = await prisma.part.findUnique({ where: { id: partId } });

        expect(part!.stockQuantity).toBe(initialStock - 1);
    });

    it('4. Adding a part with insufficient stock changes order to WAITING_FOR_PARTS', async () => {
        // Try to order more than available stock (remaining stock is initialStock - 1)
        const res = await request(app.getHttpServer())
            .patch(`/orders/${orderId}/add-part`)
            .set('Cookie', mechanicCookies)
            .send({ partId, quantity: initialStock + 99 });

        expect(res.status).toBe(400);

        const order = await prisma.order.findUnique({ where: { id: orderId } });
        expect(order!.status).toBe('WAITING_FOR_PARTS');
    });
});
