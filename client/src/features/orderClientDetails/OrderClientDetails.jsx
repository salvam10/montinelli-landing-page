import React from 'react'

const OrderClientDetails = ({orderClient}) => {
  return (
    <div className="section-container gap-2">
      <div className="w-full flex flex-col">
        <span className="client-detail-label">Cliente</span>
        <span className="responsive-text">{orderClient.name}</span>
      </div>
      <div className="w-full flex flex-col">
        <span className="client-detail-label">Representante legal</span>
        <span className="responsive-text">
          {orderClient.legal_representative}
        </span>
      </div>
      <div className="w-full flex flex-col">
        <span className="client-detail-label">Rif</span>
        <span className="responsive-text">{orderClient.rif}</span>
      </div>
      <div className="w-full flex flex-col">
        <span className="client-detail-label">Dirección</span>
        <span className="responsive-text">{orderClient.state}</span>
        <span className="responsive-text">{orderClient.city}</span>
        <span className="responsive-text">{orderClient.municipality}</span>
        <span className="responsive-text">{orderClient.street_address}</span>
      </div>
    </div>
  );
}

export default OrderClientDetails
