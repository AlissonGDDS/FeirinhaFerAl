import { useEffect, useState } from 'react';

function PainelAdmin() {
  const [usuarios, setUsuarios] = useState([]);
  const [feirinhas, setFeirinhas] = useState([]);
  const [aba, setAba] = useState('usuarios');
  const [erro, setErro] = useState(null);

  function carregarDados() {
    const token = localStorage.getItem('token');

    fetch('http://localhost:3000/api/admin/usuarios', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Acesso restrito a administradores.');
        return res.json();
      })
      .then(setUsuarios)
      .catch((err) => setErro(err.message));

    fetch('http://localhost:3000/api/admin/feirinhas', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setFeirinhas);
  }

  useEffect(() => {
    carregarDados();
  }, []);

  async function handleBloquear(id) {
    const token = localStorage.getItem('token');
    await fetch(`http://localhost:3000/api/admin/usuarios/${id}/bloquear`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    });
    carregarDados();
  }

  async function handleApagarFeirinha(id) {
    const confirmar = window.confirm('Apagar esta feirinha permanentemente?');
    if (!confirmar) return;

    const token = localStorage.getItem('token');
    await fetch(`http://localhost:3000/api/admin/feirinhas/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    carregarDados();
  }

  if (erro) return <p className="container">{erro}</p>;

  return (
    <div className="container">
      <h1>Painel administrativo</h1>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setAba('usuarios')}
          style={{ backgroundColor: aba === 'usuarios' ? 'var(--primaria-escura)' : 'var(--primaria)' }}
        >
          Usuários ({usuarios.length})
        </button>
        <button
          onClick={() => setAba('feirinhas')}
          style={{ backgroundColor: aba === 'feirinhas' ? 'var(--primaria-escura)' : 'var(--primaria)' }}
        >
          Feirinhas ({feirinhas.length})
        </button>
      </div>

      {aba === 'usuarios' && (
        <div>
          {usuarios.map((u) => (
            <div key={u.id} className="cartao" style={{ padding: '1rem', marginBottom: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{u.nome}</strong> — {u.email}
                <p className="cartao-info">Tipo: {u.tipo} • Status: {u.ativo ? 'Ativo' : 'Bloqueado'}</p>
              </div>
              <button
                onClick={() => handleBloquear(u.id)}
                style={{ backgroundColor: u.ativo ? '#dc2626' : '#16a34a' }}
              >
                {u.ativo ? 'Bloquear' : 'Desbloquear'}
              </button>
            </div>
          ))}
        </div>
      )}

      {aba === 'feirinhas' && (
        <div>
          {feirinhas.map((f) => (
            <div key={f.id} className="cartao" style={{ padding: '1rem', marginBottom: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{f.nome}</strong>
                <p className="cartao-info">Organizador: {f.organizador_nome} • Status: {f.status}</p>
              </div>
              <button onClick={() => handleApagarFeirinha(f.id)} style={{ backgroundColor: '#dc2626' }}>
                Apagar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PainelAdmin;