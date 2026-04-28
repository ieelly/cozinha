import { useEffect, useState } from 'react';
import { collection, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import logo from './assets/teste.png';
import './App.css';

function App() {
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'orders'), (snapshot) => {
      const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPedidos(lista);
    });

    return () => unsubscribe();
  }, []);

  const atualizarStatus = async (id, status) => {
    await updateDoc(doc(db, 'orders', id), {
      status: status,
    });
  };

  const traduzirStatus = (status) => {
    switch (status) {
      case 'pending': return 'Recebido';
      case 'preparing': return 'Preparando';
      case 'out_for_delivery': return 'Saiu para entrega';
      case 'delivered': return 'Entregue';
      default: return status;
    }
  };

  const corStatus = (status) => {
    switch (status) {
      case 'pending': return '#FFA000';
      case 'preparing': return '#1976D2';
      case 'out_for_delivery': return '#7B1FA2';
      case 'delivered': return '#2E7D32';
      default: return '#999';
    }
  };

  // ⏱️ TEMPO DO PEDIDO
  const tempoDecorrido = (timestamp) => {
    if (!timestamp) return '';

    const data = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diff = Math.floor((new Date() - data) / 1000);

    if (diff < 60) return 'agora';
    if (diff < 3600) return `${Math.floor(diff / 60)} min atrás`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;

    return `${Math.floor(diff / 86400)} dias atrás`;
  };

  return (
    <div className="container">
      <div className="title">
        <img src={logo} alt="Bella Massa" style={{ height: '200px' }} />
      </div>

      <div className="orders">
        {pedidos.map(pedido => {

          console.log("PEDIDO:", pedido);

          return (
            <div key={pedido.id} className="card">

              <div className="cardHeader">
                <span className="orderId">Pedido #{pedido.id.slice(0,6)}</span>
                <span
                  className="status"
                  style={{ backgroundColor: corStatus(pedido.status) }}
                >
                  {traduzirStatus(pedido.status)}
                </span>
              </div>

              {/* 👤 CLIENTE */}
              <div className="customer">
                <p><strong>Cliente:</strong> {pedido.customerName || 'Não informado'}</p>
                <p><strong>Endereço:</strong> {pedido.address || 'Não informado'}</p>
              </div>

              {/* ⏱️ TEMPO */}
              <p className="time">
                ⏱️ {tempoDecorrido(pedido.createdAt)}
              </p>

              {/* 💰 INFO */}
              <div className="info">
                <p><strong>Total:</strong> R$ {Number(pedido.total).toFixed(2)}</p>
                <p><strong>Pagamento:</strong> {pedido.paymentMethod}</p>
              </div>

              <div className="items">
                <strong>🍕 Itens do Pedido:</strong>

                {pedido.items && pedido.items.length > 0 ? (
                  pedido.items.map((item, index) => {

                    const nome = item.product?.name;
                    const quantidade = item.quantity || 1;

                    return (
                      <div key={index} className="itemCard">
                        
                        <div className="itemHeader">
                          <span className="itemName">
                            {nome || 'Item sem nome'}
                          </span>
                          <span className="itemQty">
                            x{quantidade}
                          </span>
                        </div>

                      </div>
                    );
                  })
                ) : (
                  <p>Sem itens</p>
                )}
              </div>

              {/* 🔘 BOTÕES */}
              <div className="buttons">
                <button onClick={() => atualizarStatus(pedido.id, 'preparing')}>
                  Preparando
                </button>

                <button onClick={() => atualizarStatus(pedido.id, 'out_for_delivery')}>
                  Saiu para entrega
                </button>

                <button onClick={() => atualizarStatus(pedido.id, 'delivered')}>
                  Entregue
                </button>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;