CREATE TABLE push_subscriptions (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  student_id TEXT NOT NULL UNIQUE,
  subscription JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to manage their own subscriptions"
ON push_subscriptions
FOR ALL
TO authenticated
USING (auth.uid()::text = student_id)
WITH CHECK (auth.uid()::text = student_id);