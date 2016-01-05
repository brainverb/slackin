/*global io,superagent*/

var body = document.body;
var request = superagent;

// elements
var select = body.querySelector('select');
var input = body.querySelector('input[name=email]');
var coc = body.querySelector('input[name=coc]');
var button = body.querySelector('button');
var inviteCode = body.querySelector('input[name=invitecode]');

// remove loading state
button.className = '';

// capture submit
body.addEventListener('submit', function(ev){
  ev.preventDefault();

  // checking form field validation
  var validInput = true;
  if(!inviteCode.validity.valid) {
	  inviteCode.dispatchEvent(new Event('invalid', { 'bubbles': true }));
	  validInput = false;
  }
  if(!input.validity.valid) {
	  input.dispatchEvent(new Event('invalid', { 'bubbles': true }));
	  validInput = false;
  }
  if(!validInput) return validInput;
  
  button.disabled = true;
  button.className = '';
  button.innerHTML = 'Please Wait';
  var channel = select ? select.value : null;

  invite(channel, coc && coc.checked ? 1 : 0, input.value, function(err){
    if (err) {
      button.removeAttribute('disabled');
      button.className = 'error';
      button.innerHTML = err.message;
    } else {
      button.className = 'success';
      button.innerHTML = 'WOOT. Check your email!';
    }
  });
});


function invite(channel, coc, email, fn){
  request
  .post(data.path + 'invite')
  .send({
    coc: coc,
    channel: channel,
    email: email
  })
  .end(function(res){
    if (res.body.redirectUrl) {
      var err = new Error(res.body.msg || 'Server error');
      window.setTimeout(() => {
        location.href = res.body.redirectUrl;
      }, 1500);
    }
    if (res.error) {
      var err = new Error(res.body.msg || 'Server error');
      return fn(err);
    } else {
      fn(null);
    }
  });
}

// use dom element for better cross browser compatibility
var url = document.createElement('a');
url.href = window.location;
// realtime updates
var socket = io({ path: data.path + 'socket.io' });
socket.on('data', function(users){
  for (var i in users) update(i, users[i]);
});
socket.on('total', function(n){ update('total', n) });
socket.on('active', function(n){ update('active', n) });

function update(val, n, noanim){
  var el = document.querySelector('.' + val);
  if (n != el.innerHTML) {
    el.innerHTML = n;
    anim(el, val);
  }
}

function anim(el, c){
  if (el.anim) return;
  el.className = c + ' grow';
  el.anim = setTimeout(function(){
    el.className = c;
    el.anim = null;
  }, 150);
}
