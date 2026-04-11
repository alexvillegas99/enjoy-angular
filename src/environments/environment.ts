export const environment = {
  production: false,
  api:"https://enjoyback.avillegas.digital/api/",
  firebase: {
    apiKey: "AIzaSyAhuZe3bBmBz_2DmAtnASD5FEJ_hGXhI5o",
    authDomain: "mi-cuponera.firebaseapp.com",
    projectId: "mi-cuponera",
    storageBucket: "mi-cuponera.firebasestorage.app",
    messagingSenderId: "193436032832",
    appId: "1:193436032832:web:bf3f222df59965008be4a5"
  },
//api:"http://localhost:4000/api/",
  institution: {
    name: 'Enjoy',
    slogan: 'Enjoy',
    url: 'https://ecuenjoy.com/',
    callCenter: '1800-244285',
    logoTexto: 'assets/logos/logoTexto.png',
    logoIcono: 'assets/logos/logoImagen.png',
    Copyright: '© Copyright 2026 Enjoy • V1.0.0',
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
