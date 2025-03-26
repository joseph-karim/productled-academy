/*
  # Add RLS debug function

  1. Changes
    - Add RPC function to check active policies on a table
    - Help diagnose permission issues

  2. Security
    - Read-only function
    - Used for debugging only
*/

-- Create function to check active policies
CREATE OR REPLACE FUNCTION check_rls_policies(table_name text)
RETURNS TABLE(
  policyname text,
  permissive text,
  roles text,
  cmd text,
  qual text,
  with_check text
) LANGUAGE sql SECURITY DEFINER AS $$
  SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
  FROM
    pg_policies
  WHERE
    tablename = table_name;
$$;