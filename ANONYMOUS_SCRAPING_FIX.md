# Fix for Anonymous Website Scraping Feature

This document provides instructions to fix the issue with anonymous users getting a 500 error ("Failed to create scraping record") when trying to use the website scraping feature.

## The Problem

1. **Data Type Mismatch**: The `user_id` column in the `website_scraping` table is defined as a UUID type, but the code was sending the string 'anonymous' for unauthenticated users.

2. **RLS Policy Inconsistency**: The Row Level Security policy for anonymous users was looking for `user_id = 'anonymous' OR user_id IS NULL`, but since the column is UUID type, comparing with the string 'anonymous' doesn't work properly.

## Solution

We've made the following changes:

1. **Client-side Code**: 
   - Updated `src/modules/offer/services/webscraping.ts` to use `null` instead of 'anonymous' for unauthenticated users

2. **Edge Function**: 
   - Updated `supabase/functions/scrape-offer-context/index.ts` to use `null` instead of 'anonymous' for anonymous users

3. **Database Policy**: 
   - Created `fix_anonymous_scraping.sql` with updates to the RLS policies

## Implementation Steps

1. **Apply the SQL changes**:
   - Go to Supabase Dashboard > SQL Editor
   - Run the contents of `fix_anonymous_scraping.sql` 

2. **Deploy the updated Edge Function**:
   Run the following command (requires Docker Desktop to be running):
   ```bash
   npx supabase functions deploy scrape-offer-context
   ```

3. **Deploy the client-side changes**:
   Push the changes to the repository and deploy the app through your normal deployment process.

## Verification

After implementing these changes, anonymous users should be able to use the website scraping feature without encountering the 500 error. 