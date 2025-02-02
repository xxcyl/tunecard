-- 為所有沒有 profile 的用戶創建 profile
insert into public.profiles (id, username, avatar_url)
select 
  au.id,
  coalesce(au.raw_user_meta_data->>'username', split_part(au.email, '@', 1)),
  coalesce(au.raw_user_meta_data->>'avatar_url', null)
from auth.users au
left join public.profiles p on p.id = au.id
where p.id is null;
