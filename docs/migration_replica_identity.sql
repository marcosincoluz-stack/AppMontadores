-- Enable FULL replica identity to support realtime DELETE events filtering
-- This allows access to all columns (like assigned_to) during a DELETE event

ALTER TABLE "public"."jobs" REPLICA IDENTITY FULL;
