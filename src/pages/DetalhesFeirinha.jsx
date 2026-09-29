import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function DetalhesFeirinha() {
  const { id } = useParams();

  const [feirinha, setFeirinha] = useState(null);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [nota, setNota] = useState('5');
  const [comentario, setComentario] = useState('');
   const [mensagem, setMensagem] = useState('');
  const [favoritado, setFavoritado] = useState(false);
  const [carregando, setCarregando] = useState(true);

  function carregarAvaliacoes() {
    fetch(`http://localhost:3000/api/avaliacoes/feirinha/${id}`)
      .then((res) => res.json())
      .then((dados) => setAvaliacoes(dados));
  }

   useEffect(() => {
    fetch(`http://localhost:3000/api/feirinhas/${id}`)
      .then((res) => res.json())
      .then((dados) => {
        setFeirinha(dados);
        setCarregando(false);
      });

    carregarAvaliacoes();

    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://localhost:3000/api/favoritos', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((favoritos) => {
          setFavoritado(favoritos.some((f) => f.id === id));
        });
    }
  }, [id]);
    async function handleFavoritar() {
    const token = localStorage.getItem('token');

    if (!token) {
      setMensagem('Você precisa fazer login para favoritar.');
      return;
    }

    try {
      if (favoritado) {
        await fetch(`http://localhost:3000/api/favoritos/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        setFavoritado(false);
      } else {
        await fetch('http://localhost:3000/api/favoritos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ feirinha_id: id }),
        });
        setFavoritado(true);
      }
    } catch (err) {
      setMensagem('Erro de conexão: ' + err.message);
    }
  }

  async function handleAvaliar(e) {
    e.preventDefault();
    setMensagem('');

    const token = localStorage.getItem('token');

    if (!token) {
      setMensagem('Você precisa fazer login para avaliar.');
      return;
    }

    try {
      const resposta = await fetch('http://localhost:3000/api/avaliacoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          feirinha_id: id,
          nota: Number(nota),
          comentario,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setMensagem(dados.erro || 'Erro ao avaliar.');
        return;
      }

      setMensagem('Avaliação enviada com sucesso!');
      setComentario('');
      carregarAvaliacoes();
    } catch (err) {
      setMensagem('Erro de conexão: ' + err.message);
    }
  }

  if (carregando) return <p className="container">Carregando...</p>;
  if (!feirinha) return <p className="container">Feirinha não encontrada.</p>;

  return (
    <div className="container">
      <div className="cartao" style={{ marginBottom: '2rem' }}>
        <div
          className="cartao-imagem"
          style={{
            height: '220px',
            backgroundImage: feirinha.imagem_url
              ? `url(http://localhost:3000${feirinha.imagem_url})`
              : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
          }}
        >
          {!feirinha.imagem_url && <span style={{ fontSize: '3rem' }}>🎪</span>}
        </div>

        <div className="cartao-conteudo">
          {feirinha.categoria_nome && <span className="badge">{feirinha.categoria_nome}</span>}
          <h1>{feirinha.nome}</h1>
          <p className="cartao-descricao">{feirinha.descricao}</p>
                   <p className="cartao-info">📍 {feirinha.cidade} - {feirinha.estado}</p>
          <p className="cartao-info">📅 {new Date(feirinha.data_inicio).toLocaleDateString('pt-BR')}</p>

          <button
            onClick={handleFavoritar}
            style={{
              marginTop: '1rem',
              backgroundColor: favoritado ? '#dc2626' : 'var(--primaria)',
            }}
          >
            {favoritado ? '💔 Desfavoritar' : '❤️ Favoritar'}
          </button>
        </div>
      </div>

      <h2>Deixe sua avaliação</h2>
      <div className="cartao" style={{ padding: '1.4rem', marginBottom: '2rem' }}>
        <form onSubmit={handleAvaliar}>
          <div className="campo">
            <label>Nota</label>
            <select value={nota} onChange={(e) => setNota(e.target.value)}>
              <option value="5">⭐⭐⭐⭐⭐ (5)</option>
              <option value="4">⭐⭐⭐⭐ (4)</option>
              <option value="3">⭐⭐⭐ (3)</option>
              <option value="2">⭐⭐ (2)</option>
              <option value="1">⭐ (1)</option>
            </select>
          </div>

          <div className="campo">
            <label>Comentário</label>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Conte como foi sua experiência..."
            />
          </div>

          <button type="submit">Enviar avaliação</button>
        </form>

        {mensagem && <p className="mensagem">{mensagem}</p>}
      </div>

      <h2>Avaliações ({avaliacoes.length})</h2>

      {avaliacoes.length === 0 && <p>Ainda não há avaliações para esta feirinha.</p>}

      {avaliacoes.map((a) => (
        <div key={a.id} className="cartao" style={{ padding: '1.2rem', marginBottom: '1rem' }}>
          <strong>{'⭐'.repeat(a.nota)}</strong> — <span>{a.usuario_nome}</span>
          {a.comentario && <p className="cartao-descricao" style={{ marginTop: '0.4rem' }}>{a.comentario}</p>}
        </div>
      ))}
    </div>
  );
}

export default DetalhesFeirinha;