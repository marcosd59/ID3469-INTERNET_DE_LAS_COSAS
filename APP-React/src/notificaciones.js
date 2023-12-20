import React, { useEffect, useState } from 'react';
import socketIOClient from 'socket.io-client';

function Notifications() {
  const [stock, setStock] = useState({ mensaje: '', valor: 0 });

  useEffect(() => {
    const socket = socketIOClient('http://192.168.1.207:5000'); 

    socket.on('message', (data) => {
      setStock(data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <h1>Notificaciones</h1>
      {stock.mensaje ? (
        <p>{stock.mensaje}: {stock.valor}</p>
      ) : (
        <p>No hay notificaciones</p>
      )}
    </div>
  );
}

export default Notifications;