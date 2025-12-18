-- Remove admin role for neven@test.ai
DELETE FROM user_roles 
WHERE user_id = 'bf598a36-4348-4db8-98ce-011bf6f47848' 
AND role = 'admin';