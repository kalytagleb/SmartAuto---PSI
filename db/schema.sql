CREATE TYPE user_role AS ENUM ('CUSTOMER', 'MANAGER', 'MECHANIC', 'DRIVER');

CREATE TYPE order_status AS ENUM ('NEW', 'ACCEPTED', 'IN_REPAIR', 'WAITING_FOR_PARTS', 'REPAIRED', 'DELIVERING', 'COMPLETED', 'CANCELLED');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role user_role NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE cars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    license_plate TEXT UNIQUE NOT NULL,
    brand TEXT NOT NULL,
    model TEXT NOT NULL
);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES users(id),
    car_id UUID NOT NULL REFERENCES cars(id),
    manager_id UUID REFERENCES users(id),
    mechanic_id UUID REFERENCES users(id),
    driver_id UUID REFERENCES users(id),
    status order_status DEFAULT 'NEW',
    description TEXT,
    location TEXT,
    estimated_price DECIMAL(7, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE parts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    price DECIMAL(7, 2) NOT NULL
);

CREATE TABLE order_parts (
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    part_id UUID REFERENCES parts(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(7, 2) NOT NULL,
    PRIMARY KEY (order_id, part_id)
);

CREATE TABLE protocols (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
    signature_data TEXT,
    signed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);