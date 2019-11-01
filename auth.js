const firebase = require('firebase');

async function authMiddleware(req, res, next) {
  let { cookies: { idToken } } = req;
  const { cookies } = req;
  if (!cookies.serverIdToken && idToken) {
    res.cookie('serverIdToken', idToken, { maxAge: 1000 * 60 * 60 * 24 * 5 });
  } else {
    idToken = cookies.serverIdToken;
  }
  try {
    const credential = firebase.auth.GoogleAuthProvider.credential(idToken);
    const signInResponse = await firebase.auth().signInWithCredential(credential);
    req.user = signInResponse.user;
    req.setCookie = !!cookies.idToken;
  } catch (error) {
    console.error(error);
  }
  next()
}

module.exports = authMiddleware;
