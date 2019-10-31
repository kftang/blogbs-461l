// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyDC34NWdWHh5pFJwV731aS1AOJok0kV11Q",
  authDomain: "blogbs-461l.firebaseapp.com",
  databaseURL: "https://blogbs-461l.firebaseio.com",
  projectId: "blogbs-461l",
  storageBucket: "blogbs-461l.appspot.com",
  messagingSenderId: "850995431128",
  appId: "1:850995431128:web:56c9cca8ecff755e8c39ad"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());

document.addEventListener("DOMContentLoaded", () => {
  if (sessionStorage.getItem('idToken')) {
    document.querySelector('a.signout').style.display = '';
    document.querySelector('div#firebaseui-auth-container').style.display = 'none';
  } else {
    document.querySelector('a.signout').style.display = 'none';
    document.querySelector('div#firebaseui-auth-container').style.display = '';
    ui.start('#firebaseui-auth-container', {
      callbacks: {
        signInSuccessWithAuthResult: function(authResult) {
          // User successfully signed in.
          document.querySelector('a.signout').style.display = '';
          sessionStorage.setItem('idToken', authResult.credential.idToken);
          return false;
        }
      },
      signInOptions: [
        {
          provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID
        }
      ]
    });
  }
});


function submitForm(e) {
  // console.log(e);
  // console.log(e.target);
  // console.log(e.target.querySelector('input[name="id_token"]'));
  e.target.querySelector('input[name="id_token"]').value = sessionStorage.getItem('idToken');
  return true;
}

function logout() {
  sessionStorage.removeItem('idToken');
  document.querySelector('a.signout').style.display = 'none';
  document.querySelector('div#firebaseui-auth-container').style.display = '';
  ui.start('#firebaseui-auth-container', {
    callbacks: {
      signInSuccessWithAuthResult: function(authResult) {
        // User successfully signed in.
        sessionStorage.setItem('idToken', authResult.credential.idToken);
        return false;
      }
    },
    signInOptions: [
      {
        provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID
      }
    ]
  });
}
