CREATE TABLE measurements (
  id int(11) AUTO_INCREMENT PRIMARY KEY,
  customer_code varchar(50) NOT NULL,
  measure_datetime datetime NOT NULL,
  measure_type varchar(50) NOT NULL,
  measure_value int NOT NULL,
  has_confirmed boolean NOT NULL DEFAULT 0,
  image_url varchar(255) NOT NULL, 
  measure_uuid varchar(255) NOT NULL
);