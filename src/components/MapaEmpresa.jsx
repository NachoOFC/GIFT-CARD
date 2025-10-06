"use client";
import { useEffect, useRef, useState } from 'react';

export default function MapaEmpresa({ direccion, ciudad, region, nombre }) {
  const mapRef = useRef(null);
  const [coordenadas, setCoordenadas] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [mapaListo, setMapaListo] = useState(false);

  useEffect(() => {
    // Geocodificar la dirección
    const geocodificar = async () => {
      try {
        let coordsEncontradas = null;
        
        // Estrategia 1: Buscar dirección específica en la ciudad
        if (direccion && ciudad && region) {
          const direccionEspecifica = `${direccion}, ${ciudad}, ${region}, Chile`;
          const url1 = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direccionEspecifica)}&limit=3&countrycodes=cl&addressdetails=1`;
          
          console.log('Buscando dirección específica:', direccionEspecifica);
          
          const response1 = await fetch(url1, {
            headers: { 'User-Agent': 'GiftCardApp/1.0' }
          });
          const data1 = await response1.json();
          console.log('Resultados dirección específica:', data1);
          
          // Filtrar resultados que realmente estén en la ciudad correcta
          if (data1 && data1.length > 0) {
            const resultadoEnCiudad = data1.find(item => 
              item.address && 
              (item.address.city?.toLowerCase().includes(ciudad.toLowerCase()) ||
               item.address.town?.toLowerCase().includes(ciudad.toLowerCase()) ||
               item.address.village?.toLowerCase().includes(ciudad.toLowerCase()) ||
               item.display_name?.toLowerCase().includes(ciudad.toLowerCase()))
            );
            
            if (resultadoEnCiudad) {
              coordsEncontradas = {
                lat: parseFloat(resultadoEnCiudad.lat),
                lng: parseFloat(resultadoEnCiudad.lon)
              };
              console.log('✓ Coordenadas encontradas (dirección en ciudad correcta):', coordsEncontradas);
            }
          }
        }
        
        // Estrategia 2: Si no encontró la dirección, buscar el barrio/sector en la ciudad
        if (!coordsEncontradas && ciudad) {
          // Extraer el sector de la dirección (ej: "Altos de Rucalhue")
          const palabrasClave = direccion?.match(/altos de \w+|sector \w+|villa \w+|\w+hue/gi);
          
          if (palabrasClave && palabrasClave.length > 0) {
            const sector = palabrasClave[0];
            const urlSector = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(`${sector}, ${ciudad}, Chile`)}&limit=1&countrycodes=cl`;
            console.log('Buscando sector:', `${sector}, ${ciudad}`);
            
            const responseSector = await fetch(urlSector, {
              headers: { 'User-Agent': 'GiftCardApp/1.0' }
            });
            const dataSector = await responseSector.json();
            
            if (dataSector && dataSector.length > 0) {
              coordsEncontradas = {
                lat: parseFloat(dataSector[0].lat),
                lng: parseFloat(dataSector[0].lon)
              };
              console.log('✓ Coordenadas encontradas (sector):', coordsEncontradas);
            }
          }
        }
        
        // Estrategia 3: Buscar solo la ciudad como fallback
        if (!coordsEncontradas && ciudad && region) {
          const urlCiudad = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(`${ciudad}, ${region}, Chile`)}&limit=1&countrycodes=cl`;
          console.log('Buscando ciudad:', `${ciudad}, ${region}`);
          
          const responseCiudad = await fetch(urlCiudad, {
            headers: { 'User-Agent': 'GiftCardApp/1.0' }
          });
          const dataCiudad = await responseCiudad.json();
          
          if (dataCiudad && dataCiudad.length > 0) {
            coordsEncontradas = {
              lat: parseFloat(dataCiudad[0].lat),
              lng: parseFloat(dataCiudad[0].lon)
            };
            console.log('✓ Coordenadas encontradas (ciudad):', coordsEncontradas);
          }
        }
        
        // Si encontró coordenadas, usarlas; si no, usar Santiago por defecto
        if (coordsEncontradas) {
          setCoordenadas(coordsEncontradas);
        } else {
          console.log('⚠ No se encontraron coordenadas, usando Santiago por defecto');
          setCoordenadas({ lat: -33.4489, lng: -70.6693 });
        }
        
      } catch (error) {
        console.error('Error geocodificando:', error);
        setCoordenadas({ lat: -33.4489, lng: -70.6693 });
      } finally {
        setCargando(false);
      }
    };

    geocodificar();
  }, [direccion, ciudad, region]);

  useEffect(() => {
    if (!coordenadas || !mapRef.current || cargando) return;

    // Pequeño delay para asegurar que el DOM esté listo
    const timeout = setTimeout(() => {
      // Cargar Leaflet dinámicamente
      import('leaflet').then((L) => {
        // Limpiar mapa anterior si existe
        if (mapRef.current._leaflet_id) {
          mapRef.current._leaflet_map?.remove();
        }

        console.log('Creando mapa con coordenadas:', coordenadas);

        // Crear el mapa con las coordenadas correctas
        const map = L.map(mapRef.current, {
          center: [coordenadas.lat, coordenadas.lng],
          zoom: 16,
          zoomControl: true,
          scrollWheelZoom: false
        });

        // Agregar capa de mapa
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19
        }).addTo(map);

        // Crear icono personalizado
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
              width: 40px;
              height: 40px;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              border: 3px solid white;
              box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <span style="
                transform: rotate(45deg);
                font-size: 20px;
                color: white;
              ">📍</span>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 40],
          popupAnchor: [0, -40]
        });

        // Agregar marcador en las coordenadas correctas
        const marker = L.marker([coordenadas.lat, coordenadas.lng], { icon: customIcon }).addTo(map);
        
        // Agregar popup
        marker.bindPopup(`
          <div style="font-family: system-ui; padding: 8px;">
            <strong style="color: #1e40af; font-size: 14px;">${nombre}</strong><br/>
            <span style="color: #6b7280; font-size: 12px;">${direccion || ciudad}, ${region}</span>
          </div>
        `);

        // Forzar que el mapa se ajuste a las coordenadas correctas
        setTimeout(() => {
          map.invalidateSize();
          map.setView([coordenadas.lat, coordenadas.lng], 16);
        }, 100);

        // Guardar referencia al mapa
        mapRef.current._leaflet_map = map;
        setMapaListo(true);
      });
    }, 100);

    return () => clearTimeout(timeout);
  }, [coordenadas, nombre, direccion, ciudad, region, cargando]);

  if (cargando || !coordenadas) {
    return (
      <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
        <div className="p-3 border-b border-gray-300 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <span className="text-lg">📍</span>
            Ubicación
          </h3>
          <p className="text-xs text-gray-600 mt-1">{ciudad}, {region}</p>
        </div>
        <div className="relative h-64 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-3 border-blue-600 mx-auto mb-3"></div>
            <p className="text-xs text-gray-600 font-medium">Cargando ubicación...</p>
            <p className="text-xs text-gray-400 mt-1">Geocodificando dirección</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="p-3 border-b border-gray-300 bg-gradient-to-r from-blue-50 to-indigo-50">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <span className="text-lg">📍</span>
          Ubicación
        </h3>
        <p className="text-xs text-gray-600 mt-1">{direccion || ciudad}, {region}</p>
      </div>
      
      <div className="relative">
        <div 
          ref={mapRef} 
          className="h-64 w-full relative z-0"
          style={{ background: '#e5e7eb' }}
        />
        
        {/* Botón para abrir en Google Maps */}
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${direccion || ''}, ${ciudad || ''}, ${region || ''}, Chile`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-3 right-3 bg-white hover:bg-blue-50 text-blue-600 px-3 py-2 rounded-lg shadow-lg text-xs font-semibold transition-all flex items-center gap-1 z-10 border border-blue-200"
        >
          <span>🗺️</span>
          Ver en Google Maps
        </a>
      </div>
      
      <div className="p-3 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-600 text-center">
          📞 {ciudad} • {region}
        </p>
      </div>
    </div>
  );
}
