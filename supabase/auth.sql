-- Reset everything first
drop trigger if exists check_email_before_sign_up on auth.users;
drop function if exists public.check_email_allowed() cascade;
drop function if exists public.add_allowed_email(text, uuid) cascade;
drop table if exists public.allowed_emails cascade;

-- Create allowed emails table
create table public.allowed_emails (
  email text primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Function to check if email is allowed
create or replace function public.check_email_allowed()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if not exists (select 1 from allowed_emails where email = new.email) then
    raise exception 'This email has not been invited to the testing program';
  end if;
  return new;
end;
$$;

-- Trigger for checking email before sign up
create trigger check_email_before_sign_up
  before insert on auth.users
  for each row
  execute procedure public.check_email_allowed();

-- Insert test email
insert into public.allowed_emails (email) values ('test@example.com');
