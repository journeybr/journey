import { createClient } from '@supabase/supabase-js';

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

async function verifyAuth(request) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const { data: { user } } = await adminClient().auth.getUser(token);
  return user;
}

export async function GET(request) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return Response.json({ error: 'SUPABASE_SERVICE_ROLE_KEY não configurada.' }, { status: 503 });
  }
  const user = await verifyAuth(request);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: { users }, error } = await adminClient().auth.admin.listUsers({ perPage: 200 });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ users });
}

export async function POST(request) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return Response.json({ error: 'SUPABASE_SERVICE_ROLE_KEY não configurada.' }, { status: 503 });
  }
  const user = await verifyAuth(request);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { email, password } = await request.json();
  if (!email || !password) return Response.json({ error: 'Email e senha são obrigatórios.' }, { status: 400 });

  const { data, error } = await adminClient().auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ user: data.user });
}
