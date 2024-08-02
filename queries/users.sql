CREATE TABLE users (
    firstname VARCHAR(50),
    lastname VARCHAR(50),
    id VARCHAR(20) PRIMARY KEY,
    phone VARCHAR(15),
    role VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Agregar la columna secret_password
ALTER TABLE users
ADD COLUMN username VARCHAR(50);

-- Modificar el tipo de dato de la columna id
ALTER TABLE users
ALTER COLUMN id TYPE BIGINT
USING id::BIGINT;


--Seleccionar un usuario por su id (cédula)
SELECT * FROM users where id = 25663319;