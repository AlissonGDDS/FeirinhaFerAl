import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Cadastro from './pages/Cadastro';
import Login from './pages/Login';
import CriarFeirinha from './pages/CriarFeirinha';
import MinhasFeirinhas from './pages/MinhasFeirinhas';
import EditarFeirinha from './pages/EditarFeirinha';
import DetalhesFeirinha from './pages/DetalhesFeirinha';
import MeusFavoritos from './pages/MeusFavoritos';
import PainelAdmin from './pages/PainelAdmin';
import Mapa from './pages/Mapa';
import Agenda from './pages/Agenda';
import Feedback from './pages/Feedback';
import './App.css';

function ListaFeirinhas() {
  const [feirinhas, setFeirinhas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [favoritos, setFavoritos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3000/api/feirinhas')
      .then((res) => res.json())
      .then((dados) => {
        setFeirinhas(dados);
        setCarregando(false);
      })
      .catch((err) => {
        setErro(err.message);
        setCarregando(false);
      });

    fetch('http://localhost:3000/api/categorias')
      .then((res) => res.json())
      .then((dados) => setCategorias(dados));

    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://localhost:3000/api/favoritos', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((dados) => setFavoritos(dados.map((f) => f.id)));
    }
  }, []);

  const feirinhasFiltradas = filtroCategoria
    ? feirinhas.filter((f) => f.categoria_id === filtroCategoria)
    : feirinhas;

  async function handleFavoritar(e, feirinhaId) {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem('token');
    if (!token) return;

    const jaFavoritado = favoritos.includes(feirinhaId);

    try {
      if (jaFavoritado) {
        await fetch(`http://localhost:3000/api/favoritos/${feirinhaId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        setFavoritos(favoritos.filter((id) => id !== feirinhaId));
      } else {
        await fetch('http://localhost:3000/api/favoritos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ feirinha_id: feirinhaId }),
        });
        setFavoritos([...favoritos, feirinhaId]);
      }
    } catch (err) {
      console.error(err);
    }
  }

  if (carregando) return <p className="container">Carregando feirinhas...</p>;
  if (erro) return <p className="container">Erro ao carregar: {erro}</p>;

  return (
    <div className="container">
      <h1>Feirinhas em Alagoas</h1>
      <p className="subtitulo">Encontre feiras e eventos perto de você</p>

      <div className="campo" style={{ maxWidth: '260px' }}>
        <label>Filtrar por categoria</label>
        <select
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
        >
          <option value="">Todas as categorias</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>
      </div>

      {feirinhasFiltradas.length === 0 && <p>Nenhuma feirinha encontrada.</p>}

      <div className="grid-cartoes">
        {feirinhasFiltradas.map((f) => (
          <Link key={f.id} to={`/feirinha/${f.id}`} className="cartao-link">
            <div className="cartao">
              <div
                className="cartao-imagem"
                style={{
                  backgroundImage: f.imagem_url
                    ? `url(http://localhost:3000${f.imagem_url})`
                    : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  position: 'relative',
                }}
              >
                {!f.imagem_url && <span>🎪</span>}

                {localStorage.getItem('token') && (
                  <button
                    onClick={(e) => handleFavoritar(e, f.id)}
                    style={{
                      position: 'absolute',
                      top: '0.6rem',
                      right: '0.6rem',
                      background: 'rgba(255,255,255,0.9)',
                      color: '#0f172a',
                      borderRadius: '50%',
                      width: '36px',
                      height: '36px',
                      padding: 0,
                      fontSize: '1.1rem',
                    }}
                  >
                    {favoritos.includes(f.id) ? '❤️' : '🤍'}
                  </button>
                )}
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

function TelaInicial() {
  return (
    <main className="inicio-acesso">
      <h1>Bem-vindo ao Fer AL</h1>
      <p>Entre na sua conta ou cadastre-se para acompanhar as feirinhas de Alagoas.</p>
      <div className="inicio-acoes">
        <Link className="inicio-botao principal" to="/login">Entrar</Link>
        <Link className="inicio-botao" to="/cadastro">Criar cadastro</Link>
      </div>
    </main>
  );
}

function App() {
  const navigate = useNavigate();
  const usuarioLogado = localStorage.getItem('token');
  const dadosUsuario = JSON.parse(localStorage.getItem('usuario') || 'null');
  const ehAdmin = dadosUsuario?.tipo === 'ADMIN';

  const [tema, setTema] = useState(localStorage.getItem('tema') || 'light');
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tema);
    localStorage.setItem('tema', tema);
  }, [tema]);

  function alternarTema() {
    setTema(tema === 'light' ? 'dark' : 'light');
  }

  function voltarTela() {
    navigate(-1);
  }

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/');
    window.location.reload();
  }

  return (
    <div>
      <nav className="navbar">
        <div className="navbar-acoes">
          <button type="button" className="nav-voltar" onClick={voltarTela}>
            ← Voltar
          </button>
          <button
            type="button"
            className="menu-abrir"
            onClick={() => setMenuAberto(true)}
            aria-label="Abrir menu de navegação"
            aria-expanded={menuAberto}
          >
            ☰
          </button>
        </div>
        <span className="logo">Fer AL</span>
        <div className="navbar-espacador" aria-hidden="true" />
      </nav>

      <div className={`menu-lateral ${menuAberto ? 'aberto' : ''}`}>
        <button
          type="button"
          className="menu-fechar"
          onClick={() => setMenuAberto(false)}
          aria-label="Fechar menu de navegação"
        >
          ✕
        </button>

        <button className="menu-tema" onClick={alternarTema}>
          {tema === 'light' ? 'Modo escuro' : 'Modo claro'}
        </button>

        <Link to="/feirinhas" onClick={() => setMenuAberto(false)}>Feirinhas</Link>
        <Link to="/mapa" onClick={() => setMenuAberto(false)}>Mapa</Link>
        <Link to="/agenda" onClick={() => setMenuAberto(false)}>Agenda</Link>

        {usuarioLogado ? (
          <>
            <Link to="/criar-feirinha" onClick={() => setMenuAberto(false)}>Criar feirinha</Link>
            <Link to="/minhas-feirinhas" onClick={() => setMenuAberto(false)}>Minhas feirinhas</Link>
            <Link to="/meus-favoritos" onClick={() => setMenuAberto(false)}>Meus favoritos</Link>
            {ehAdmin && <Link to="/admin" onClick={() => setMenuAberto(false)}>Painel Admin</Link>}
            <button onClick={handleLogout} style={{ marginTop: '1rem' }}>Sair</button>
          </>
        ) : (
          <>
            <Link to="/cadastro" onClick={() => setMenuAberto(false)}>Cadastro</Link>
            <Link to="/login" onClick={() => setMenuAberto(false)}>Login</Link>
          </>
        )}
      </div>

      {menuAberto && <div className="overlay" onClick={() => setMenuAberto(false)}></div>}

      <Routes>
        <Route path="/" element={<TelaInicial />} />
        <Route path="/feirinhas" element={<ListaFeirinhas />} />
        <Route path="/mapa" element={<Mapa />} />
        <Route path="/agenda" element={<Agenda />} />
        <Route path="/feedback/:id" element={<Feedback />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/criar-feirinha" element={<CriarFeirinha />} />
        <Route path="/minhas-feirinhas" element={<MinhasFeirinhas />} />
        <Route path="/editar-feirinha/:id" element={<EditarFeirinha />} />
        <Route path="/feirinha/:id" element={<DetalhesFeirinha />} />
        <Route path="/meus-favoritos" element={<MeusFavoritos />} />
        <Route path="/admin" element={<PainelAdmin />} />
      </Routes>
    </div>
  );
}

export default App;