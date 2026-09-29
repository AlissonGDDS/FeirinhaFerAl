import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
    const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setMensagem('');

    try {
      const resposta = await fetch('http://localhost:3000/api/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setMensagem(dados.erro || 'Erro ao entrar.');
        return;
      }

            localStorage.setItem('token', dados.token);
      localStorage.setItem('usuario', JSON.stringify(dados));
      setMensagem(`Bem-vindo, ${dados.nome}!`);
      setTimeout(() => navigate('/feirinhas'), 800);
    } catch (err) {
      setMensagem('Erro de conexão: ' + err.message);
    }
  }

  return (
    <div className="form-container">
      <div className="form-cartao">
        <h1>Entrar no Fer AL</h1>

        <form onSubmit={handleSubmit}>
          <div className="campo">
            <label>E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="campo">
            <label>Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          <button type="submit">Entrar</button>
        </form>

        {mensagem && <p className="mensagem">{mensagem}</p>}
      </div>
    </div>
  );
}

export default Login;