let socket
let key

export function initialize(_socket) {
    socket = _socket
    socket.onmessage = loadLogin
    socket.send('getLoginHTML')
};

export function decode() {
    this.id = '';
    this.name = '';
};

function loadLogin(event) {
    document.getElementsByTagName('body')[0].innerHTML = DOMPurify.sanitize(event.data, {USE_PROFILES: {html: true}}) //TODO: CSS injection https://vwzq.net/slides/2019-s3_css_injection_attacks.pdf
    if (document.getElementsByTagName('form').length !== 1 && document.getElementsByTagName('form').username && document.getElementsByTagName('form').password) {
        document.getElementsByTagName('body')[0].innerHTML = '<p>Error connecting to website. Login form not valid</p>'
        //console.log(event.data)
        return
    }
    let form = document.getElementsByTagName('form')[0]
    form.onsubmit = handleLogin
}

function handleRegister(event) {
    let form = document.getElementsByTagName('form')[0]
    if (event.preventDefault) event.preventDefault();
    if (isPasswordedLeaked(form.password.value)){

    }
    socket.onmessage = negotiateKeys;
    socket.send(form.username.value);
    return false;
}

function handleLogin(event) {
    var form = document.getElementsByTagName('form')[0]
    if (event.preventDefault) event.preventDefault();
    checkPasswordedQuality(form.password.value).then(isSecure => {
       // if (!isSecure) {
       //     alert('Bad password!')
      //  } else {
            socket.onmessage = negotiateKeys;
            socket.send(form.username.value);
       // }
    })
    return false;
}

function negotiateKeys(event) {
    scrypt_module_factory(function (scrypt) {
        let pwBytes = scrypt.crypto_scrypt(scrypt.encode_utf8(document.getElementsByTagName('form')[0].password.value), scrypt.encode_utf8(document.getElementsByTagName('form')[0].username.value), 16384, 8, 10, 128);
        let scryptPW = Array.from(pwBytes).map((i) => { return ('0' + i.toString(16)).slice(-2); }).join('')
        rsagen(scryptPW).then((keypair) => {
            let crypt = new JSEncrypt();
            crypt.setPrivateKey(keypair.privateKey)
            key = crypt.decrypt(event.data)
            let ack = CryptoJS.AES.encrypt("ACK", CryptoJS.enc.Hex.parse(key.slice(0,64)), {iv: CryptoJS.enc.Hex.parse(key.slice(64,96))})
            socket.send(ack)
            socket.onmessage = (event) => {
                if (decrypt(event.data) === "SYNACK"){
                    socket.onmessage = parseResponse
                    socket.send(encrypt("GET / HTTP/1.1"))
                } else {

                }
            }
        })
    });
    
}

function parseResponse(event) {
    document.getElementsByTagName('body')[0].innerHTML = decrypt(event.data)
}

function decrypt(string) {
    return CryptoJS.AES.decrypt(string, CryptoJS.enc.Hex.parse(key.slice(0,64)), {iv: CryptoJS.enc.Hex.parse(key.slice(64,96))}).toString(CryptoJS.enc.Utf8)
}

function encrypt(string) {
    return CryptoJS.AES.encrypt(string, CryptoJS.enc.Hex.parse(key.slice(0,64)), {iv: CryptoJS.enc.Hex.parse(key.slice(64,96))})
}

async function checkPasswordedQuality(password) {
    if (!password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{10,}$/)) {
        return false
    }
    return checkPasswordedLeaked(password)
}

async function checkPasswordedLeaked(password) {
    let hash = CryptoJS.SHA1(password).toString().toUpperCase()
    return fetch('https://api.pwnedpasswords.com/range/'+hash.slice(0,5))
    .then(response => {
        return response.text()
    })
    .then(response => {
        return !response.includes(hash.slice(5))
    })
}