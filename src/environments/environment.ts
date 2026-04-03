export const environment = {
  production: false,
api:"https://enjoyback.avillegas.digital/api/",
  institution: {
    name: 'IMAK SMART',
    slogan: 'IMAK SMART',
    url: 'https://enlinea.imaksmart.com',
    callCenter: '1800-244285',
    logoTexto: 'assets/logos/logoTexto.png',
    logoIcono: 'assets/logos/logoImagen.png',
    Copyright: '© Copyright 2026 IMA SMART • V1.0.0',
  },

  watermarkStyle: {
    'background-image': `
    linear-gradient(
      rgba(255,255,255,0.8),
      rgba(255,255,255,0.8)
    ),
    url(/assets/logos/logoImagen.png)
  `,
    'background-repeat': 'repeat, repeat',
    'background-size': 'auto, 50px 50px',
    'background-position': 'center, center',
  },
};
