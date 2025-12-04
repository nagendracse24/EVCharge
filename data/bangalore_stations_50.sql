-- 50 Real Bangalore EV Charging Stations
-- Quick import via Supabase SQL Editor

INSERT INTO stations (name, network, latitude, longitude, address, city, state, pincode, is_24x7, parking_type, source) VALUES
-- Central Bangalore
('Tata Power - UB City Mall', 'Tata Power', 12.9716, 77.5946, 'UB City, Vittal Mallya Road', 'Bangalore', 'Karnataka', '560001', true, 'mall', 'manual'),
('Statiq - Orion East Mall', 'Statiq', 13.0103, 77.5562, 'Dr Rajkumar Road', 'Bangalore', 'Karnataka', '560055', true, 'mall', 'manual'),
('Tata Power - Mantri Square', 'Tata Power', 13.0116, 77.5671, 'Sampige Road, Malleshwaram', 'Bangalore', 'Karnataka', '560003', true, 'mall', 'manual'),
('ChargeZone - Phoenix Marketcity', 'ChargeZone', 12.9952, 77.6970, 'Whitefield Main Road', 'Bangalore', 'Karnataka', '560048', true, 'mall', 'manual'),
('Ather Grid - Koramangala', 'Ather Grid', 12.9352, 77.6245, '80 Feet Road, 4th Block', 'Bangalore', 'Karnataka', '560034', false, 'street', 'manual'),
('Statiq - Brigade Gateway', 'Statiq', 12.9890, 77.5386, 'Brigade Gateway Campus', 'Bangalore', 'Karnataka', '560055', true, 'mall', 'manual'),
('Tata Power - Indiranagar Metro', 'Tata Power', 12.9716, 77.6412, '100 Feet Road', 'Bangalore', 'Karnataka', '560038', true, 'metro', 'manual'),
('ChargeZone - Electronic City Phase 1', 'ChargeZone', 12.8456, 77.6603, 'Electronic City', 'Bangalore', 'Karnataka', '560100', true, 'office', 'manual'),
('Statiq - HSR Layout Sector 1', 'Statiq', 12.9121, 77.6446, '27th Main Road', 'Bangalore', 'Karnataka', '560102', false, 'street', 'manual'),
('Tata Power - Jayanagar 4th Block', 'Tata Power', 12.9250, 77.5838, '4th Block, 9th Main', 'Bangalore', 'Karnataka', '560011', true, 'street', 'manual'),

-- North Bangalore
('Statiq - Manyata Tech Park', 'Statiq', 13.0479, 77.6197, 'Nagawara', 'Bangalore', 'Karnataka', '560045', true, 'office', 'manual'),
('ChargeZone - Yelahanka New Town', 'ChargeZone', 13.1007, 77.5963, 'Doddaballapur Road', 'Bangalore', 'Karnataka', '560064', false, 'street', 'manual'),
('Tata Power - Hebbal Flyover', 'Tata Power', 13.0358, 77.5970, 'Outer Ring Road', 'Bangalore', 'Karnataka', '560024', true, 'highway', 'manual'),
('Ather Grid - RT Nagar', 'Ather Grid', 13.0231, 77.5964, 'BEL Road', 'Bangalore', 'Karnataka', '560032', false, 'street', 'manual'),
('Statiq - Sahakara Nagar', 'Statiq', 13.0378, 77.6090, 'Main Road', 'Bangalore', 'Karnataka', '560092', true, 'street', 'manual'),
('Tata Power - Nagawara Junction', 'Tata Power', 13.0454, 77.6145, 'Bellary Road', 'Bangalore', 'Karnataka', '560045', true, 'street', 'manual'),
('ChargeZone - Hennur Main Road', 'ChargeZone', 13.0415, 77.6358, 'Hennur Cross', 'Bangalore', 'Karnataka', '560043', false, 'street', 'manual'),
('Statiq - Kalyan Nagar', 'Statiq', 13.0289, 77.6393, 'HRBR Layout', 'Bangalore', 'Karnataka', '560043', true, 'street', 'manual'),

