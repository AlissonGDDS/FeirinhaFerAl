import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function Feedback() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [nota, setNota] = useState('5');
  const [comentario, setComentario] = useState('');
  const [mensagem, setMensagem] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setMensagem('');

    const token = localStorage.getItem('token');

    try {
      const resposta = await fetch('http://localhost:3000/api/feedback', {
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
        setMensagem(dados.erro || 'Erro ao enviar feedback.');
        return;
      }

      setMensagem('Feedback enviado com sucesso!');
      setTimeout(() => navigate('/minhas-feirinhas'), 1000);
    } catch (err) {
      setMensagem('Erro de conexão: ' + err.message);
    }
  }

  return (
    <div className="form-container">
      <div className="form-cartao">
        <h1>Deixar feedback</h1>
        <p className="subtitulo" style={{ textAlign: 'center' }}>
          Como foi sua experiência organizando essa feirinha pelo Fer AL?
        </p>

        <form onSubmit={handleSubmit}>
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
              placeholder="Conte como foi usar a plataforma, sugestões de melhoria..."
            />
          </div>

          <button type="submit">Enviar feedback</button>
        </form>

        {mensagem && <p className="mensagem">{mensagem}</p>}
      </div>
    </div>
  );
}

export default Feedback;