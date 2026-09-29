import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Agenda() {
  const [feirinhas, setFeirinhas] = useState([]);
  const [filtroCidade, setFiltroCidade] = useState('');
  const [filtroData, setFiltroData] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/api/feirinhas')
      .then((res) => res.json())
      .then((dados) => {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const futuras = dados
          .filter((f) => new Date(f.data_inicio) >= hoje)
          .sort((a, b) => new Date(a.data_inicio) - new Date(b.data_inicio));

        setFeirinhas(futuras);
        setCarregando(false);
      });
  }, []);

  const feirinhasFiltradas = feirinhas.filter((f) => {
    const bateCidade = filtroCidade
      ? f.cidade?.toLowerCase().includes(filtroCidade.toLowerCase())
      : true;
    const bateData = filtroData
      ? f.data_inicio.slice(0, 10) === filtroData
      : true;
    return bateCidade && bateData;
  });

  if (carregando) return <p className="container">Carregando agenda...</p>;

  return (
    <div className="container">
      <h1>Agenda de feirinhas</h1>
      <p className="subtitulo">Próximos eventos em Alagoas, em ordem de data</p>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <div className="campo" style={{ maxWidth: '220px' }}>
          <label>Filtrar por cidade</label>
          <input
            type="text"
            value={filtroCidade}
            onChange={(e) => setFiltroCidade(e.target.value)}
            placeholder="Ex: Maceió"
          />
        </div>

        <div className="campo" style={{ maxWidth: '220px' }}>
          <label>Filtrar por data</label>
          <input
            type="date"
            value={filtroData}
            onChange={(e) => setFiltroData(e.target.value)}
          />
        </div>
      </div>

      {feirinhasFiltradas.length === 0 && <p>Nenhum evento futuro encontrado.</p>}

      {feirinhasFiltradas.map((f) => (
        <Link key={f.id} to={`/feirinha/${f.id}`} className="cartao-link">
          <div className="cartao" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', marginBottom: '0.8rem' }}>
            <div style={{
              minWidth: '70px',
              textAlign: 'center',
              backgroundColor: 'var(--primaria)',
              color: 'white',
              borderRadius: '8px',
              padding: '0.5rem',
            }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>
                {new Date(f.data_inicio).getDate().toString().padStart(2, '0')}
              </div>
              <div style={{ fontSize: '0.75rem' }}>
                {new Date(f.data_inicio).toLocaleDateString('pt-BR', { month: 'short' })}
              </div>
            </div>

            <div>
              <strong>{f.nome}</strong>
              {f.categoria_nome && <span className="badge" style={{ marginLeft: '0.5rem' }}>{f.categoria_nome}</span>}
              <p className="cartao-info">📍 {f.cidade} - {f.estado}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default Agenda;