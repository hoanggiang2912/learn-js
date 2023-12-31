const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

function Validator (options) {
    const formElement = $(options.formSelector)
    let selectorRules = {}

    function getParentElement (inputElement , parentSelector) {
        while(inputElement.parentElement) {
            if (inputElement.parentElement.matches(parentSelector)) {
                return inputElement.parentElement
            } else {
                inputElement = inputElement.parentElement
            }
        }
    }
    if(formElement) {
        
        formElement.onsubmit = e => {
            e.preventDefault();
            options.rules.forEach(rule => {
                const inputElements = Array.from(formElement.querySelectorAll(rule.selector))
                inputElements.forEach(inputElement => {
                    validate(inputElement , rule)
                })
            })
        }
        
        function validate (inputElement , rule) {
            const rules = selectorRules[rule.selector]
            let errorMessage = ''
            for(let i = 0 ; i < rules.length ; ++i) {
                errorMessage = rules[i](inputElement.value)
                if (errorMessage) {
                    break;
                }
            }
            if(errorMessage) {
                getParentElement(inputElement , options.formGroupSelector).querySelector(options.formMessage).innerText = errorMessage
                getParentElement(inputElement , options.formGroupSelector).classList.add('invalid')
            } else {
                oninputHandler(inputElement)
            }
        }

        // remove all the invalid signal while user fill in the input
        function oninputHandler (inputElement) {
            getParentElement(inputElement , options.formGroupSelector).querySelector(options.formMessage).innerText = ''
            getParentElement(inputElement , options.formGroupSelector).classList.remove('invalid')
        }
        
        options.rules.forEach(rule => {
            const inputElements = Array.from(formElement.querySelectorAll(rule.selector))

            inputElements.forEach(inputElement => {
                if (Array.isArray(selectorRules[rule.selector])) {
                    selectorRules[rule.selector].push(rule.test)
                } else {
                    selectorRules[rule.selector] = [rule.test]
                }

                inputElement.onblur = () => {
                    validate(inputElement, rule)
                }

                inputElement.oninput = () => {
                    oninputHandler(inputElement)
                }
            })
        })
    }
}

Validator.isRequired = (selector , message) => {
    return {
        selector,
        test (value) {
            return value.trim() ? undefined : message || 'Please fill in the blank'
        }
    }
}
Validator.isEmail = (selector , message) => {
    return {
        selector,
        test (value) {
            const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return regex.test(value) ? undefined : message || 'Data must be an email' 
        }
    }
}
Validator.isPassword = (selector , min , message) => {
    return {
        selector,
        test (value) {
            return value.length >= min ? undefined : message || `Password have at least ${min} charactors`
        }
    }
}
Validator.isConfirm = (selector , confirm , message) => {
    return {
        selector,
        test (value) {
            return value == confirm() ? undefined : message || `The confirm password is wrong! Please try again`
        }
    }
}