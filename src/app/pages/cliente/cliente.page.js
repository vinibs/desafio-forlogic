page = { // The variable 'page' must receive the object with the page data

    title: 'Desafio 4 Devs', // Page title to be shown in the browser
    pageFile: 'cliente.page.html', // Relative to this JS file
    handler: function() {

        var btn = document.getElementsByTagName('button')[0];

        btn.addEventListener('click', function() {
            var campos = document.getElementsByTagName('input');
            var camposOk = true;

            for (var i = 0; i < campos.length; i++){
                if(campos[i].value === '')
                    camposOk = false;
            }

            if(!camposOk)
                alert("Todos os campos devem ser preenchidos");

            else {
                var object = {};
                for (i = 0; i < campos.length; i++) {
                    object[campos[i].name] = campos[i].value;
                }
                object['avaliacao'] = '';

                app.ajax({
                    url: apiUrl+'customers',
                    method: 'POST',
                    headers: {'Authorization':appname},
                    data: object,
                    contentType: 'application/json; charset=utf-8',
                    beforeSend: function() {
                        btn.setAttribute('disabled', 'true');
                    },
                    success: function(data) {
                        btn.removeAttribute('disabled');
                        alert('Os dados foram cadastrados!');

                        for (i in campos)
                            campos[i].value = '';
                    },
                    fail: function(data) {
                        console.log(data);
                        btn.removeAttribute('disabled');
                        alert('Houve um erro ao enviar os dados. Tente novamente.');
                    }
                });
            }

        });

    } // JS function to be executed when the page is loaded.
};