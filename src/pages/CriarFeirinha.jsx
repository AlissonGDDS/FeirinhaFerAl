import { useEffect, useState } from 'react';

function CriarFeirinha() {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [endereco, setEndereco] = useState('');
  const [cep, setCep] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [imagemArquivo, setImagemArquivo] = useState(null);
  const [enviandoImagem, setEnviandoImagem] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    fetch('http://localhost:3000/api/categorias')
      .then((res) => res.json())
      .then((dados) => setCategorias(dados));
  }, []);
    async function handleBuscarCep() {
    const cepLimpo = cep.replace(/\D/g, '');

    if (cepLimpo.length !== 8) {
      return;
    }

    try {
      const resposta = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const dados = await resposta.json();

      if (dados.erro) {
        setMensagem('CEP não encontrado.');
        return;
      }

      setEndereco(`${dados.logradouro}, ${dados.bairro}`);
      setCidade(dados.localidade);
      setEstado(dados.uf);
    } catch (err) {
      setMensagem('Erro ao buscar CEP.');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMensagem('');

    const token = localStorage.getItem('token');

    if (!token) {
      setMensagem('Você precisa fazer login primeiro.');
      return;
    }

    try {
      let imagemUrl = null;

      if (imagemArquivo) {
        setEnviandoImagem(true);
        const formData = new FormData();
        formData.append('imagem', imagemArquivo);

        const respostaUpload = await fetch('http://localhost:3000/api/upload', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const dadosUpload = await respostaUpload.json();
        setEnviandoImagem(false);

        if (!respostaUpload.ok) {
          setMensagem(dadosUpload.erro || 'Erro ao enviar imagem.');
          return;
        }

        imagemUrl = dadosUpload.imagem_url;
      }

      const resposta = await fetch('http://localhost:3000/api/feirinhas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nome,
          descricao,
          data_inicio: dataInicio,
          cidade,
          estado,
          endereco,
          cep,
          categoria_id: categoriaId || null,
          imagem_url: imagemUrl,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setMensagem(dados.erro || 'Erro ao criar feirinha.');
        return;
      }

      setMensagem('Feirinha criada com sucesso!');
      setNome('');
      setDescricao('');
      setDataInicio('');
      setCidade('');
      setEstado('');
      setEndereco('');
      setCep('');
      setCategoriaId('');
      setImagemArquivo(null);
    } catch (err) {
      setMensagem('Erro de conexão: ' + err.message);
    }
  }

  return (
    <div className="form-container">
      <div className="form-cartao">
        <h1>Criar feirinha</h1>

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
            <label>Descrição</label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>

          <div className="campo">
            <label>Imagem (opcional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImagemArquivo(e.target.files[0])}
            />
          </div>

          <div className="campo">
            <label>Categoria</label>
            <select
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
            >
              <option value="">Selecione...</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>

          <div className="campo">
            <label>Data de início</label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              required
            />
          </div>

          <div className="campo">
            <label>CEP</label>
            <input
              type="text"
              value={cep}
              onChange={(e) => setCep(e.target.value)}
              onBlur={handleBuscarCep}
              placeholder="00000-000"
              maxLength={9}
            />
          </div>

          <div className="campo">
            <label>Endereço</label>
            <input
              type="text"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              placeholder="Rua, bairro"
            />
          </div>

          <div className="campo">
            <label>Cidade</label>
            <input
              type="text"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
            />
          </div>

          <div className="campo">
            <label>Estado (sigla)</label>
            <input
              type="text"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              maxLength={2}
            />
          </div>

          <button type="submit" disabled={enviandoImagem}>
            {enviandoImagem ? 'Enviando imagem...' : 'Criar'}
          </button>
        </form>

        {mensagem && <p className="mensagem">{mensagem}</p>}
      </div>
    </div>
  );
}

export default CriarFeirinha;