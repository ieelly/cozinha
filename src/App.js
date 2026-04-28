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

  // 🔥 ATUALIZAR STATUS
  const atualizarStatus = async (id, status) => {
    await updateDoc(doc(db, 'orders', id), {
      status: status,
      finished: status === 'delivered'
    });
  };

  // 🔄 STATUS
  const traduzirStatus = (status) => {
    switch (status) {
      case 'pending': return 'Pedido recebido';
      case 'preparing': return 'Preparando';
      case 'ready': return 'Pedido pronto';
      case 'out_for_delivery': return 'Saiu para entrega';
      case 'delivered': return 'Entregue';
      default: return status;
    }
  };

  // 🧠 TIPO
  const traduzirTipo = (type) => {
    switch (type) {
      case 'delivery': return 'Entrega';
      case 'pickup': return 'Balcão';
      case 'table': return 'Mesa';
      default: return type;
    }
  };

  // 🎨 CORES
  const corStatus = (status) => {
    switch (status) {
      case 'pending': return '#FFA000';
      case 'preparing': return '#1976D2';
      case 'ready': return '#9C27B0';
      case 'out_for_delivery': return '#7B1FA2';
      case 'delivered': return '#2E7D32';
      default: return '#999';
    }
  };

  // ⏱️ TEMPO
  const tempoDecorrido = (timestamp) => {
    if (!timestamp) return '';

    const data = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diff = Math.floor((new Date() - data) / 1000);

    if (diff < 60) return 'agora';
    if (diff < 3600) return `${Math.floor(diff / 60)} min atrás`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;

    return `${Math.floor(diff / 86400)} dias atrás`;
  };

  // 🔥 BOTÕES POR TIPO
  const renderButtons = (pedido) => {
    const type = pedido.orderType;

    // 🍽️ MESA
    if (type === 'table') {
      return (
        <div className="buttons">
          <button onClick={() => atualizarStatus(pedido.id, 'preparing')}>
            Preparando
          </button>

          <button onClick={() => atualizarStatus(pedido.id, 'delivered')}>
            Entregue
          </button>
        </div>
      );
    }

    // 🏃 BALCÃO
    if (type === 'pickup') {
      return (
        <div className="buttons">
          <button onClick={() => atualizarStatus(pedido.id, 'preparing')}>
            Preparando
          </button>

          <button onClick={() => atualizarStatus(pedido.id, 'ready')}>
            Pedido pronto
          </button>

          <button onClick={() => atualizarStatus(pedido.id, 'delivered')}>
            Entregue
          </button>
        </div>
      );
    }

    // 🚚 DELIVERY
    return (
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
    );
  };

return (
  <div className="container">

    <div className="title">
      <img src={logo} alt="Bella Massa" style={{ height: '200px' }} />
    </div>

    <h2 style={{ marginTop: 20 }}>Pedidos Em andamento</h2>

    <div className="orders">
      {pedidos
        .filter(pedido => pedido.status !== 'delivered')
        .map(pedido => (
          <div key={pedido.id} className="card">

            <div className="cardHeader">
              <span className="orderId">
                Pedido #{pedido.id.slice(0, 6)}
              </span>

              <span
                className="status"
                style={{ backgroundColor: corStatus(pedido.status) }}
              >
                {traduzirStatus(pedido.status)}
              </span>
            </div>

            <p><strong>Tipo:</strong> {traduzirTipo(pedido.orderType)}</p>

            <div className="customer">
              <p><strong>Cliente:</strong> {pedido.customerName || '-'}</p>

              {pedido.orderType === 'delivery' && (
                <>
                  <p><strong>Endereço:</strong> {pedido.deliveryAddress || '-'}</p>
                  <p><strong>Bairro:</strong> {pedido.neighborhood || '-'}</p>
                  <p><strong>Complemento:</strong> {pedido.complement || '-'}</p>
                  <p><strong>Referência:</strong> {pedido.referencePoint || '-'}</p>
                </>
              )}

              {pedido.orderType === 'table' && (
                <p><strong>Mesa:</strong> {pedido.tableNumber || '-'}</p>
              )}

              {pedido.orderType === 'pickup' && (
                <p><strong>Retirada no balcão</strong></p>
              )}
            </div>

            <p className="time">
              ⏱️ {tempoDecorrido(pedido.createdAt)}
            </p>

            <div className="info">
              <p><strong>Total:</strong> R$ {Number(pedido.total).toFixed(2)}</p>
              <p><strong>Pagamento:</strong> {pedido.paymentMethod}</p>
            </div>

            <div className="items">
              <strong>🍕 Itens do Pedido:</strong>

              {pedido.items?.length > 0 ? (
                pedido.items.map((item, index) => (
                  <div key={index} className="itemCard">
                    <div className="itemHeader">
                      <span>{item.name}</span>
                      <span>x{item.quantity}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p>Sem itens</p>
              )}
            </div>

            {renderButtons(pedido)}
          </div>
        ))}
    </div>

    <h2 style={{ marginTop: 40 }}>Finalizados</h2>

    <div className="orders finished">
      {pedidos
        .filter(pedido => pedido.status === 'delivered')
        .map(pedido => (
          <div key={pedido.id} className="card" style={{ opacity: 0.7 }}>

            <div className="cardHeader">
              <span className="orderId">
                Pedido #{pedido.id.slice(0, 6)}
              </span>

              <span
                className="status"
                style={{ backgroundColor: corStatus(pedido.status) }}
              >
                {traduzirStatus(pedido.status)}
              </span>
            </div>

            <p><strong>Tipo:</strong> {traduzirTipo(pedido.orderType)}</p>

            <p><strong>Cliente:</strong> {pedido.customerName || '-'}</p>

            <p className="time">
              ⏱️ {tempoDecorrido(pedido.createdAt)}
            </p>

          </div>
        ))}
    </div>

  </div>
);
}

export default App;