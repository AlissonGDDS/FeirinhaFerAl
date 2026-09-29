import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function Mapa() {
  const [feirinhas, setFeirinhas] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/api/feirinhas')
      .then((res) => res.json())
      .then((dados) => {
        const comCoordenadas = dados.filter((f) => f.latitude && f.longitude);
        setFeirinhas(comCoordenadas);
      });
  }, []);

  const centroAlagoas = [-9.6658, -35.735];

  return (
    <div className="container">
      <h1>Mapa de feirinhas</h1>
      <p className="subtitulo">Encontre feirinhas próximas a você</p>

      {feirinhas.length === 0 && (
        <p>Nenhuma feirinha com localização cadastrada ainda.</p>
      )}

      <div style={{ height: '500px', borderRadius: '12px', overflow: 'hidden', border: '2px solid #94a3b8' }}>
        <MapContainer center={centroAlagoas} zoom={8} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {feirinhas.map((f) => (
            <Marker key={f.id} position={[f.latitude, f.longitude]}>
              <Popup>
                <strong>{f.nome}</strong>
                <br />
                {f.cidade} - {f.estado}
                <br />
                <Link to={`/feirinha/${f.id}`}>Ver detalhes</Link>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

export default Mapa;