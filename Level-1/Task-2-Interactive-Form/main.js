document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registrationForm');
    const fullName = document.getElementById('fullName');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const terms = document.getElementById('terms');
    
    const passwordMeter = document.querySelector('.password-strength-meter');
    const meterBar = document.querySelector('.meter-bar');
    const meterText = document.querySelector('.meter-text');
    const successCard = document.getElementById('successCard');
    const submitBtn = document.getElementById('submitBtn');


    function showStandardError(input, message) {
        const formGroup = input.closest('.form-group');
        formGroup.classList.remove('success');
        formGroup.classList.add('error');
        
        const errorElement = formGroup.querySelector('.error-message');
        errorElement.textContent = message;
    }

    function showStandardSuccess(input) {
        const formGroup = input.closest('.form-group');
        formGroup.classList.remove('error');
        formGroup.classList.add('success');
    }

    function isValidEmailFormat(emailValue) {
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return regex.test(emailValue.trim());
    }



    function checkFullName() {
        const value = fullName.value.trim();
        if (value === '') {
            showStandardError(fullName, 'Full name cannot be empty.');
            return false;
        } else if (value.length < 3) {
            showStandardError(fullName, 'Name must be at least 3 characters.');
            return false;
        } else {
            showStandardSuccess(fullName);
            return true;
        }
    }

    function checkEmail() {
        const value = email.value.trim();
        if (value === '') {
            showStandardError(email, 'Email address cannot be empty.');
            return false;
        } else if (!isValidEmailFormat(value)) {
            showStandardError(email, 'Please enter a valid email address.');
            return false;
        } else {
            showStandardSuccess(email);
            return true;
        }
    }

    function checkPassword() {
        const value = password.value;
        if (value === '') {
            showStandardError(password, 'Password cannot be empty.');
            passwordMeter.style.display = 'none';
            return false;
        } else if (value.length < 8) {
            showStandardError(password, 'Password must be at least 8 characters.');
            evaluatePasswordStrength(value); 
            return false;
        } else {
            showStandardSuccess(password);
            evaluatePasswordStrength(value);
            return true;
        }
    }

    function checkTerms() {
        if (!terms.checked) {
            showStandardError(terms, 'You must accept our terms to proceed.');
            return false;
        } else {
            showStandardSuccess(terms);
            return true;
        }
    }


    function evaluatePasswordStrength(pass) {
        if (pass.length === 0) {
            passwordMeter.style.display = 'none';
            return;
        }

        passwordMeter.style.display = 'block';
        let score = 0;

        if (pass.length >= 8) score++;
        if (/[A-Z]/.test(pass)) score++; 
        if (/[0-9]/.test(pass)) score++; 
        if (/[^A-Za-z0-9]/.test(pass)) score++; 

        meterBar.className = 'meter-bar';

        if (score <= 1) {
            meterBar.classList.add('weak');
            meterText.textContent = 'Weak Password ⚠️';
            meterText.style.color = 'var(--color-error)';
        } else if (score === 2 || score === 3) {
            meterBar.classList.add('medium');
            meterText.textContent = 'Medium Password 👍';
            meterText.style.color = 'var(--color-warning)';
        } else if (score >= 4) {
            meterBar.classList.add('strong');
            meterText.textContent = 'Strong Password 🔥';
            meterText.style.color = 'var(--color-success)';
        }
    }

    fullName.addEventListener('input', checkFullName);
    email.addEventListener('input', checkEmail);
    password.addEventListener('input', checkPassword);
    terms.addEventListener('change', checkTerms);


    form.addEventListener('submit', (e) => {

        e.preventDefault();


        const isNameValid = checkFullName();
        const isEmailValid = checkEmail();
        const isPasswordValid = checkPassword();
        const isTermsValid = checkTerms();


        if (!isNameValid || !isEmailValid || !isPasswordValid || !isTermsValid) {
            return;
        }


        submitBtn.classList.add('loading');
        const originalBtnText = submitBtn.querySelector('.btn-text').textContent;
        submitBtn.querySelector('.btn-text').textContent = 'Processing...';

        setTimeout(() => {
            submitBtn.classList.remove('loading');
            submitBtn.querySelector('.btn-text').textContent = originalBtnText;

            successCard.classList.add('active');

            console.log('VIP Registration successful:', {
                name: fullName.value.trim(),
                email: email.value.trim(),
                timestamp: new Date().toISOString()
            });

            form.reset();
            document.querySelectorAll('.form-group').forEach(group => {
                group.classList.remove('success');
            });
            passwordMeter.style.display = 'none';

        }, 2000);
    });
});