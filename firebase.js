<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyBwE0PN1VmfgCYaD5wZGQEcYoVa-nSCAVQ",
    authDomain: "herworth-6a0b0.firebaseapp.com",
    projectId: "herworth-6a0b0",
    storageBucket: "herworth-6a0b0.firebasestorage.app",
    messagingSenderId: "453015159303",
    appId: "1:453015159303:web:9d309b3949166c980860a2",
    measurementId: "G-5ED577JSQE"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
</script>