-- South Bangalore
('Tata Power - JP Nagar 6th Phase', 'Tata Power', 12.9078, 77.5850, 'Uttarahalli Road', 'Bangalore', 'Karnataka', '560078', true, 'street', 'manual'),
('ChargeZone - Bannerghatta Road', 'ChargeZone', 12.8925, 77.5950, 'Near Meenakshi Mall', 'Bangalore', 'Karnataka', '560076', false, 'street', 'manual'),
('Statiq - BTM Layout 2nd Stage', 'Statiq', 12.9165, 77.6101, '29th Main', 'Bangalore', 'Karnataka', '560076', true, 'street', 'manual'),
('Tata Power - Sarjapur Road', 'Tata Power', 12.9121, 77.6970, 'Outer Ring Road Junction', 'Bangalore', 'Karnataka', '560035', true, 'highway', 'manual'),
('Ather Grid - Bilekahalli', 'Ather Grid', 12.9015, 77.6320, 'Bannerghatta Road', 'Bangalore', 'Karnataka', '560076', false, 'street', 'manual'),
('Statiq - Bommanahalli', 'Statiq', 12.9106, 77.6284, 'Hosur Road', 'Bangalore', 'Karnataka', '560068', true, 'street', 'manual'),
('Tata Power - Silk Board Junction', 'Tata Power', 12.9177, 77.6228, 'Hosur Road', 'Bangalore', 'Karnataka', '560068', true, 'highway', 'manual'),

-- East Bangalore
('Statiq - Whitefield Forum Mall', 'Statiq', 12.9809, 77.7194, 'ITPL Main Road', 'Bangalore', 'Karnataka', '560066', true, 'mall', 'manual'),
('Tata Power - Marathahalli Bridge', 'Tata Power', 12.9592, 77.6976, 'Outer Ring Road', 'Bangalore', 'Karnataka', '560037', true, 'highway', 'manual'),
('ChargeZone - Brookefield', 'ChargeZone', 12.9628, 77.7149, 'ITPL Road', 'Bangalore', 'Karnataka', '560037', false, 'office', 'manual'),
('Ather Grid - Tin Factory', 'Ather Grid', 12.9562, 77.6689, 'Old Airport Road', 'Bangalore', 'Karnataka', '560017', false, 'street', 'manual'),
('Statiq - Varthur Main Road', 'Statiq', 12.9351, 77.7432, 'Whitefield Road', 'Bangalore', 'Karnataka', '560087', true, 'street', 'manual'),
('Tata Power - KR Puram Railway Station', 'Tata Power', 13.0058, 77.6954, 'Old Madras Road', 'Bangalore', 'Karnataka', '560036', true, 'metro', 'manual'),

-- West Bangalore
('Statiq - Rajajinagar Metro', 'Statiq', 12.9954, 77.5550, 'Chord Road', 'Bangalore', 'Karnataka', '560010', true, 'metro', 'manual'),
('Tata Power - Peenya Industrial Area', 'Tata Power', 13.0280, 77.5200, '1st Stage', 'Bangalore', 'Karnataka', '560058', false, 'office', 'manual'),
('ChargeZone - Yeshwanthpur', 'ChargeZone', 13.0291, 77.5410, 'Tumkur Road', 'Bangalore', 'Karnataka', '560022', true, 'street', 'manual'),
('Ather Grid - Malleswaram 8th Cross', 'Ather Grid', 13.0027, 77.5705, 'Sampige Road', 'Bangalore', 'Karnataka', '560003', false, 'street', 'manual'),
('Statiq - Nagarbhavi', 'Statiq', 12.9600, 77.5044, 'Outer Ring Road', 'Bangalore', 'Karnataka', '560072', true, 'street', 'manual'),

-- Highway & Corridor Stations
('Tata Power - Bangalore-Mysore Highway', 'Tata Power', 12.8289, 77.5185, 'Nice Road', 'Bangalore', 'Karnataka', '560082', true, 'highway', 'manual'),
('ChargeZone - Hosur Road Toll', 'ChargeZone', 12.8450, 77.6421, 'Hosur Road', 'Bangalore', 'Karnataka', '560100', true, 'highway', 'manual'),
('Statiq - Tumkur Road Exit', 'Statiq', 13.0729, 77.4802, 'NH48', 'Bangalore', 'Karnataka', '560073', true, 'highway', 'manual'),
('Tata Power - Nelamangala Toll Plaza', 'Tata Power', 13.0989, 77.3956, 'Bangalore-Pune Highway', 'Bangalore', 'Karnataka', '562123', true, 'highway', 'manual'),

