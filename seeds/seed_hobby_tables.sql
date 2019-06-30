-- psql -U dunder-mifflin -d hobby-with-friends -f ./seeds/seed_hobby_tables.sql

TRUNCATE event_users, events RESTART IDENTITY CASCADE, users RESTART IDENTITY CASCADE;

-- insert 4 users
INSERT INTO users
  (name, full_name, password, type, location, email, about_me)
  VALUES 
    ('Jake123', 'Jake Doe', 'password', 'baseball, basketball, weight lifting', 'New York City, NY', 'jake123@gmail.com', 'Ligula curabitur fermentum turpis ante laoreet amet turpis curabitur nec curabitur torquent dolor elementum'),
    ('SallyS', 'Sally Slim', 'Sallypassword', 'hiking, soccer', 'New Orleans, LA', 'SallyS@gmail.com', 'Ligula curabitur fermentum turpis ante laoreet amet turpis curabitur nec curabitur torquent dolor elementum'),
    ('Blanket Bill', 'Bill Dobbs', 'Billpassword', 'video games, board games, frisbee', 'New Orleans, LA', 'BBill@gmail.com', 'Ligula curabitur fermentum turpis ante laoreet amet turpis curabitur nec curabitur torquent dolor elementum'),
    ('Carl-Seven', 'Carl Holmes', 'Carlpassword', 'basketball, football, baseball', 'New York City, NY', 'carlh123@gmail.com', 'Ligula curabitur fermentum turpis ante laoreet amet turpis curabitur nec curabitur torquent dolor elementum');

-- insert 4 events
INSERT INTO events 
  (name, type, location, date, information)
  VALUES 
    ('Basketball 3v3', 'basketball', 'Central Park Manhattan New York City', 1560897357743, 'this is a test event'),
    ('Ultimate Frisbee', 'Frisbee', 'City Park, New Orleans, LA', 1560897460000, 'this is a test event'),
    ('Indoor Soccer 6 on 6', 'soccer', '1501 Dave Dixon Dr, New Orleans LA 70113 United States', 1560898367000, 'this is a test event'),
    ('Basketball 3v3', 'basketball', 'Central Park Manhattan New York City', 1560899358700, 'this is a test event');

-- insert users joining events
INSERT INTO event_users
  (user_id, event_id, role_id)
  VALUES
    (1, 1, 1),
    (3, 2, 1),
    (2, 3, 1),
    (1, 4, 1),
    (2, 2, 2),
    (1, 2, 2),
    (4, 1, 2),
    (3, 1, 2),
    (4, 3, 2),
    (2, 1, 2);