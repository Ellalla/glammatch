// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "你的 API key",
  authDomain: "你的项目.firebaseapp.com",
  projectId: "你的项目 ID",
  storageBucket: "你的项目.appspot.com",
  messagingSenderId: "你的 Sender ID",
  appId: "你的 App ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
