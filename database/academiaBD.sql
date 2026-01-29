CREATE DATABASE IF NOT EXISTS academia;
USE academia;

CREATE TABLE profesores (
    id_profesor INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(150) NOT NULL,
    alias VARCHAR(50) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    materias_imparte VARCHAR(150) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    cuenta_bancaria VARCHAR(34) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    administrador BOOLEAN DEFAULT FALSE,  
    password VARCHAR(255) NOT NULL        
);

CREATE TABLE alumnos (
    id_alumno INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(150) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    curso_actual VARCHAR(50) NOT NULL,
    materia VARCHAR(100) NOT NULL,
    cuota_mensual DECIMAL(8,2) NOT NULL,
    metodo_pago ENUM('Efectivo','Tarjeta','Transferencia','Bizum') NOT NULL,
    fecha_alta DATE NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    password VARCHAR(255) NOT NULL        
);


CREATE TABLE aulas (
    id_aula INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL,
    capacidad INT NOT NULL,
    descripcion VARCHAR(150) NULL
);

CREATE TABLE horarios (
    id_horario INT PRIMARY KEY AUTO_INCREMENT,
    id_alumno INT NOT NULL,
    id_profesor INT NOT NULL,
    id_aula INT NOT NULL,
    dia_semana ENUM('Lunes','Martes','Miércoles','Jueves','Viernes','Sábado') NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_alumno) REFERENCES alumnos(id_alumno) ON DELETE CASCADE,
    FOREIGN KEY (id_profesor) REFERENCES profesores(id_profesor) ON DELETE CASCADE,
    FOREIGN KEY (id_aula) REFERENCES aulas(id_aula) ON DELETE CASCADE
);

CREATE TABLE recibos (
    id_recibo INT PRIMARY KEY AUTO_INCREMENT,
    id_alumno INT NOT NULL,
    mes VARCHAR(15) NOT NULL,
    importe DECIMAL(8,2) NOT NULL,
    estado ENUM('PENDIENTE','PAGADO') DEFAULT 'PENDIENTE',
    fecha_emision DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_pago DATETIME NULL,
    FOREIGN KEY (id_alumno) REFERENCES alumnos(id_alumno) ON DELETE CASCADE
);

INSERT INTO profesores (nombre, apellidos, alias, fecha_nacimiento, materias_imparte, email, cuenta_bancaria, administrador, password) VALUES 
('Alejandor', 'Rodríguez Arias', 'Alex', '2004-07-09', 'Informática', 'alex@academia.com', 'ES9121000418450200051332', 1, 'alexandro'),
('María', 'García López', 'María', '1985-03-15', 'Matemáticas,Física', 'maria@academia.com', 'ES9121000418450200051332', 1, 'hashed_pass_1'),
('Carlos', 'Martínez Ruiz', 'Carlos', '1990-07-22', 'Inglés,Francés', 'carlos@academia.com', 'ES7921000813530200051332', 0, 'hashed_pass_2');

INSERT INTO alumnos (nombre, apellidos, email, curso_actual, materia, cuota_mensual, metodo_pago, fecha_alta, activo, password) VALUES 
('Ana', 'Sánchez Pérez', 'ana@email.com', '2º Bachillerato', 'Matemáticas', 120.00, 'Transferencia', '2024-01-15', 1, 'hashed_pass_alumno_1'),
('Luis', 'Fernández Gómez', 'luis@email.com', '4º ESO', 'Inglés', 100.00, 'Efectivo', '2024-01-14', 1, 'hashed_pass_alumno_2'),
('María', 'Rodríguez López', 'maria@email.com', '1º Bachillerato', 'Física', 110.00, 'Bizum', '2024-01-13', 0, 'hashed_pass_alumno_3');

INSERT INTO aulas (nombre, capacidad, descripcion) VALUES 
('Aula 1', 5, 'Aula principal con pizarra digital'),
('Aula 2', 4, 'Aula pequeña para clases individuales'),
('Aula 3', 6, 'Aula de informática');

INSERT INTO horarios (id_alumno, id_profesor, id_aula, dia_semana, hora_inicio, hora_fin) VALUES 
(1, 1, 1, 'Lunes', '16:00:00', '17:00:00'),
(1, 1, 1, 'Miércoles', '16:00:00', '17:00:00'),
(2, 2, 2, 'Martes', '17:30:00', '18:30:00');

INSERT INTO recibos (id_alumno, mes, importe, estado, fecha_pago) VALUES 
(1, 'Noviembre 2024', 120.00, 'PAGADO', '2024-11-05 10:30:00'),
(1, 'Diciembre 2024', 120.00, 'PENDIENTE', NULL),
(2, 'Noviembre 2024', 100.00, 'PAGADO', '2024-11-06 11:15:00');