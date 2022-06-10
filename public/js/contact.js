const contactForm = document.querySelector('.sendmail')

let fullname = document.getElementById('name')
let email = document.getElementById('email')
let subject = document.getElementById('subject')
let message = document.getElementById('message')
contactForm.addEventListener('submit', (e) => {
    e.preventDefault()
    let formData = {
        fullname: fullname.value,
        email: email.value,
        subject: subject.value,
        message: message.value
    }
    
    console.log(formData);

    let xhr = new XMLHttpRequest();
    xhr.open('POST', '/contact');
    xhr.setRequestHeader('content-type', 'application/json');
    xhr.onload = function() {
        console.log(xhr.responseText);
        if(xhr.responseText == 'success' || 200) {
            document.querySelector(".submit").value = `გაიგზავნა`
            fullname.value = ''
            email.value = ''
            subject.value = ''
            message.value = ''
        }
        else {
            document.querySelector(".submit").value = `არ გაიგზავნა`
            
        } 
    }
    xhr.send(JSON.stringify(formData))
    
})