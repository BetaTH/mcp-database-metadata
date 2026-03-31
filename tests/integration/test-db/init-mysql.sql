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

CREATE VIEW user_products AS
SELECT u.id AS user_id, u.username, p.id AS product_id, p.name AS product_name
FROM users u
INNER JOIN products p ON p.user_id = u.id;

GRANT SHOW_ROUTINE ON *.* TO 'testuser'@'%';

DELIMITER $$
CREATE PROCEDURE get_user_count(OUT total INT)
BEGIN
    SELECT COUNT(*) INTO total FROM users;
END$$
DELIMITER ;

DELIMITER $$
CREATE FUNCTION get_username(user_id INT)
RETURNS VARCHAR(50)
READS SQL DATA
BEGIN
    DECLARE result VARCHAR(50);
    SELECT username INTO result FROM users WHERE id = user_id;
    RETURN result;
END$$
DELIMITER ;
