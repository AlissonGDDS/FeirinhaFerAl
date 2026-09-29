import { useState } from 'react';

function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setMensagem('');

    try {
      const resposta = await fetch('http://localhost:3000/api/usuarios/cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setMensagem(dados.erro || 'Erro ao cadastrar.');
        return;
      }

      setMensagem('Cadastro realizado com sucesso!');
      setNome('');
      setEmail('');
      setSenha('');
    } catch (err) {
      setMensagem('Erro de conexão: ' + err.message);
    }
  }

  return (
    <div className="form-container">
      <div className="form-cartao">
        <h1>Criar conta no Fer AL</h1>

        <form onSubmit={handleSubmit}>
          <div className="campo">
            <label>Nome</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>

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

          <button type="submit">Cadastrar</button>
        </form>

        {mensagem && <p className="mensagem">{mensagem}</p>}
      </div>
    </div>
  );
}

export default Cadastro;