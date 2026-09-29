import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function EditarFeirinha() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [imagemAtual, setImagemAtual] = useState(null);
  const [imagemArquivo, setImagemArquivo] = useState(null);
  const [enviandoImagem, setEnviandoImagem] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/api/feirinhas')
      .then((res) => res.json())
      .then((todas) => {
        const feirinha = todas.find((f) => f.id === id);
        if (feirinha) {
          setNome(feirinha.nome);
          setDescricao(feirinha.descricao || '');
          setDataInicio(feirinha.data_inicio.slice(0, 10));
          setCep(feirinha.cep || '');
          setEndereco(feirinha.endereco || '');
          setCidade(feirinha.cidade || '');
          setEstado(feirinha.estado || '');
          setImagemAtual(feirinha.imagem_url);
        }
        setCarregando(false);
      });
  }, [id]);

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

    try {
      let imagemUrl = imagemAtual;

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

      const resposta = await fetch(`http://localhost:3000/api/feirinhas/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nome,
          descricao,
          data_inicio: dataInicio,
          cep,
          endereco,
          cidade,
          estado,
          imagem_url: imagemUrl,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setMensagem(dados.erro || 'Erro ao editar.');
        return;
      }

      setMensagem('Feirinha atualizada com sucesso!');
      setTimeout(() => navigate('/minhas-feirinhas'), 1000);
    } catch (err) {
      setMensagem('Erro de conexão: ' + err.message);
    }
  }

  if (carregando) return <p className="container">Carregando...</p>;

  return (
    <div className="form-container">
      <div className="form-cartao">
        <h1>Editar feirinha</h1>

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
            <label>Imagem atual</label>
            {imagemAtual ? (
              <img
                src={`http://localhost:3000${imagemAtual}`}
                alt="Imagem atual"
                style={{ width: '100%', borderRadius: '8px', marginBottom: '0.8rem' }}
              />
            ) : (
              <p className="cartao-info">Nenhuma imagem cadastrada ainda.</p>
            )}

            <label>Trocar imagem (opcional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImagemArquivo(e.target.files[0])}
            />
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
            {enviandoImagem ? 'Enviando imagem...' : 'Salvar alterações'}
          </button>
        </form>

        {mensagem && <p className="mensagem">{mensagem}</p>}
      </div>
    </div>
  );
}

export default EditarFeirinha;