const password = document.getElementById('password');
const confirm = document.getElementById('confirm');
const message = document.getElementById('label');
const submit = document.getElementById('submit');
const username = document.getElementById("usernamefield");
const fullname = document.getElementById('fullname');
submit.addEventListener("click", conf);
function conf(event) {
    event.preventDefault();
    if (password.value != confirm.value) {
        message.innerHTML = "Passwords do not match!";
        message.removeAttribute("hidden");
        return;
    }
    fetch(`/auth/checkUsername?username=${username.value}`).then(
        x => {

            if (x.status === 409) {
                message.innerHTML = "This username already exists!";
                message.removeAttribute("hidden");
                return;
            }
            if (x.status === 200) {
                sendRegisterFetch().then((x) => {
                    window.location.assign("/auth/login");
                });

            }
            //message.setAttribute("hidden",true);
        });


}


function sendRegisterFetch() {
    let myFetchUrl = "/auth/register";
    return fetch(myFetchUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            password: password.value,
            confirm: confirm.value,
            username: username.value,
            fullname: fullname.value,
        }),

    });

}