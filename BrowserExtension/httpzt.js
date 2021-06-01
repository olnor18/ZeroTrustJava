let socket
let key

export function initialize(_socket) {
    socket = _socket
    socket.onmessage = loadLogin
    socket.send('GET /login HTTP/1.1\nHost: localhost\n\n')
};

function loadLogin(event) {
    let body = event.data.split("\r\n\r\n")[1]
    document.getElementsByTagName('body')[0].innerHTML = DOMPurify.sanitize(body, {USE_PROFILES: {html: true}}) //TODO: CSS injection https://vwzq.net/slides/2019-s3_css_injection_attacks.pdf
    if (document.getElementsByTagName('form').length !== 1 || document.getElementsByTagName('form').username && document.getElementsByTagName('form').password) {
        document.getElementsByTagName('body')[0].innerHTML = '<p>Error connecting to website. Login form not valid</p>'
        console.log(event.data)
        console.log('Bad html')
        return
    }
    let form = document.getElementsByTagName('form')[0]
    form.onsubmit = handleLogin
}

function handleRegister(event) {
    let form = document.getElementsByTagName('form')[0]
    if (event.preventDefault) event.preventDefault();
    checkPasswordedQuality(form.password.value).then(isSecure => {
        if (!isSecure) {
             alert('Bad password!')
        } else {
             //Do registration
        }
     })
    return false;
}

function handleLogin(event) {
    var form = document.getElementsByTagName('form')[0]
    if (event.preventDefault) event.preventDefault();
    socket.onmessage = negotiateKeys;
    let request = 'GET /getChallenge/'+form.username.value+' HTTP/1.1\nHost: localhost\n\n'
    socket.send(request);
    return false;
}

function base64ToBase16(base64) {
    return atob(base64)
        .split('')
        .map(function (aChar) {
          return ('0' + aChar.charCodeAt(0).toString(16)).slice(-2);
        })
       .join('')
       .toUpperCase();
}

function negotiateKeys(event) {
    let body = event.data.substring(event.data.indexOf("\r\n\r\n")+1)
    scrypt_module_factory(function (scrypt) {
        let password = scrypt.encode_utf8(document.getElementsByTagName('form')[0].password.value)
        let username = scrypt.encode_utf8(document.getElementsByTagName('form')[0].username.value)
        let pwBytes = scrypt.crypto_scrypt(password, username, 16384, 8, 10, 128);
        let scryptPW = Array.from(pwBytes).map((i) => { return ('0' + i.toString(16)).slice(-2); }).join('')
        rsagen(scryptPW).then((keypair) => {
            let crypt = new JSEncrypt();
            crypt.setPrivateKey(keypair.privateKey)
            key = base64ToBase16(crypt.decrypt(body), 'base64')
            let ack = CryptoJS.AES.encrypt("ACK", CryptoJS.enc.Hex.parse(key), { 
                iv: CryptoJS.enc.Hex.parse("0000000000000000000000000000000") 
            })
            socket.send(ack)
            socket.onmessage = (event) => {
                if (decrypt(event.data) === "SYNACK"){
                    socket.onmessage = parseResponse
                    socket.send(encrypt("GET / HTTP/1.1\nHost: localhost\n\n"))
                } else {
                    alert('Bad password or bad connection!')
                    socket.close()
                    console.log(event.data)
                }
            }
        })
    });
}

function sendRawHTTPRequest(method, url){
    let urlObj = new URL("http://localhost"+url)
    socket.send(encrypt(method + " " +urlObj.pathname + urlObj.search+" HTTP/1.1\nHost: localhost\n\n"))
}

function parseResponse(event) {
    let decrypted = decrypt(event.data)
    let body = decrypted.substring(decrypted.indexOf("\r\n\r\n")+1)
    document.getElementsByTagName('body')[0].innerHTML = body
}

function decrypt(string) {
    return CryptoJS.AES.decrypt(string, CryptoJS.enc.Hex.parse(key), { iv: CryptoJS.enc.Hex.parse("0000000000000000000000000000000") }).toString(CryptoJS.enc.Utf8)
}

function encrypt(string) {
    return CryptoJS.AES.encrypt(string, CryptoJS.enc.Hex.parse(key), { iv: CryptoJS.enc.Hex.parse("0000000000000000000000000000000") })
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