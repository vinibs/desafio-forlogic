page = { // The variable 'page' must receive the object with the page data

    title: 'Desafio 4 Devs', // Page title to be shown in the browser
    pageFile: 'avaliar.page.html', // Relative to this JS file
    handler: function() {
        var btn = document.getElementsByTagName('button')[0];
        var selectAvaliacoes = document.getElementById('avaliacao');
        var selectClientes = document.getElementById('cliente');
        var questoes = document.getElementById('questoes');
        var lista = [];
        var avaliacao = {};
        var idCliente;
        var idAvaliacao;

        // Obtenção e exibição de dados
        app.ajax({
            url: apiUrl+'evaluations',
            headers: {'Authorization':appname},
            beforeSend: function() {
                btn.setAttribute('disabled', true);
                selectAvaliacoes.innerHTML = '';
                var opt = document.createElement('option');
                opt.value = '';
                opt.disabled = true;
                opt.innerText = 'Carregando...';
                selectAvaliacoes.appendChild(opt);
                selectAvaliacoes.disabled = true;
            },
            success: function(data) {
                // Obtém a lista de avaliações e adiciona ao select
                if(data.response !== '')
                    lista = JSON.parse(data.response);

                selectAvaliacoes.innerHTML = '';
                selectAvaliacoes.disabled = false;

                var optSelected = document.createElement('option');
                optSelected.value = '';
                optSelected.disabled = true;
                optSelected.selected = true;
                optSelected.innerText = 'Escolha uma avaliação...';
                selectAvaliacoes.appendChild(optSelected);

                for (var i in lista) {
                    var opt = document.createElement('option');
                    opt.value = i;
                    opt.innerText = lista[i].mes + '/' + lista[i].ano;
                    selectAvaliacoes.appendChild(opt);
                }

                //btn.removeAttribute('disabled');
            }
        });


        selectAvaliacoes.addEventListener('change', function() {
            // Preenche o select de clientes com os clientes que ainda não deram sua nota
            var selected = this.value;
            idAvaliacao = selected;

            selectClientes.innerHTML = '';
            selectClientes.disabled = false;

            var optSelected = document.createElement('option');
            optSelected.value = '';
            optSelected.disabled = true;
            optSelected.selected = true;
            optSelected.innerText = 'Escolha um cliente...';
            selectClientes.appendChild(optSelected);

            avaliacao = lista[selected];

            for (var i in lista[selected].clientes) {
                if(!lista[selected].clientes[i].nota) {
                    var opt = document.createElement('option');
                    opt.value = i;
                    opt.innerText = lista[selected].clientes[i].nome;
                    selectClientes.appendChild(opt);
                }
            }
        });



        selectClientes.addEventListener('change', function() {
            idCliente = this.value;

            questoes.removeAttribute('style');
            btn.removeAttribute('disabled');
        });


        // Envio de dados
        btn.addEventListener('click', function() {
            btn.setAttribute('disabled', true);

            var campos = document.getElementsByTagName('input');
            var camposOk = true;

            // Realiza algumas validações
            for (var i = 0; i < campos.length; i++){
                if(campos[i].value === '')
                    camposOk = false;
            }

            // Realiza validações básicas nos campos
            if(!camposOk){
                alert("Todos os campos devem ser preenchidos");
                btn.removeAttribute('disabled');
            }

            // Passou das validações básicas
            else {

                // // Organiza os dados a enviar para o BD
                var nota = document.getElementById("nota").value;
                var motivo = document.getElementById("motivo").value;

                avaliacao.clientes[idCliente]['nota'] = nota;
                avaliacao.clientes[idCliente]['motivo'] = motivo;


                // Obtém o usuário para atualizar a última nota dada
                app.ajax({
                    url: apiUrl + 'customers/' + avaliacao.clientes[idCliente].id,
                    headers: {'Authorization': appname},
                    success: function (data) {
                        var cliente = {};

                        if(data.response !== '')
                            cliente = JSON.parse(data.response);

                        cliente.avaliacao = nota;

                        app.ajax({
                            url: apiUrl + 'customers/' + avaliacao.clientes[idCliente].id,
                            method: 'put',
                            data: cliente,
                            contentType: 'application/json; charset=utf-8',
                            headers: {'Authorization': appname},
                            success: function(data) {
                                console.log(data.status);
                            }
                        })
                    }
                });

                // Atualiza os dados da avaliação
                app.ajax({
                    url: apiUrl + 'evaluations/' + idAvaliacao,
                    method: 'put',
                    data: avaliacao,
                    contentType: 'application/json; charset=utf-8',
                    headers: {'Authorization': appname},
                    success: function(data) {

                        if(data.status === 200){
                            alert("A avaliação foi registrada!");
                            btn.removeAttribute('disabled');

                            var campos = document.getElementsByTagName('input');
                            for(i in campos) {
                                campos[i].value = '';
                            }

                            selectAvaliacoes.dispatchEvent(new Event('change'));
                        }
                    }
                })
            }

        });

    } // JS function to be executed when the page is loaded.
};