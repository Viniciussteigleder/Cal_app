\c nutriplan

GRANT ALL PRIVILEGES ON SCHEMA public TO nutriplan_app;
GRANT USAGE ON SCHEMA public TO nutriplan_app;
GRANT CREATE ON SCHEMA public TO nutriplan_app;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO nutriplan_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO nutriplan_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO nutriplan_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO nutriplan_app;
ALTER USER nutriplan_app CREATEDB;

-- Verify permissions
\du nutriplan_app
\dn+ public
