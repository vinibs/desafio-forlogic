page = { // The variable 'page' must receive the object with the page data

    title: 'Desafio 4 Devs', // Page title to be shown in the browser
    pageFile: 'avaliacao.page.html', // Relative to this JS file
    handler: function() {

        var clientes = document.getElementById('clientes');
        var btn = document.getElementsByTagName('button')[0];

        // Obtenção e exibição de dados
        app.ajax({
            url: apiUrl+'customers',
            headers: {'Authorization':appname},
            beforeSend: function() {
                clientes.innerHTML = 'Carregando...';
                btn.setAttribute('disabled', true);

                setTimeout(function() {
                    if(clientes.innerHTML === 'Carregando...')
                        clientes.innerHTML = 'Nenhum cliente cadastrado.';
                }, 5000);
            },
            success: function(data) {
                // Obtém a lista de clientes e insere na página
                clientes.innerHTML = '';

                var lista = [];

                if(data.response !== '')
                    lista = JSON.parse(data.response);

                var count = 0;
                for (var i in lista) {
                    var item = lista[i]; // Obtém o item

                    var keys = Object.keys(lista); // Obtém o ID do item

                    var label = document.createElement('label');
                    var input = document.createElement('input');
                    input.type = 'checkbox';
                    input.className = 'check';
                    input.name = 'cliente';
                    input.value = keys[count];

                    var span = document.createElement('span');
                    span.id = keys[count];
                    var text = document.createTextNode(' '+item.nome);
                    var br = document.createElement('br');

                    span.appendChild(text);
                    label.appendChild(input);
                    label.appendChild(span);
                    clientes.appendChild(label);
                    clientes.appendChild(br);

                    count++;
                }

                btn.removeAttribute('disabled');
            }
        });





        // Envio de dados
        btn.addEventListener('click', function() {
            btn.setAttribute('disabled', true);

            var campos = document.getElementsByTagName('input');
            var camposOk = true;
            var checksOk = true;

            // Realiza algumas validações
            for (var i = 0; i < campos.length; i++){
                if(campos[i].value === '' && campos[i].type === 'number')
                    camposOk = false;
            }

            var checkCounter = 0;
            var counter = 0;

            for (i = 0; i < campos.length; i++){
                if(campos[i].type === 'checkbox') {
                    counter++;

                    if(campos[i].checked)
                        checkCounter++;
                }
            }

            // Verifica se há mais ou menos de 20% (intervalo 17% < valor < 23%) dos clientes selecionados
            var percent = checkCounter / counter * 100;
            if(percent <= 17 || percent >= 23)
                checksOk = false;

            // Realiza validações básicas nos campos
            if(!camposOk){
                alert("Todos os campos devem ser preenchidos");
                btn.removeAttribute('disabled');
            }

            else if(!checksOk){
                alert("Você deve escolher 20% dos clientes (marcados: " + percent.toFixed(2) + "%)");
                btn.removeAttribute('disabled');
            }

            // Passou das validações básicas
            else {
                // Organiza os dados a enviar para o BD
                var object = {};
                for (i = 0; i < campos.length; i++) {
                    if(campos[i].type === 'number'){
                        var numero = campos[i].value;

                        if(numero.length === 1)
                            numero = '0'+numero;

                        object[campos[i].name] = numero;
                    }
                }

                var clientes = [];

                for (i = 0; i < campos.length; i++){
                    if(campos[i].type === 'checkbox') {
                        if(campos[i].checked) {

                            var nomecliente = document.getElementById(campos[i].value).innerText.trim();

                            clientes.push({'id': campos[i].value, 'nome': nomecliente});
                        }
                    }
                }

                object['clientes'] = clientes;


                // Obtém os dados das avaliações para fazer a validação
                var clientesInvalidos = [];
                var mesvalido = true;
                var requisicaoOk = false;

                app.ajax({
                    url: apiUrl+'evaluations',
                    headers: {'Authorization':appname},
                    success: function(data) {
                        var list = [];

                        if(data.response !== '')
                            list = JSON.parse(data.response);

                        for(i in clientes) {
                            for(var j in list) {
                                var difMesesSimples = object.mes - list[j].mes;

                                // Verifica se não é duplicata do cadastro de avaliação de um mês
                                if(difMesesSimples === 0 && list[j].ano === object.ano){
                                    mesvalido = false;
                                    alert("A avaliação deste mês já foi registrada. Registre para um mês diferente.");
                                    btn.removeAttribute('disabled');
                                    return;
                                }


                                // Verifica se um cliente já foi selecionado em algum dos 2 meses anteriores
                                // [incluindo virada de ano, aparentemente]
                                if(
                                    (list[j].ano === object.ano && difMesesSimples <= 2 && difMesesSimples >= 0) ||
                                    (parseInt(list[j].ano) === parseInt(object.ano-1) &&
                                        (parseInt(object.mes) === 1 &&
                                            (parseInt(list[j].mes) === 11 || parseInt(list[j].mes === 12))
                                        ) ||
                                        (parseInt(object.mes) === 2 &&
                                            (parseInt(list[j].mes) === 12 || parseInt(list[j].mes === 1))
                                        )
                                    )
                                ) {

                                    var clis = list[j].clientes;

                                    // Verifica a presença do cliente, caso o mês atual no laço seja um dos 2 anteriores
                                    for(var k in clis) {
                                        if(clis[k].id === clientes[i].id){
                                            clientesInvalidos.push(clientes[i].nome);
                                        }
                                    }
                                }
                            }
                        }
                        requisicaoOk = true;
                    },
                    fail: function(data) {
                        alert('Ocorreu um erro ao comunicar com o servidor. Tente novamente.');
                        btn.removeAttribute('disabled');
                    }
                });



                // Espera a requisição AJAX anterior
                var timer = setInterval(function () {
                    if (requisicaoOk) {
                        clearInterval(timer);

                        // Gera uma string com os clientes inválidos, caso haja, e mostra a mensagem de erro
                        if(clientesInvalidos.length > 0) {
                            var listaclientes = '';
                            for(i in clientesInvalidos) {
                                listaclientes += '\n- '+clientesInvalidos[i];
                            }

                            alert("Os seguintes clientes participaram de avaliações dentro dos 2 meses anteriores e " +
                                "não podem realizá-la no momento:\n" + listaclientes);
                            btn.removeAttribute('disabled');
                        }

                        // Se não encontrar nenhum problema, envia os dados para inserir
                        else {
                            // Envia os dados
                            app.ajax({
                                url: apiUrl+'evaluations',
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

                                    for (i in campos) {
                                        if(campos[i].type === 'number')
                                            campos[i].value = '';

                                        if(campos[i].type === 'checkbox')
                                            campos[i].checked = false;
                                    }
                                },
                                fail: function(data) {
                                    console.log(data);
                                    btn.removeAttribute('disabled');
                                    alert('Houve um erro ao enviar os dados. Tente novamente.');
                                }
                            });
                        }
                    }
                }, 20);
            }

        });


    } // JS function to be executed when the page is loaded.
};