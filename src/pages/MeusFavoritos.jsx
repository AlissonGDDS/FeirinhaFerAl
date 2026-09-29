import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function MeusFavoritos() {
  const [favoritos, setFavoritos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setErro('Você precisa fazer login primeiro.');
      setCarregando(false);
      return;
    }

    fetch('http://localhost:3000/api/favoritos', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((dados) => {
        setFavoritos(dados);
        setCarregando(false);
      })
      .catch((err) => {
        setErro(err.message);
        setCarregando(false);
      });
  }, []);

  if (carregando) return <p className="container">Carregando...</p>;
  if (erro) return <p className="container">{erro}</p>;

  return (
    <div className="container">
      <h1>Meus favoritos</h1>
      <p className="subtitulo">Feirinhas que você marcou como interesse</p>

      {favoritos.length === 0 && <p>Você ainda não favoritou nenhuma feirinha.</p>}

      <div className="grid-cartoes">
        {favoritos.map((f) => (
          <Link key={f.id} to={`/feirinha/${f.id}`} className="cartao-link">
            <div className="cartao">
              <div
                className="cartao-imagem"
                style={{
                  backgroundImage: f.imagem_url
                    ? `url(http://localhost:3000${f.imagem_url})`
                    : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                }}
              >
                {!f.imagem_url && <span>🎪</span>}
              </div>

              <div className="cartao-conteudo">
                {f.categoria_nome && <span className="badge">{f.categoria_nome}</span>}
                <h3>{f.nome}</h3>
                <p className="cartao-descricao">{f.descricao}</p>
                <p className="cartao-info">📍 {f.cidade} - {f.estado}</p>
                <p className="cartao-info">📅 {new Date(f.data_inicio).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default MeusFavoritos;