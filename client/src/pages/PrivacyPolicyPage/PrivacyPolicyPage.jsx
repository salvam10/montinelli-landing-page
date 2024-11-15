import React from "react";

const PrivacyPolicyPage = () => {
  return (
    <div className="p-4 flex flex-col gap-4">
      <h1 className="text-[30px] font-bold">Politicas de Privacidad</h1>
      <main className="flex flex-col gap-2 ">
        <p>
          Esta Política de Privacidad describe cómo [Nombre de la Empresa]
          recopila, utiliza y protege la información personal que compartes con
          nosotros al completar nuestros formularios en Facebook y otros canales
          digitales. 1. Información que Recopilamos Podemos recopilar la
          siguiente
        </p>
        <p>
          {" "}
          información personal cuando completas un formulario o interactúas con
          nuestros anuncios: Nombre completo Dirección de correo electrónico
          Número de teléfono Ubicación (ciudad o estado) Otros datos relevantes
          para ofrecer nuestros servicios 2. Cómo Usamos la Información La
          información que recopilamos se utiliza para: Contactarte y brindarte
          más detalles sobre nuestras oportunidades de ventas. Proporcionar
          información adicional sobre nuestros productos y servicios. Ofrecer
          soporte al cliente y asistencia. Analizar y mejorar nuestros servicios
          y estrategias de marketing.
        </p>
        <p>
          3. Protección de tu Información Nos comprometemos a proteger tu
          información personal y hemos implementado medidas de seguridad para
          evitar el acceso no autorizado, la divulgación o alteración de tu
          información. Solo los empleados autorizados tienen acceso a la
          información recopilada.
        </p>
        <p>
          4. Compartir Información con Terceros No vendemos, distribuimos ni
          cedemos tu información personal a terceros sin tu consentimiento,
          salvo en casos donde sea requerido por la ley o para cumplir con los
          términos y condiciones de Facebook.
        </p>
        <p>
          5. Almacenamiento de Datos Guardamos la información recopilada durante
          el tiempo necesario para cumplir con los fines indicados en esta
          Política de Privacidad, a menos que la ley exija un período de
          almacenamiento mayor.
        </p>
        <p>
          {" "}
          6. Tus Derechos Tienes derecho a: Acceder a los datos personales que
          hemos recopilado sobre ti. Solicitar la corrección o eliminación de tu
          información. Retirar tu consentimiento para que utilicemos tus datos,
          lo cual puedes hacer en cualquier momento. Para ejercer tus derechos,
          puedes contactarnos a través del correo electrónico: [Correo
          electrónico de contacto].
        </p>
        <p>
          7. Consentimiento Al completar y enviar el formulario, estás aceptando
          nuestra Política de Privacidad y otorgas tu consentimiento para que
          recopilemos y utilicemos tus datos personales según lo descrito. 8.
          Actualización de la Política de Privacidad Nos reservamos el derecho
          de actualizar esta Política de Privacidad en cualquier momento.
          Cualquier cambio será publicado en esta página y notificado a través
          de nuestros canales oficiales.
        </p>
      </main>
    </div>
  );
};

export default PrivacyPolicyPage;