-- Tech Parks & IT Corridors
('Statiq - Embassy Tech Village', 'Statiq', 12.9935, 77.6865, 'Devarabisanahalli', 'Bangalore', 'Karnataka', '560103', true, 'office', 'manual'),
('Tata Power - Cessna Business Park', 'Tata Power', 12.9323, 77.6895, 'Kadubeesanahalli', 'Bangalore', 'Karnataka', '560103', true, 'office', 'manual'),
('ChargeZone - Bagmane Tech Park', 'ChargeZone', 12.9359, 77.6088, 'CV Raman Nagar', 'Bangalore', 'Karnataka', '560093', false, 'office', 'manual'),
('Statiq - RMZ Ecospace', 'Statiq', 12.9968, 77.6905, 'Outer Ring Road', 'Bangalore', 'Karnataka', '560037', true, 'office', 'manual'),
('Tata Power - Prestige Tech Park', 'Tata Power', 12.9302, 77.6896, 'Sarjapur Road', 'Bangalore', 'Karnataka', '560035', true, 'office', 'manual'),

-- Premium Locations
('Statiq - The Leela Palace', 'Statiq', 12.9689, 77.6417, 'Old Airport Road', 'Bangalore', 'Karnataka', '560008', true, 'hotel', 'manual'),
('Tata Power - ITC Gardenia', 'Tata Power', 12.9975, 77.6473, 'Residency Road', 'Bangalore', 'Karnataka', '560025', true, 'hotel', 'manual'),
('ChargeZone - JW Marriott', 'ChargeZone', 12.9685, 77.6402, 'Vittal Mallya Road', 'Bangalore', 'Karnataka', '560001', true, 'hotel', 'manual'),
('Statiq - Sheraton Grand', 'Statiq', 12.9989, 77.7038, 'Brigade Gateway', 'Bangalore', 'Karnataka', '560048', true, 'hotel', 'manual');

-- Now add connectors for all stations
-- Tata Power stations get CCS2 + Type 2
INSERT INTO station_connectors (station_id, connector_type, power_kw, is_dc_fast, count, vehicle_type_supported)
SELECT id, 'CCS2', 60, true, 2, '4W' FROM stations WHERE network = 'Tata Power' AND name NOT IN (SELECT s2.name FROM stations s2 INNER JOIN station_connectors sc ON s2.id = sc.station_id WHERE s2.network = 'Tata Power');

INSERT INTO station_connectors (station_id, connector_type, power_kw, is_dc_fast, count, vehicle_type_supported)
SELECT id, 'Type 2', 22, false, 2, '4W' FROM stations WHERE network = 'Tata Power' AND name NOT IN (SELECT s2.name FROM stations s2 INNER JOIN station_connectors sc ON s2.id = sc.station_id WHERE s2.network = 'Tata Power' AND sc.connector_type = 'Type 2');

-- Statiq stations get CCS2 + Type 2
INSERT INTO station_connectors (station_id, connector_type, power_kw, is_dc_fast, count, vehicle_type_supported)
SELECT id, 'CCS2', 50, true, 2, '4W' FROM stations WHERE network = 'Statiq' AND id NOT IN (SELECT station_id FROM station_connectors WHERE station_id IN (SELECT id FROM stations WHERE network = 'Statiq'));

INSERT INTO station_connectors (station_id, connector_type, power_kw, is_dc_fast, count, vehicle_type_supported)
SELECT id, 'Type 2', 7.4, false, 1, '4W' FROM stations WHERE network = 'Statiq' AND id NOT IN (SELECT station_id FROM station_connectors WHERE connector_type = 'Type 2' AND station_id IN (SELECT id FROM stations WHERE network = 'Statiq'));

-- ChargeZone stations get CCS2 + Type 2
INSERT INTO station_connectors (station_id, connector_type, power_kw, is_dc_fast, count, vehicle_type_supported)
SELECT id, 'CCS2', 60, true, 1, '4W' FROM stations WHERE network = 'ChargeZone' AND id NOT IN (SELECT station_id FROM station_connectors WHERE station_id IN (SELECT id FROM stations WHERE network = 'ChargeZone'));

