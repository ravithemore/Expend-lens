-- Seed Default User
INSERT INTO users (id, email, password_hash)
VALUES ('d3b07384-d113-4416-bffe-6a696afc6f8e', 'dev@spendlens.com', '$2a$10$4n9fR3U4L5J6r7y8w9v0uO0v6y7x8w9v0uO0v6y7x8w9v0uO0v6y');

-- Seed Standard Categories
INSERT INTO categories (id, name, type, icon, color, parent_id) VALUES
('c1cf8392-4116-bffe-6a69-6afc6f8e0100', 'Income', 'INCOME', 'arrow_downward', '#47664b', NULL),
('c1cf8392-4116-bffe-6a69-6afc6f8e0200', 'Utilities & Bills', 'EXPENSE', 'receipt', '#7a7583', NULL),
('c1cf8392-4116-bffe-6a69-6afc6f8e0300', 'Food & Dining', 'EXPENSE', 'restaurant', '#674bb5', NULL),
('c1cf8392-4116-bffe-6a69-6afc6f8e0400', 'Shopping', 'EXPENSE', 'shopping_bag', '#ba1a1a', NULL),
('c1cf8392-4116-bffe-6a69-6afc6f8e0500', 'Travel & Commute', 'EXPENSE', 'directions_car', '#7c2d22', NULL),
('c1cf8392-4116-bffe-6a69-6afc6f8e0600', 'Health & Wellness', 'EXPENSE', 'medical_services', '#9a4337', NULL),
('c1cf8392-4116-bffe-6a69-6afc6f8e0700', 'Investments', 'EXPENSE', 'trending_up', '#adcfaf', NULL),
('c1cf8392-4116-bffe-6a69-6afc6f8e0800', 'Transfers', 'EXPENSE', 'swap_horiz', '#cac4d4', NULL),
('c1cf8392-4116-bffe-6a69-6afc6f8e9900', 'Uncategorized', 'EXPENSE', 'help', '#cac4d4', NULL);

-- Seed Core Merchants (f prefix is valid hex, replacing invalid m prefix)
INSERT INTO merchants (id, raw_name, clean_name, category_id, logo_url, website, confidence_score) VALUES
('f1cf8392-4116-bffe-6a69-6afc6f8e0100', 'ZOMATO', 'Zomato', 'c1cf8392-4116-bffe-6a69-6afc6f8e0300', '/assets/logos/zomato-logo.svg', 'zomato.com', 1.00),
('f1cf8392-4116-bffe-6a69-6afc6f8e0200', 'SWIGGY', 'Swiggy', 'c1cf8392-4116-bffe-6a69-6afc6f8e0300', '/assets/logos/swiggy-logo.svg', 'swiggy.com', 1.00),
('f1cf8392-4116-bffe-6a69-6afc6f8e0300', 'AMAZON', 'Amazon', 'c1cf8392-4116-bffe-6a69-6afc6f8e0400', '/assets/logos/amazon-logo.svg', 'amazon.in', 1.00),
('f1cf8392-4116-bffe-6a69-6afc6f8e0400', 'FLIPKART', 'Flipkart', 'c1cf8392-4116-bffe-6a69-6afc6f8e0400', '/assets/logos/flipkart-logo.svg', 'flipkart.com', 1.00),
('f1cf8392-4116-bffe-6a69-6afc6f8e0500', 'UBER', 'Uber', 'c1cf8392-4116-bffe-6a69-6afc6f8e0500', '/assets/logos/uber-logo.svg', 'uber.com', 1.00),
('f1cf8392-4116-bffe-6a69-6afc6f8e0600', 'OLA CABS', 'Ola', 'c1cf8392-4116-bffe-6a69-6afc6f8e0500', '/assets/logos/ola-logo.svg', 'olacabs.com', 1.00),
('f1cf8392-4116-bffe-6a69-6afc6f8e0700', 'NETFLIX', 'Netflix', 'c1cf8392-4116-bffe-6a69-6afc6f8e0200', '/assets/logos/netflix-logo.svg', 'netflix.com', 1.00),
('f1cf8392-4116-bffe-6a69-6afc6f8e0800', 'SPOTIFY', 'Spotify', 'c1cf8392-4116-bffe-6a69-6afc6f8e0200', '/assets/logos/spotify-logo.svg', 'spotify.com', 1.00);
