/* eslint-disable */

function renderButton() {
  gapi.signin2.render('gSignIn', {
    scope: 'profile email',
    width: 50,
    height: 50,
    longtitle: true,
    theme: 'dark',
    onsuccess: onSuccess,
    onfailure: onFailure
  });
}

function onSuccess(googleUser) {
  gapi.client.load('oauth2', 'v2', function() {
    var request = gapi.client.oauth2.userinfo.get({
      userId: 'me'
    });
    request.execute(function(resp) {
      let profileHTML =
        '<h3>Welcome ' +
        resp.given_name +
        '! </h3>' +
        '<img class="userPic" src="' +
        resp.picture +
        '"/>' +
        '<a href="javascript:void(0);" onclick="signOut();">Sign out</a>';
      document.getElementsByClassName('userContent')[0].innerHTML = profileHTML;

      document.getElementById('gSignIn').style.display = 'none';
      document.getElementsByClassName('userContent')[0].style.display = 'grid';
    });
  });
}

function onFailure(error) {
  alert(error);
}

function signOut() {
  var auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function() {
    document.getElementsByClassName('userContent')[0].innerHTML = '';
    document.getElementsByClassName('userContent')[0].style.display = 'none';
    document.getElementById('gSignIn').style.display = 'grid';
  });

  auth2.disconnect();
}