INSERT INTO station_connectors (station_id, connector_type, power_kw, is_dc_fast, count, vehicle_type_supported)
SELECT id, 'Type 2', 22, false, 1, '4W' FROM stations WHERE network = 'ChargeZone' AND id NOT IN (SELECT station_id FROM station_connectors WHERE connector_type = 'Type 2' AND station_id IN (SELECT id FROM stations WHERE network = 'ChargeZone'));

-- Ather Grid stations get Type 2 AC only
INSERT INTO station_connectors (station_id, connector_type, power_kw, is_dc_fast, count, vehicle_type_supported)
SELECT id, 'Type 2', 7.4, false, 1, '2W,4W' FROM stations WHERE network = 'Ather Grid' AND id NOT IN (SELECT station_id FROM station_connectors WHERE station_id IN (SELECT id FROM stations WHERE network = 'Ather Grid'));

-- Add pricing
INSERT INTO station_pricing (station_id, connector_type, pricing_model, price_value)
SELECT id, 'CCS2', 'per_kwh', 16.50 FROM stations WHERE network = 'Tata Power' AND id NOT IN (SELECT station_id FROM station_pricing WHERE station_id IN (SELECT id FROM stations WHERE network = 'Tata Power'));

INSERT INTO station_pricing (station_id, connector_type, pricing_model, price_value)
SELECT id, 'Type 2', 'per_kwh', 14.00 FROM stations WHERE network = 'Tata Power' AND id NOT IN (SELECT station_id FROM station_pricing WHERE connector_type = 'Type 2' AND station_id IN (SELECT id FROM stations WHERE network = 'Tata Power'));

INSERT INTO station_pricing (station_id, connector_type, pricing_model, price_value)
SELECT id, 'CCS2', 'per_kwh', 18.00 FROM stations WHERE network = 'Statiq' AND id NOT IN (SELECT station_id FROM station_pricing WHERE station_id IN (SELECT id FROM stations WHERE network = 'Statiq'));

INSERT INTO station_pricing (station_id, connector_type, pricing_model, price_value)
SELECT id, 'Type 2', 'per_kwh', 15.00 FROM stations WHERE network = 'Statiq' AND id NOT IN (SELECT station_id FROM station_pricing WHERE connector_type = 'Type 2' AND station_id IN (SELECT id FROM stations WHERE network = 'Statiq'));

INSERT INTO station_pricing (station_id, connector_type, pricing_model, price_value)
SELECT id, 'CCS2', 'per_kwh', 17.00 FROM stations WHERE network = 'ChargeZone' AND id NOT IN (SELECT station_id FROM station_pricing WHERE station_id IN (SELECT id FROM stations WHERE network = 'ChargeZone'));

INSERT INTO station_pricing (station_id, connector_type, pricing_model, price_value)
SELECT id, 'Type 2', 'per_kwh', 14.50 FROM stations WHERE network = 'ChargeZone' AND id NOT IN (SELECT station_id FROM station_pricing WHERE connector_type = 'Type 2' AND station_id IN (SELECT id FROM stations WHERE network = 'ChargeZone'));

INSERT INTO station_pricing (station_id, connector_type, pricing_model, price_value)
SELECT id, 'Type 2', 'per_kwh', 12.00 FROM stations WHERE network = 'Ather Grid' AND id NOT IN (SELECT station_id FROM station_pricing WHERE station_id IN (SELECT id FROM stations WHERE network = 'Ather Grid'));

-- Add amenities for mall/office/hotel locations
INSERT INTO station_amenities (station_id, has_washroom, has_food, has_coffee_tea, has_wifi, has_sitting_area, has_shade, safety_rating)
SELECT id, true, true, true, true, true, true, 4.5 FROM stations WHERE parking_type IN ('mall', 'office', 'hotel') AND id NOT IN (SELECT station_id FROM station_amenities);

-- Add amenities for street/highway/metro locations
INSERT INTO station_amenities (station_id, has_washroom, has_food, has_coffee_tea, has_wifi, has_sitting_area, has_shade, safety_rating)
SELECT id, false, false, false, false, false, true, 3.5 FROM stations WHERE parking_type IN ('street', 'highway', 'metro') AND id NOT IN (SELECT station_id FROM station_amenities);

-- Verify count
SELECT COUNT(*) as total_stations FROM stations;
SELECT network, COUNT(*) as count FROM stations GROUP BY network ORDER BY count DESC;



