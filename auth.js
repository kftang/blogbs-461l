const firebase = require('firebase');

async function authMiddleware(req, res, next) {
  const { body: { id_token: idToken } } = req;

  try {
    const credential = firebase.auth.GoogleAuthProvider.credential(idToken);
    const signInResponse = await firebase.auth().signInWithCredential(credential);
    req.user = signInResponse.user;
  } catch (error) {
  }
  next()
}

module.exports = authMiddleware;
