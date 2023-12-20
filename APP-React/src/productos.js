import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ProductStock({ token }) {
  const [stock, setStock] = useState(0);

  useEffect(() => {
    // Include the token in the request headers
    axios.get('http://192.168.22.24:5000/productos_stock', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => {
        setStock(response.data.producto_stock);
      })
      .catch((error) => {
        console.error('Error al obtener el stock: ' + error);
      });
  }, [token]);

  // Función para actualizar el stock
  const actualizarStock = () => {
    axios.post('http://192.168.22.24:5000/actualizar_stock')
      .then((response) => {
        if (response.data.success) {
          setStock(response.data.nuevo_stock);
          console.log('Stock actualizado exitosamente.');
        } else {
          console.error('Error al actualizar el stock: No se pudo obtener la notificación.');

        }
      })
      .catch((error) => {
        console.error('Error al actualizar el stock: ' + error);

      });
  };

  return (
    <div>
      <h1>Stock de productos</h1>
      <p>Stock actual: {stock}</p>
      <button onClick={actualizarStock}>Actualizar Stock</button>
    </div>
  );
}

export default ProductStock;
