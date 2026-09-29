import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function MinhasFeirinhas() {
  const [feirinhas, setFeirinhas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  function carregarFeirinhas() {
    const token = localStorage.getItem('token');

    if (!token) {
      setErro('Você precisa fazer login primeiro.');
      setCarregando(false);
      return;
    }

    fetch('http://localhost:3000/api/feirinhas/minhas', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((dados) => {
        setFeirinhas(dados);
        setCarregando(false);
      })
      .catch((err) => {
        setErro(err.message);
        setCarregando(false);
      });
  }

  useEffect(() => {
    carregarFeirinhas();
  }, []);

  async function handleApagar(id) {
    const confirmar = window.confirm('Tem certeza que quer apagar esta feirinha?');
    if (!confirmar) return;

    const token = localStorage.getItem('token');

    try {
      const resposta = await fetch(`http://localhost:3000/api/feirinhas/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!resposta.ok) {
        const dados = await resposta.json();
        alert(dados.erro || 'Erro ao apagar.');
        return;
      }

      carregarFeirinhas();
    } catch (err) {
      alert('Erro de conexão: ' + err.message);
    }
  }

  if (carregando) return <p className="container">Carregando...</p>;
  if (erro) return <p className="container">{erro}</p>;

  return (
    <div className="container">
      <h1>Minhas feirinhas</h1>
      <p className="subtitulo">Eventos que você criou como organizador</p>

      {feirinhas.length === 0 && <p>Você ainda não criou nenhuma feirinha.</p>}

      <div className="grid-cartoes">
        {feirinhas.map((f) => (
          <div key={f.id} className="cartao">
            <h3>{f.nome}</h3>
            <p className="cartao-descricao">{f.descricao}</p>
            <p className="cartao-info">📍 {f.cidade} - {f.estado}</p>
            <p className="cartao-info">📅 {new Date(f.data_inicio).toLocaleDateString('pt-BR')}</p>
            <p className="cartao-info">Status: {f.status}</p>

            <Link to={`/editar-feirinha/${f.id}`}>
              <button style={{ marginTop: '0.8rem', width: '100%' }}>Editar</button>
            </Link>

            <Link to={`/feedback/${f.id}`}>
              <button style={{ marginTop: '0.5rem', width: '100%', backgroundColor: '#16a34a' }}>
                Deixar feedback
              </button>
            </Link>

            <button
              onClick={() => handleApagar(f.id)}
              style={{ marginTop: '0.5rem', width: '100%', backgroundColor: '#dc2626' }}
            >
              Apagar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MinhasFeirinhas;