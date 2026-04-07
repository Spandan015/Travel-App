import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet's broken default icon paths in Vite/webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom blue marker for primary location
const blueIcon = new L.Icon({
  iconUrl:       'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize:      [25, 41],
  iconAnchor:    [12, 41],
  popupAnchor:   [1, -34],
  shadowSize:    [41, 41],
});

// Custom red marker for secondary locations
const redIcon = new L.Icon({
  iconUrl:       'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize:      [25, 41],
  iconAnchor:    [12, 41],
  popupAnchor:   [1, -34],
  shadowSize:    [41, 41],
});

// Auto-fits map to show all markers
function FitBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length === 0) return;
    if (positions.length === 1) {
      map.setView(positions[0], 13);
    } else {
      map.fitBounds(positions, { padding: [40, 40] });
    }
  }, [map, positions]);
  return null;
}

export default function MapView({ markers = [], height = '360px', zoom = 13, title }) {
  // Filter valid markers only
  const valid = markers.filter(m => m.lat && m.lng && !isNaN(m.lat) && !isNaN(m.lng));

  if (valid.length === 0) return null;

  // Center on first marker
  const center = [valid[0].lat, valid[0].lng];
  const positions = valid.map(m => [m.lat, m.lng]);

  return (
    <div style={{ fontFamily: 'Roboto, sans-serif' }}>
      {title && (
        <h2 style={{ fontSize: 16, fontWeight: 800, color: '#1E2D3D', margin: '0 0 14px' }}>
          {title}
        </h2>
      )}

      {/* Leaflet CSS — injected once */}
      <style>{`
        @import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
        .leaflet-container {
          border-radius: 14px;
          border: 1px solid #E4ECF3;
          font-family: 'Roboto', sans-serif !important;
          z-index: 0;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 10px !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.12) !important;
          font-family: 'Roboto', sans-serif !important;
          padding: 0 !important;
        }
        .leaflet-popup-content {
          margin: 0 !important;
          padding: 14px 16px !important;
          min-width: 160px;
        }
        .leaflet-popup-tip-container { margin-top: -1px; }
        .mv-popup-title { font-size:13px; font-weight:700; color:#1E2D3D; margin-bottom:3px; }
        .mv-popup-desc  { font-size:12px; color:#6b7c93; line-height:1.5; }
        .leaflet-control-attribution { font-size:10px !important; }
      `}</style>

      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height, width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBounds positions={positions} />

        {valid.map((m, i) => (
          <Marker
            key={i}
            position={[m.lat, m.lng]}
            icon={m.primary !== false && i === 0 ? blueIcon : redIcon}
          >
            <Popup>
              <div className="mv-popup-title">{m.title || 'Location'}</div>
              {m.description && <div className="mv-popup-desc">{m.description}</div>}
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10, fontSize: 11, color: '#98A2B3' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png" style={{ height: 16 }} alt="" />
          {valid[0].title || 'Location'}
        </div>
        {valid.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png" style={{ height: 16 }} alt="" />
            Other stops
          </div>
        )}
      </div>
    </div>
  );
}
