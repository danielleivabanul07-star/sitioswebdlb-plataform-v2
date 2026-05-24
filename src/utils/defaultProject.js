export const fixedCredit = {
  text: "Desarrollado por",
  brand: "SitiosWebDLB",
  url: "https://danielleivabanul07-star.github.io/oficialwebsitesdlb/"
};

export const defaultProject = {
  business: {
    name: "Nombre del Negocio",
    type: "Negocio local",
    hero: "Servicio profesional para clientes exigentes",
    about:
      "Ofrecemos calidad, confianza y atención personalizada para cada cliente.",
    why:
      "Elegirnos significa trabajar con calidad, confianza y compromiso para que cada cliente reciba una experiencia profesional.",
    phone: "16892220829",
    email: "negocio@gmail.com",
    address: "Louisville, KY",
    google: "#",
    facebook: "#",
    instagram: "#",
    tiktok: "#",
    payments: "Consultar métodos de pago"
  },

  design: {
    accent: "#f5c400",
    textColor: "#ffffff",
    titleColor: "#ffffff",
    buttonTextColor: "#000000",
    buttonBackground: "#f5c400",
    sectionBackground: "rgba(0,0,0,0.45)",
    cardBackground: "rgba(0,0,0,0.55)",
    headerBackground: "rgba(0,0,0,0.70)",
    footerBackground: "rgba(0,0,0,0.75)",
    borderColor: "#f5c400",

    font: "Arial, Helvetica, sans-serif",

    radius: 20,
    borderRadius: 20,
    borderSize: 1,
    shadowStrength: 25,

    backgroundMode: "global",
    overlayOpacity: 0.72,

    globalBackground: "",
    globalBackgroundName: "fondo-global.jpg",
    globalBackgroundSize: 100,
    globalBackgroundPositionX: 50,
    globalBackgroundPositionY: 50,

    heroBackground: "",
    heroBackgroundName: "fondo-web.jpg",
    heroBackgroundSize: 100,
    heroBackgroundPositionX: 50,
    heroBackgroundPositionY: 50,

    pageBackgroundSize: 100,
    pageBackgroundPositionX: 50,
    pageBackgroundPositionY: 50
  },

  buttons: {
    whatsapp: "WhatsApp",
    call: "Llamar",
    sms: "Mensaje",
    email: "Email"
  },

  pages: [
    {
      key: "home",
      file: "index.html",
      label: "Inicio",
      title: "Inicio",
      show: true,
      background: "",
      backgroundName: "",
      backgroundSize: 100,
      backgroundPositionX: 50,
      backgroundPositionY: 50
    },
    {
      key: "services",
      file: "servicios.html",
      label: "Servicios",
      title: "Servicios",
      show: true,
      background: "",
      backgroundName: "",
      backgroundSize: 100,
      backgroundPositionX: 50,
      backgroundPositionY: 50
    },
    {
      key: "gallery",
      file: "galeria.html",
      label: "Galería",
      title: "Galería",
      show: true,
      background: "",
      backgroundName: "",
      backgroundSize: 100,
      backgroundPositionX: 50,
      backgroundPositionY: 50
    },
    {
      key: "appointments",
      file: "citas.html",
      label: "Citas",
      title: "Agenda tu cita",
      show: false,
      background: "",
      backgroundName: "",
      backgroundSize: 100,
      backgroundPositionX: 50,
      backgroundPositionY: 50
    },
    {
      key: "financing",
      file: "financiamiento.html",
      label: "Financiamiento",
      title: "Solicita financiamiento",
      show: false,
      background: "",
      backgroundName: "",
      backgroundSize: 100,
      backgroundPositionX: 50,
      backgroundPositionY: 50
    },
    {
      key: "contact",
      file: "contacto.html",
      label: "Contacto",
      title: "Contacto",
      show: true,
      background: "",
      backgroundName: "",
      backgroundSize: 100,
      backgroundPositionX: 50,
      backgroundPositionY: 50
    }
  ],

  services: [
    {
      title: "Servicio principal",
      description:
        "Servicio profesional con calidad, buena atención y enfoque en la satisfacción del cliente."
    },
    {
      title: "Atención personalizada",
      description:
        "Atención clara y adaptada a las necesidades de cada cliente."
    },
    {
      title: "Calidad garantizada",
      description:
        "Trabajo realizado con cuidado, presentación y compromiso."
    }
  ],

  gallery: [],

  forms: {
    appointments: [
      {
        label: "Nombre completo",
        type: "text",
        placeholder: "Nombre completo",
        required: true,
        full: false,
        options: ""
      },
      {
        label: "Teléfono",
        type: "tel",
        placeholder: "Teléfono",
        required: true,
        full: false,
        options: ""
      },
      {
        label: "Email",
        type: "email",
        placeholder: "Email",
        required: false,
        full: false,
        options: ""
      },
      {
        label: "Fecha",
        type: "date",
        placeholder: "",
        required: true,
        full: false,
        options: ""
      },
      {
        label: "Horario",
        type: "select",
        placeholder: "Selecciona horario",
        required: false,
        full: false,
        options:
          "8:00 AM - 10:00 AM, 10:00 AM - 12:00 PM, 1:00 PM - 3:00 PM"
      },
      {
        label: "Describe lo que necesitas",
        type: "textarea",
        placeholder: "Describe lo que necesitas",
        required: false,
        full: true,
        options: ""
      }
    ],

    financing: [
      {
        label: "Nombre completo",
        type: "text",
        placeholder: "Nombre completo",
        required: true,
        full: false,
        options: ""
      },
      {
        label: "Teléfono",
        type: "tel",
        placeholder: "Teléfono",
        required: true,
        full: false,
        options: ""
      },
      {
        label: "Email",
        type: "email",
        placeholder: "Email",
        required: false,
        full: false,
        options: ""
      },
      {
        label: "Monto aproximado",
        type: "text",
        placeholder: "Monto aproximado",
        required: false,
        full: false,
        options: ""
      },
      {
        label: "Ingreso mensual aproximado",
        type: "select",
        placeholder: "Ingreso mensual aproximado",
        required: false,
        full: false,
        options:
          "Menos de $2,000, $2,000 - $4,000, Más de $4,000"
      },
      {
        label: "Notas adicionales",
        type: "textarea",
        placeholder: "Notas adicionales",
        required: false,
        full: true,
        options: ""
      }
    ]
  }
};