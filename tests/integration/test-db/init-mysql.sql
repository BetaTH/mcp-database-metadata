CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_product_name ON products(name);

DELIMITER $$
CREATE TRIGGER new_product_trigger
AFTER INSERT ON products
FOR EACH ROW
BEGIN
    -- Logic for the trigger
END$$ 
DELIMITER ;
