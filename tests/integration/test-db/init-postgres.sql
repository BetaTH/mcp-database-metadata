CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    user_id INT,
    CONSTRAINT fk_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
);

CREATE INDEX idx_product_name ON products(name);

CREATE OR REPLACE FUNCTION notify_new_product()
RETURNS TRIGGER AS $$
BEGIN
    -- Logic for the trigger
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER new_product_trigger
AFTER INSERT ON products
FOR EACH ROW
EXECUTE FUNCTION notify_new_product();
