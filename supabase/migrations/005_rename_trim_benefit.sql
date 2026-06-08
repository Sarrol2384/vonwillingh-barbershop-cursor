-- Rename legacy membership benefit label in settings and usage history
update public.business_settings
set
  settings = jsonb_set(
    settings,
    '{subscription,benefits}',
    (
      select coalesce(
        jsonb_agg(
          to_jsonb(
            case
              when lower(value) in ('1 free beard trim', 'free beard trim', '1 trim', 'trim')
                then 'Trim'
              else value
            end
          )
        ),
        '[]'::jsonb
      )
      from jsonb_array_elements_text(settings->'subscription'->'benefits') as value
    ),
    true
  ),
  updated_at = now()
where id = 1;

update public.member_benefit_usages
set benefit_name = 'Trim'
where lower(benefit_name) in ('1 free beard trim', 'free beard trim', '1 trim', 'trim');
