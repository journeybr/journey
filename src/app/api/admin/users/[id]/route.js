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

export async function DELETE(request, { params }) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return Response.json({ error: 'SUPABASE_SERVICE_ROLE_KEY não configurada.' }, { status: 503 });
  }
  const caller = await verifyAuth(request);
  if (!caller) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  if (id === caller.id) return Response.json({ error: 'Você não pode remover sua própria conta.' }, { status: 400 });

  const { error } = await adminClient().auth.admin.deleteUser(id);
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ success: true });
}

export async function POST(request, { params }) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return Response.json({ error: 'SUPABASE_SERVICE_ROLE_KEY não configurada.' }, { status: 503 });
  }
  const caller = await verifyAuth(request);
  if (!caller) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { data: target, error: fetchErr } = await adminClient().auth.admin.getUserById(id);
  if (fetchErr || !target?.user) return Response.json({ error: 'Usuário não encontrado.' }, { status: 404 });

  const { error } = await adminClient().auth.resetPasswordForEmail(target.user.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || ''}/login`,
  });
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ success: true });
}
