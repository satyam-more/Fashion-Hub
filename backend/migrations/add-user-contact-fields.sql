-- Add contact and address fields to users table
-- This migration adds phone, city, state, and address columns directly to the users table

USE `fashion_hub`;

-- Add new columns to users table
ALTER TABLE `users`
ADD COLUMN `phone` varchar(20) DEFAULT NULL AFTER `password`,
ADD COLUMN `city` varchar(50) DEFAULT NULL AFTER `phone`,
ADD COLUMN `state` varchar(50) DEFAULT NULL AFTER `city`,
ADD COLUMN `address` text DEFAULT NULL AFTER `state`;

-- Add indexes for better query performance
ALTER TABLE `users`
ADD INDEX `idx_city` (`city`),
ADD INDEX `idx_state` (`state`);
